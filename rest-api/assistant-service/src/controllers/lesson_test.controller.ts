import { Prisma, type LessonTestChunkGroup } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '~/dto/response/send-response';
import ApiError from '~/middleware/ApiError';
import lessonTestService from '~/service/lessonTest/lessonTest.service';
import lessonTestGenerationService from '~/service/lessonTest/lessonTestGeneration.service';
import analysisQuizService from '~/service/analysis/quiz.service';
import {
  BulkGenerateLessonTestDto,
  CreateLessonTestChunkGroupDto,
  PutLessonTestDto,
} from '~/dto/request/lesson-test.dto';

import { parseJobIdsFromQuery } from '~/utils/queryParams.util';

class LessonTestController {
  getLessonTest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lessonId = String(req.params.lessonId);
      const bundle = await lessonTestService.getLessonTestBundle(lessonId);
      if (!bundle) {
        sendResponse(res, {
          code: StatusCodes.NOT_FOUND,
          message: 'Lesson test blueprint not found',
          result: null,
        });
        return;
      }

      const hints = await lessonTestGenerationService.generationHintsForLesson(lessonId, bundle.chunkGroups);

      const chunkGroups = bundle.chunkGroups.map((group: LessonTestChunkGroup) => {
        const h = hints.get(group.id) ?? { state: 'idle', jobId: null };
        return {
          id: group.id,
          lessonId: group.lessonId,
          chunkIds: lessonTestService.parseStoredChunkIds(group.chunkIds),
          questionCount: group.questionCount,
          label: group.label,
          distribution: group.distribution,
          batchUserPrompt: group.batchUserPrompt,
          createdAt: group.createdAt.toISOString(),
          updatedAt: group.updatedAt.toISOString(),
          generation: {
            state: h.state,
            jobId: h.jobId,
            ...(h.lastError ? { lastError: h.lastError } : {}),
          },
        };
      });

      const quizzes = await analysisQuizService.getQuizzesForLessonTestLesson(lessonId);

      sendResponse(res, {
        code: StatusCodes.OK,
        message: 'OK',
        result: {
          lessonTest: {
            lessonId: bundle.lessonId,
            title: bundle.title,
            status: bundle.status,
            targetTotalQuestions: bundle.targetTotalQuestions,
            notes: bundle.notes,
            createdBy: bundle.createdBy,
            createdAt: bundle.createdAt.toISOString(),
            updatedAt: bundle.updatedAt.toISOString(),
          },
          chunkGroups,
          quizzes,
        },
      });
    } catch (e) {
      next(e);
    }
  };

  putLessonTest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lessonId = String(req.params.lessonId);
      const userId = String(req.user?.sub);
      const body = req.data as PutLessonTestDto;

      const lessonTest = await lessonTestService.upsertLessonTestHeader(lessonId, userId, {
        title: body.title,
        status: body.status,
        targetTotalQuestions: body.targetTotalQuestions,
        notes: body.notes,
      });

      sendResponse(res, {
        code: StatusCodes.OK,
        message: 'Lesson test saved',
        result: {
          lessonId: lessonTest.lessonId,
          title: lessonTest.title,
          status: lessonTest.status,
          targetTotalQuestions: lessonTest.targetTotalQuestions,
          notes: lessonTest.notes,
          createdBy: lessonTest.createdBy,
          createdAt: lessonTest.createdAt.toISOString(),
          updatedAt: lessonTest.updatedAt.toISOString(),
        },
      });
    } catch (e) {
      next(e);
    }
  };

  deleteLessonTest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lessonId = String(req.params.lessonId);
      await lessonTestService.deleteLessonTest(lessonId);
      res.sendStatus(StatusCodes.NO_CONTENT);
    } catch (e) {
      next(e);
    }
  };

  postBulkGenerateQuizzes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lessonId = String(req.params.lessonId);
      const userId = String(req.user?.sub);
      const body = req.data as BulkGenerateLessonTestDto;

      const bundle = await lessonTestService.getLessonTestBundle(lessonId);
      if (!bundle) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Lesson test blueprint not found');
      }

      const jobs = await lessonTestGenerationService.enqueueBulkGroupQuizJobs(
        lessonId,
        userId,
        bundle.chunkGroups,
        body.groupIds
      );

      sendResponse(res, {
        code: StatusCodes.ACCEPTED,
        message: 'Generation queued',
        result: { jobs },
      });
    } catch (e) {
      next(e);
    }
  };

  getBulkGenerationStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lessonId = String(req.params.lessonId);
      const jobIds = parseJobIdsFromQuery(req);
      if (jobIds.length === 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'At least one jobId query parameter is required');
      }
      const uniq = new Set(jobIds);
      if (uniq.size !== jobIds.length) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Duplicate jobId in query');
      }

      const items = await lessonTestGenerationService.getJobsSnapshot(lessonId, jobIds);
      sendResponse(res, {
        code: StatusCodes.OK,
        message: 'OK',
        result: { items },
      });
    } catch (e) {
      next(e);
    }
  };

  postChunkGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lessonId = String(req.params.lessonId);
      const userId = String(req.user?.sub);
      const body = req.data as CreateLessonTestChunkGroupDto;

      const row = await lessonTestService.createChunkGroup(lessonId, userId, {
        chunkIds: body.chunkIds,
        questionCount: body.questionCount,
        label: body.label,
        distribution:
          body.distribution === undefined ? undefined : (body.distribution as Prisma.InputJsonValue),
        batchUserPrompt: body.batchUserPrompt,
      });

      sendResponse(res, {
        code: StatusCodes.CREATED,
        message: 'Chunk group created',
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

}

export default new LessonTestController();
