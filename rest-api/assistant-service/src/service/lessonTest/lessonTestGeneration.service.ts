import { StatusCodes } from 'http-status-codes';
import ApiError from '~/middleware/ApiError';
import redisService from '~/service/utils/redis.service';
import { bullQueueService } from '~/service/utils/bullQueue.service';
import { BullJobType } from '~/enums/bullJobType.enum';
import Logger from '~/utils/logger';
import {
  LessonTestGroupQuizJobData,
  LessonTestGroupQuizJobProcessor,
} from '~/service/jobs/lessonTestGroupQuizJob.processor';
import { LessonTestGenWaitOutcomeKind } from '~/enums/lessonTestGenWaitOutcome.enum';
import { LessonTestGenerationJobSnapshotStatus } from '~/enums/lessonTestGenerationJobSnapshot.enum';

const ACTIVE_TTL_SEC = 7200;

/** Cached outcome written by `LessonTestGroupQuizJobProcessor` (`ltg:result:${jobId}`). */
type LessonTestRedisJobPayload = {
  status: string;
  groupId?: string;
  lessonId?: string;
  createdCount?: number;
  quizIds?: string[];
  reason?: string;
};

export type LessonTestJobSnapshotItem = {
  groupId: string;
  jobId: string;
  status: LessonTestGenerationJobSnapshotStatus;
  createdCount?: number;
  quizIds?: string[];
  reason?: string;
};

/** Minimal row shape for bulk enqueue selection. */
export type LessonTestChunkGroupEnqueueRow = { id: string; questionCount: number };

export class LessonTestGenerationService {
  /**
   * Validates optional subset filter and drops groups with `questionCount === 0`.
   */
  validateAndPickChunkGroupsForEnqueue(
    chunkGroups: LessonTestChunkGroupEnqueueRow[],
    filterGroupIds?: string[]
  ): LessonTestChunkGroupEnqueueRow[] {
    let targets = chunkGroups;
    if (filterGroupIds && filterGroupIds.length > 0) {
      const set = new Set(filterGroupIds);
      targets = chunkGroups.filter((g) => set.has(g.id));
      if (targets.length !== filterGroupIds.length) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'One or more groupIds are invalid');
      }
    }

    targets = targets.filter((g) => g.questionCount > 0);
    if (targets.length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'No chunk groups to generate (questionCount must be >= 1)'
      );
    }
    return targets;
  }

  /**
   * Bulk enqueue: one Bull job per group; prompt, counts, and distribution come from each DB row (no shared bulk userPrompt).
   */
  async enqueueBulkGroupQuizJobs(
    lessonId: string,
    userId: string,
    chunkGroups: LessonTestChunkGroupEnqueueRow[],
    filterGroupIds?: string[]
  ): Promise<Array<{ groupId: string; jobId: string }>> {
    const targets = this.validateAndPickChunkGroupsForEnqueue(chunkGroups, filterGroupIds);
    const jobs: Array<{ groupId: string; jobId: string }> = [];
    for (const g of targets) {
      const jobId = await this.enqueueGroupQuizJob(lessonId, g.id, userId);
      jobs.push({ groupId: g.id, jobId });
    }
    return jobs;
  }

  async assertNoConcurrentJob(lessonId: string, groupId: string): Promise<void> {
    const key = LessonTestGroupQuizJobProcessor.activeKey(lessonId, groupId);
    const existing = await redisService.get<{ jobId: string }>(key);
    if (!existing?.jobId) return;

    const job = await bullQueueService.lessonTestGroupQuizQueue.getJob(existing.jobId);
    const state = job ? await job.getState() : null;
    if (state === 'active' || state === 'waiting' || state === 'delayed') {
      throw new ApiError(
        StatusCodes.CONFLICT,
        `Generation already in progress for group ${groupId}`
      );
    }
    await redisService.del(key);
  }

  /**
   * Enqueues a lesson-test chunk-group quiz generation job.
   * Optional `requestUserPrompt` is for the single-group HTTP route only; the processor merges it with the row's `batchUserPrompt`.
   */
  async enqueueGroupQuizJob(
    lessonId: string,
    groupId: string,
    userId: string,
    requestUserPrompt?: string
  ): Promise<string> {
    await this.assertNoConcurrentJob(lessonId, groupId);

    const data: LessonTestGroupQuizJobData = {
      lessonId,
      groupId,
      userId,
      userPrompt: requestUserPrompt,
    };

    const job = await bullQueueService.lessonTestGroupQuizQueue.add(
      BullJobType.LESSON_TEST_GROUP_QUIZ,
      data,
      {
        jobId: `ltg-${groupId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      }
    );

    const jobId = String(job.id);
    await redisService.set(
      LessonTestGroupQuizJobProcessor.activeKey(lessonId, groupId),
      { jobId },
      ACTIVE_TTL_SEC
    );
    Logger.info(`[LessonTestGenerationService] Enqueued jobId=${jobId} groupId=${groupId}`);
    return jobId;
  }

  /**
   * Bull + Redis snapshot cho một job (bulk GET status).
   */
  private async buildJobSnapshotItem(lessonId: string, jobId: string): Promise<LessonTestJobSnapshotItem> {
    const cached = await redisService.get<LessonTestRedisJobPayload>(
      LessonTestGroupQuizJobProcessor.resultKey(jobId)
    );

    if (cached?.lessonId && cached.lessonId !== lessonId) {
      throw new ApiError(StatusCodes.FORBIDDEN, `jobId ${jobId} does not belong to this lesson`);
    }

    if (cached?.status === LessonTestGenWaitOutcomeKind.COMPLETED) {
      return {
        groupId: cached.groupId ?? '',
        jobId,
        status: LessonTestGenerationJobSnapshotStatus.COMPLETED,
        createdCount: cached.createdCount,
        quizIds: cached.quizIds,
      };
    }
    if (cached?.status === LessonTestGenWaitOutcomeKind.FAILED) {
      return {
        groupId: cached.groupId ?? '',
        jobId,
        status: LessonTestGenerationJobSnapshotStatus.FAILED,
        reason: cached.reason,
      };
    }

    const job = await bullQueueService.lessonTestGroupQuizQueue.getJob(jobId);
    if (!job) {
      return {
        groupId: '',
        jobId,
        status: LessonTestGenerationJobSnapshotStatus.FAILED,
        reason: 'Job not found',
      };
    }

    const data = job.data as LessonTestGroupQuizJobData;
    if (data.lessonId !== lessonId) {
      throw new ApiError(StatusCodes.FORBIDDEN, `jobId ${jobId} does not belong to this lesson`);
    }

    const state = await job.getState();
    let status: LessonTestGenerationJobSnapshotStatus =
      LessonTestGenerationJobSnapshotStatus.PROCESSING;
    if (state === 'waiting' || state === 'delayed') {
      status = LessonTestGenerationJobSnapshotStatus.QUEUED;
    } else if (state === 'completed') {
      status = LessonTestGenerationJobSnapshotStatus.COMPLETED;
    } else if (state === 'failed') {
      status = LessonTestGenerationJobSnapshotStatus.FAILED;
    }

    return {
      groupId: data.groupId,
      jobId,
      status,
    };
  }

  /**
   * Immediate snapshot for many jobs (no long-poll).
   */
  async getJobsSnapshot(lessonId: string, jobIds: string[]): Promise<LessonTestJobSnapshotItem[]> {
    const items: LessonTestJobSnapshotItem[] = [];
    for (const jobId of jobIds) {
      items.push(await this.buildJobSnapshotItem(lessonId, jobId));
    }
    return items;
  }

  /**
   * Builds per-group `generation` hints for GET bundle; uses the same rules as `buildJobSnapshotItem`.
   * Deletes stale `ltg:active` when the job is gone or the snapshot groupId mismatches (orphaned Redis).
   */
  async generationHintsForLesson(
    lessonId: string,
    groups: Array<{ id: string }>
  ): Promise<Map<string, { state: string; jobId: string | null; lastError?: string }>> {
    const map = new Map<string, { state: string; jobId: string | null; lastError?: string }>();

    for (const g of groups) {
      const activeKey = LessonTestGroupQuizJobProcessor.activeKey(lessonId, g.id);
      const active = await redisService.get<{ jobId: string }>(activeKey);

      if (!active?.jobId) {
        map.set(g.id, { state: 'idle', jobId: null });
        continue;
      }

      const jobId = active.jobId;
      const item = await this.buildJobSnapshotItem(lessonId, jobId);

      const wrongGroup = item.groupId !== '' && item.groupId !== g.id;
      const orphanJob =
        item.status === LessonTestGenerationJobSnapshotStatus.FAILED &&
        item.reason === 'Job not found';

      if (wrongGroup || orphanJob) {
        await redisService.del(activeKey);
        Logger.warn(
          `[LessonTestGenerationService] Cleared stale ltg:active lessonId=${lessonId} groupId=${g.id} jobId=${jobId}`
        );
        map.set(g.id, { state: 'idle', jobId: null });
        continue;
      }

      switch (item.status) {
        case LessonTestGenerationJobSnapshotStatus.FAILED:
          map.set(g.id, {
            state: 'failed',
            jobId,
            lastError: item.reason,
          });
          break;
        case LessonTestGenerationJobSnapshotStatus.COMPLETED:
          map.set(g.id, { state: 'completed', jobId });
          break;
        case LessonTestGenerationJobSnapshotStatus.QUEUED:
          map.set(g.id, { state: 'queued', jobId });
          break;
        case LessonTestGenerationJobSnapshotStatus.PROCESSING:
          map.set(g.id, { state: 'processing', jobId });
          break;
        default:
          map.set(g.id, { state: 'idle', jobId: null });
      }
    }

    return map;
  }
}

export default new LessonTestGenerationService();
