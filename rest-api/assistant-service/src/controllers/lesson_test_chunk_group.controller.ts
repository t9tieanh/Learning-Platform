import { Prisma } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '~/dto/response/send-response';
import ApiError from '~/middleware/ApiError';
import lessonTestService from '~/service/lessonTest/lessonTest.service';
import lessonTestGenerationService from '~/service/lessonTest/lessonTestGeneration.service';
import lessonTestJobWaitService from '~/service/lessonTest/lessonTestJobWait.service';
import { LessonTestGenWaitOutcomeKind } from '~/enums/lessonTestGenWaitOutcome.enum';
import {
  GenerateLessonTestGroupQuizzesDto,
  PatchLessonTestChunkGroupDto,
} from '~/dto/request/lesson-test.dto';

class LessonTestChunkGroupController {
  patchChunkGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lessonId = String(req.params.lessonId);
      const groupId = String(req.params.groupId);
      const body = req.data as PatchLessonTestChunkGroupDto;
      if (
        body.chunkIds === undefined &&
        body.questionCount === undefined &&
        body.label === undefined &&
        body.distribution === undefined &&
        body.batchUserPrompt === undefined
      ) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'No fields to update');
      }

      const row = await lessonTestService.updateChunkGroup(lessonId, groupId, {
        chunkIds: body.chunkIds,
        questionCount: body.questionCount,
        label: body.label,
        ...(body.distribution !== undefined
          ? { distribution: body.distribution as Prisma.InputJsonValue }
          : {}),
        batchUserPrompt: body.batchUserPrompt,
      });

      sendResponse(res, {
        code: StatusCodes.OK,
        message: 'Chunk group updated',
        result: {
          id: row.id,
          lessonId: row.lessonId,
          chunkIds: lessonTestService.parseStoredChunkIds(row.chunkIds),
          questionCount: row.questionCount,
          label: row.label,
          distribution: row.distribution,
          batchUserPrompt: row.batchUserPrompt,
          createdAt: row.createdAt.toISOString(),
          updatedAt: row.updatedAt.toISOString(),
        },
      });
    } catch (e) {
      next(e);
    }
  };

  deleteChunkGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lessonId = String(req.params.lessonId);
      const groupId = String(req.params.groupId);
      await lessonTestService.deleteChunkGroup(lessonId, groupId);
      res.sendStatus(StatusCodes.NO_CONTENT);
    } catch (e) {
      next(e);
    }
  };

  postGenerateQuizzes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lessonId = String(req.params.lessonId);
      const groupId = String(req.params.groupId);
      const userId = String(req.user?.sub);
      const body = req.data as GenerateLessonTestGroupQuizzesDto;

      await lessonTestService.assertChunkGroupExists(lessonId, groupId);
      const jobId = await lessonTestGenerationService.enqueueGroupQuizJob(
        lessonId,
        groupId,
        userId,
        body.userPrompt
      );

      sendResponse(res, {
        code: StatusCodes.ACCEPTED,
        message: 'Generation queued',
        result: { groupId, jobId },
      });
    } catch (e) {
      next(e);
    }
  };

  getGenerateQuizzesStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const lessonId = String(req.params.lessonId);
      const groupId = String(req.params.groupId);
      const jobId = String(req.query.jobId ?? '');
      if (!jobId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'jobId query parameter is required');
      }

      const abort = new AbortController();
      req.on('close', () => abort.abort());

      const wait = await lessonTestJobWaitService.waitForGroupQuizJob(
        lessonId,
        groupId,
        jobId,
        abort.signal
      );

      switch (wait.outcome) {
        case LessonTestGenWaitOutcomeKind.ABORTED:
          return;
        case LessonTestGenWaitOutcomeKind.COMPLETED:
          sendResponse(res, {
            code: StatusCodes.OK,
            message: 'Generation completed',
            result: {
              status: LessonTestGenWaitOutcomeKind.COMPLETED,
              createdCount: wait.createdCount,
              quizIds: wait.quizIds,
            },
          });
          return;
        case LessonTestGenWaitOutcomeKind.FAILED:
          sendResponse(res, {
            code: StatusCodes.OK,
            message: wait.reason,
            result: {
              status: LessonTestGenWaitOutcomeKind.FAILED,
              reason: wait.reason,
            },
          });
          return;
        case LessonTestGenWaitOutcomeKind.PROCESSING:
          sendResponse(res, {
            code: StatusCodes.ACCEPTED,
            message: 'Still processing',
            result: { status: LessonTestGenWaitOutcomeKind.PROCESSING },
          });
          return;
      }
    } catch (e) {
      next(e);
    }
  };
}

export default new LessonTestChunkGroupController();
