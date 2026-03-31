import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import ApiError from './ApiError';
import courseClient from '~/grpc/courseClient.grpc';
import Logger from '~/utils/logger';

/**
 * Middleware to verify that user is enrolled in the course (can view lesson).
 * 
 * Prerequisites:
 * - Authentication middleware should run first
 * - lessonId should be available in req.params.lessonId
 * 
 * Behavior:
 * 1. Extract userId from req.user.sub
 * 2. Call gRPC courseService.canViewLesson()
 * 3. Return 403 if user is not enrolled
 * 4. Call next() if enrolled
 */
export const checkViewLesson = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { lessonId } = req.params;
        const userId = req.user?.sub;

        if (!userId) {
            return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized: Thiếu thông tin người dùng'));
        }

        if (!lessonId) {
            return next(new ApiError(StatusCodes.BAD_REQUEST, 'Bad Request: Lesson ID là bắt buộc'));
        }

        // Call gRPC to check if user can view lesson (enrolled in course)
        const canView = await courseClient.canViewLesson(lessonId as string, userId);

        if (!canView) {
            Logger.warn(
                `[CheckViewLesson] User ${userId} cannot view lesson ${lessonId} – not enrolled in course`
            );
            return next(new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: Bạn chưa mua khóa học này'));
        }

        Logger.info(
            `[CheckViewLesson] User ${userId} verified to view lesson ${lessonId}`
        );

        next();
    } catch (error: any) {
        Logger.error(`[CheckViewLesson] Error: ${error}`);
        next(new ApiError(error.status || StatusCodes.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error'));
    }
};
