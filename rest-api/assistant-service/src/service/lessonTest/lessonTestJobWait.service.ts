import Logger from '~/utils/logger';
import redisService from '~/service/utils/redis.service';
import {
  LessonTestGroupQuizJobData,
  LessonTestGroupQuizJobProcessor,
} from '~/service/jobs/lessonTestGroupQuizJob.processor';
import { bullQueueService } from '~/service/utils/bullQueue.service';

import {
  LessonTestGenWaitOutcome,
  LessonTestGenWaitOutcomeKind,
} from '~/enums/lessonTestGenWaitOutcome.enum';

/** Max ms to hold chunk-group generation status long-poll open */
export const LESSON_TEST_GEN_LONG_POLL_MS = 25_000;

export class LessonTestJobWaitService {
  async waitForGroupQuizJob(
    lessonId: string,
    groupId: string,
    jobId: string,
    signal?: AbortSignal
  ): Promise<LessonTestGenWaitOutcome> {
    const cached = await redisService.get<{
      status: string;
      lessonId?: string;
      groupId?: string;
      createdCount?: number;
      quizIds?: string[];
      reason?: string;
    }>(LessonTestGroupQuizJobProcessor.resultKey(jobId));

    if (cached?.status === LessonTestGenWaitOutcomeKind.COMPLETED) {
      return {
        outcome: LessonTestGenWaitOutcomeKind.COMPLETED,
        createdCount: cached.createdCount,
        quizIds: cached.quizIds,
      };
    }
    if (cached?.status === LessonTestGenWaitOutcomeKind.FAILED) {
      return { outcome: LessonTestGenWaitOutcomeKind.FAILED, reason: cached.reason || 'Failed' };
    }

    const job = await bullQueueService.lessonTestGroupQuizQueue.getJob(jobId);
    if (!job) {
      return { outcome: LessonTestGenWaitOutcomeKind.FAILED, reason: 'Job not found' };
    }

    const data = job.data as LessonTestGroupQuizJobData;
    if (data.lessonId !== lessonId || data.groupId !== groupId) {
      return { outcome: LessonTestGenWaitOutcomeKind.FAILED, reason: 'jobId does not match lesson/group' };
    }

    Logger.info(`[LessonTestJobWaitService] Long-poll started jobId=${jobId}`);

    return new Promise<LessonTestGenWaitOutcome>((resolve) => {
      const channel = LessonTestGroupQuizJobProcessor.genChannel(jobId);
      const subscriber = redisService.createSubscriber();
      let settled = false;

      const cleanup = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutHandle);
        subscriber.unsubscribe(channel).catch(() => {});
        subscriber.disconnect();
      };

      const settle = (result: LessonTestGenWaitOutcome) => {
        cleanup();
        resolve(result);
      };

      signal?.addEventListener('abort', () => {
        if (!settled) {
          Logger.info(`[LessonTestJobWaitService] Aborted jobId=${jobId}`);
          settle({ outcome: LessonTestGenWaitOutcomeKind.ABORTED });
        }
      });

      const timeoutHandle = setTimeout(() => {
        Logger.info(`[LessonTestJobWaitService] Timeout jobId=${jobId}`);
        settle({ outcome: LessonTestGenWaitOutcomeKind.PROCESSING });
      }, LESSON_TEST_GEN_LONG_POLL_MS);

      subscriber
        .subscribe(channel)
        .then(() => {
          subscriber.on('message', async (_chan: string, message: string) => {
            if (settled) return;
            try {
              const payload = JSON.parse(message) as {
                status?: string;
                createdCount?: number;
                quizIds?: string[];
                reason?: string;
              };
              if (payload.status === LessonTestGenWaitOutcomeKind.FAILED) {
                settle({ outcome: LessonTestGenWaitOutcomeKind.FAILED, reason: payload.reason || 'Failed' });
                return;
              }
              if (payload.status === LessonTestGenWaitOutcomeKind.COMPLETED) {
                settle({
                  outcome: LessonTestGenWaitOutcomeKind.COMPLETED,
                  createdCount: payload.createdCount,
                  quizIds: payload.quizIds,
                });
              }
            } catch (err) {
              Logger.error(`[LessonTestJobWaitService] Message error: ${err}`);
              settle({ outcome: LessonTestGenWaitOutcomeKind.PROCESSING });
            }
          });
        })
        .catch((err) => {
          Logger.error(`[LessonTestJobWaitService] Redis subscribe error: ${err}`);
          settle({ outcome: LessonTestGenWaitOutcomeKind.PROCESSING });
        });
    });
  }
}

export default new LessonTestJobWaitService();
