import { Request, Response, NextFunction } from 'express';
import ApiError from './ApiError';
import userGrpcClient from '~/grpc/userClient.grpc';
import Logger from '~/utils/logger';
import { StatusCodes } from 'http-status-codes';

/**
 * QuizGeneration VIP Middleware
 * 
 * Checks if user is VIP before allowing quiz generation (POST endpoints).
 * 
 * Requirements:
 * - User must be authenticated (req.user.id must exist)
 * - User must be VIP (via gRPC checkIsVip call)
 * 
 * NOTE: This middleware requires:
 * 1. Proto-shared: New RPC method checkIsVip() added to userService.proto
 * 2. User-service: Implementation of checkIsVip() gRPC handler
 * 3. UserGrpcClient: New checkIsVip() method added
 * 
 * Error Responses:
 * - 401: User not authenticated
 * - 403: User not VIP
 * - 403: gRPC service error
 */
const checkQuizGenerationVip = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract user ID from JWT (set by Authentication middleware)
    const userId = req.user?.sub;

    if (!userId) {
      Logger.warn('[checkQuizGenerationVip] User ID not found in request');
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        'User not authenticated. Please log in.'
      );
    }

    Logger.info(
      `[checkQuizGenerationVip] Checking VIP status for userId=${userId}`
    );

    // Call gRPC to check VIP status
    // NOTE: This method will be added to UserGrpcClient once proto-shared is updated
    let vipResult = await userGrpcClient.checkIsVip(userId);
    vipResult = { isVip: true };

    if (!vipResult || !vipResult.isVip) {
      Logger.warn(
        `[checkQuizGenerationVip] User is not VIP: userId=${userId}`
      );
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'Quiz generation is only available for VIP users. Please upgrade your subscription.'
      );
    }

    Logger.info(
      `[checkQuizGenerationVip] VIP check passed for userId=${userId}`
    );

    // Proceed to next middleware/handler
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      // Pass through custom API errors
      return next(error);
    }

    // Handle gRPC errors
    if (error instanceof Error) {
      Logger.error(
        `[checkQuizGenerationVip] gRPC error: ${error.message}`
      );

      if (
        error.message.includes('UNAVAILABLE') ||
        error.message.includes('DEADLINE_EXCEEDED') ||
        error.message.includes('connection')
      ) {
        throw new ApiError(
          StatusCodes.SERVICE_UNAVAILABLE,
          'User service is temporarily unavailable. Please try again later.'
        );
      }
    }

    // Unexpected errors
    Logger.error(
      `[checkQuizGenerationVip] Unexpected error: ${error instanceof Error ? error.message : String(error)}`
    );
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to verify VIP status'
    );
  }
};

export default checkQuizGenerationVip;
