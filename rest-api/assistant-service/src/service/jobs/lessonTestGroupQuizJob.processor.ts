import Logger from '~/utils/logger';
import prismaService from '~/service/utils/prisma.service';
import redisService from '~/service/utils/redis.service';
import { bullQueueService } from '~/service/utils/bullQueue.service';
import { BullJobType } from '~/enums/bullJobType.enum';
import { BullJobDTO } from '~/dto/job/bulljob.dto';
import quizGenerationService from '~/service/analysis/quizGeneration.service';
import quizPersistenceService from '~/service/quizz/quizPersistence.service';
import lessonTestMergedContextService from '~/service/lessonTest/lessonTestMergedContext.service';
import { GenerateBatchQuizzesDto, QuizDistribution } from '~/dto/request/quiz-generation.dto';
import { DifficultyLevel, BloomLevel } from '~/enums/quizStatus.enum';
import { LessonTestGenWaitOutcomeKind } from '~/enums/lessonTestGenWaitOutcome.enum';

export interface LessonTestGroupQuizJobData {
  lessonId: string;
  groupId: string;
  userId: string;
  userPrompt?: string;
}

export class LessonTestGroupQuizJobProcessor {
  /** Redis TTL for cached job outcome payloads (`ltg:result:*`). */
  static readonly RESULT_TTL_SEC = 600;

  /** Pub/sub channel for long-poll subscribers: `lesson-test-group-gen:${jobId}`. */
  static genChannel(jobId: string): string {
    return `lesson-test-group-gen:${jobId}`;
  }

  /** Redis key marking an active generation for `(lessonId, groupId)`. */
  static activeKey(lessonId: string, groupId: string): string {
    return `ltg:active:${lessonId}:${groupId}`;
  }

  /** Redis key for completed/failed job snapshot: `ltg:result:${jobId}`. */
  static resultKey(jobId: string): string {
    return `ltg:result:${jobId}`;
  }

  private batchDtoFromGroup(
    questionCount: number,
    distributionJson: unknown,
    batchUserPrompt: string | null,
    requestUserPrompt?: string
  ): GenerateBatchQuizzesDto {
    const mergedUser = [requestUserPrompt, batchUserPrompt].filter(Boolean).join('\n').trim() || undefined;

    let distribution: QuizDistribution[] = [];
    if (distributionJson != null && Array.isArray(distributionJson)) {
      for (const row of distributionJson) {
        if (row && typeof row === 'object' && 'count' in row) {
          const r = row as Record<string, unknown>;
          distribution.push(
            new QuizDistribution(
              r.difficulty as DifficultyLevel | undefined,
              r.bloomLevel as BloomLevel | undefined,
              Number(r.count) || 1
            )
          );
        }
      }
    }

    const sum = distribution.reduce((s, d) => s + d.count, 0);
    if (distribution.length === 0 || sum !== questionCount) {
      distribution = [new QuizDistribution(DifficultyLevel.MEDIUM, BloomLevel.UNDERSTAND, questionCount)];
    }

    const dto = new GenerateBatchQuizzesDto(questionCount, distribution);
    if (mergedUser) dto.userPrompt = mergedUser;
    return dto;
  }

  async process(job: BullJobDTO<LessonTestGroupQuizJobData>): Promise<{ createdCount: number; quizIds: string[] }> {
    const { lessonId, groupId, userId, userPrompt } = job.data;
    const jobId = String(job.id);

    Logger.info(
      `[LessonTestGroupQuizJobProcessor] Starting jobId=${jobId} lessonId=${lessonId} groupId=${groupId}`
    );

    const group = await prismaService.lessonTestChunkGroup.findFirst({
      where: { id: groupId, lessonId },
    });

    if (!group) {
      throw new Error(`Chunk group not found: groupId=${groupId} lessonId=${lessonId}`);
    }

    const ids = lessonTestMergedContextService.parseChunkIds(group.chunkIds);
    if (ids.length === 0) {
      throw new Error('chunk_ids is empty');
    }
    if (ids.length > 3) {
      throw new Error('chunk_ids must contain at most 3 entries');
    }

    const chunks = await prismaService.lessonChunk.findMany({
      where: { id: { in: ids }, lessonId },
    });

    if (chunks.length !== ids.length) {
      throw new Error('One or more chunk IDs are invalid for this lesson');
    }

    const orderMap = new Map(ids.map((id, i) => [id, i]));
    chunks.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));

    const merged = lessonTestMergedContextService.buildMergedContextFromChunks(
      chunks.map((c) => ({
        id: c.id,
        summary: c.summary,
        content: c.content,
      }))
    );

    const lesson = await prismaService.lesson.findUnique({
      where: { id: lessonId },
      select: { summary: true },
    });

    const batchOpts = this.batchDtoFromGroup(
      group.questionCount,
      group.distribution,
      group.batchUserPrompt,
      userPrompt
    );

    const generated = await quizGenerationService.generateLessonTestGroupBatch(
      merged,
      lesson?.summary ?? '',
      batchOpts,
      'vi'
    );

    const saved = await quizPersistenceService.saveLessonTestBatchQuizzes(groupId, userId, generated);

    const quizIds = saved.map((q) => q.id);
    const payload = {
      status: LessonTestGenWaitOutcomeKind.COMPLETED,
      lessonId,
      groupId,
      jobId,
      createdCount: saved.length,
      quizIds,
    };

    await redisService.set(LessonTestGroupQuizJobProcessor.resultKey(jobId), payload, LessonTestGroupQuizJobProcessor.RESULT_TTL_SEC);
    await redisService.publish(LessonTestGroupQuizJobProcessor.genChannel(jobId), payload);
    await redisService.del(LessonTestGroupQuizJobProcessor.activeKey(lessonId, groupId));

    Logger.info(`[LessonTestGroupQuizJobProcessor] Completed jobId=${jobId} createdCount=${saved.length}`);

    return { createdCount: saved.length, quizIds };
  }

  register(): void {
    const processor = new LessonTestGroupQuizJobProcessor();

    bullQueueService.lessonTestGroupQuizQueue.process(
      BullJobType.LESSON_TEST_GROUP_QUIZ,
      2,
      async (job: BullJobDTO<LessonTestGroupQuizJobData>) => {
        const jobId = String(job.id);
        const { lessonId, groupId } = job.data;

        try {
          return await processor.process(job);
        } catch (error) {
          const reason = error instanceof Error ? error.message : String(error);
          Logger.error(`[LessonTestGroupQuizJobProcessor] jobId=${jobId} failed: ${reason}`);

          const failPayload = {
            status: LessonTestGenWaitOutcomeKind.FAILED,
            lessonId,
            groupId,
            jobId,
            reason,
          };
          await redisService.set(LessonTestGroupQuizJobProcessor.resultKey(jobId), failPayload, LessonTestGroupQuizJobProcessor.RESULT_TTL_SEC);
          await redisService.publish(LessonTestGroupQuizJobProcessor.genChannel(jobId), failPayload);
          await redisService.del(LessonTestGroupQuizJobProcessor.activeKey(lessonId, groupId));

          throw error;
        }
      }
    );

    Logger.info('[LessonTestGroupQuizProcessor] Registered with Bull queue');
  }
}

export const lessonTestGroupQuizJobProcessor = new LessonTestGroupQuizJobProcessor();

export function registerLessonTestGroupQuizProcessor(): void {
  lessonTestGroupQuizJobProcessor.register();
}
