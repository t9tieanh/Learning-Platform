import { Request, Response, NextFunction } from 'express';
import ApiError from '~/middleware/ApiError';
import prismaService from '~/service/utils/prisma.service';

/**
 * Loads `lessonId` from `LessonTestChunkGroup` by `req.params.groupId` and sets `req.params.lessonId`
 * so downstream `checkLessonOwnership` can run without `lessonId` in the URL.
 */
export const resolveLessonIdFromLessonTestChunkGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rawGroupId = req.params.groupId;
    const groupId = typeof rawGroupId === 'string' ? rawGroupId : rawGroupId?.[0];
    if (!groupId) {
      next(new ApiError(400, 'Bad Request: Group ID is required'));
      return;
    }

    const row = await prismaService.lessonTestChunkGroup.findUnique({
      where: { id: groupId },
      select: { lessonId: true },
    });

    if (!row) {
      next(new ApiError(404, 'Chunk group not found'));
      return;
    }

    req.params.lessonId = row.lessonId;
    next();
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    next(new ApiError(err.status ?? 500, err.message ?? 'Internal Server Error'));
  }
};
