import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '~/dto/response/send-response';
import quizService from '~/service/analysis/quiz.service';
import { GenerateQuizDto, GenerateBatchQuizzesDto } from '~/dto/request/quiz-generation.dto';
import { CreateManualQuizDto } from '~/dto/request/quiz-create.dto';
import { UpdateQuizDto, NormalizedQuizChoiceInput, UpdateQuizPersistPayload } from '~/dto/request/quiz-update.dto';
import { QuestionType } from '~/enums/quizStatus.enum';
import ApiError from '~/middleware/ApiError';

/**
 * QuizController handles quiz-related HTTP endpoints.
 * 
 * Endpoints:
 * - POST /generate - Generate a single quiz
 * - POST /generate-batch - Generate multiple quizzes
 * - GET /quizzes - List all quizzes for a chunk (NO pagination)
 * - GET /:quizId - Get a single quiz
 */
class QuizController {
  /**
   * POST /lessons/:lessonId/chunks/:chunkId/quizzes
   * 
   * Generates a single quiz for a lesson chunk.
   * 
   * Request Body:
   * {
   *   "difficulty": "EASY|MEDIUM|HARD",
   *   "bloomLevel": "REMEMBER|UNDERSTAND|APPLY|ANALYZE|EVALUATE|CREATE",
   *   "questionType": "MULTIPLE_CHOICE|TRUE_FALSE|SHORT_ANSWER"
   * }
   * 
   * Response:
   * {
   *   "code": 201,
   *   "message": "Quiz generated successfully",
   *   "result": {
   *     "id": "quiz-uuid",
   *     "question": "...",
   *     "explanation": "...",
   *     "type": "MULTIPLE_CHOICE",
   *     "difficulty": "MEDIUM",
   *     "bloomLevel": "UNDERSTAND",
   *     "choices": [
   *       { "id": "...", "text": "...", "isCorrect": true, "feedback": "..." }
   *     ]
   *   }
   * }
   */
  generateSingleQuiz = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const chunkId = String(req.params.chunkId);
      const userId = String(req.user?.sub); // From auth middleware

      if (!userId) {
        throw new ApiError(
          StatusCodes.UNAUTHORIZED,
          'User not authenticated'
        );
      }

      // Validate request body
      const options = req.body as GenerateQuizDto;

      if (!options.difficulty || !options.bloomLevel || !options.questionType) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Missing required fields: difficulty, bloomLevel, questionType'
        );
      }

      const quiz = await quizService.generateSingleQuiz(
        chunkId,
        userId,
        options
      );

      sendResponse(res, {
        code: StatusCodes.CREATED,
        message: 'Quiz generated successfully',
        result: this.formatQuiz(quiz),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /assistant/chunks/:chunkId/quizzes/manual
   */
  createManualQuiz = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const chunkId = String(req.params.chunkId);
      const userId = String(req.user?.sub);
      const body = req.body as CreateManualQuizDto;

      const choicesNorm: NormalizedQuizChoiceInput[] = (body.choices ?? []).map((c) => ({
        text: c.text.trim(),
        isCorrect: c.isCorrect,
        feedback: c.feedback ?? null,
      }));

      QuizController.assertObjectiveQuizChoices(body.type, choicesNorm);

      const quiz = await quizService.createManualQuiz(chunkId, userId, {
        ...body,
        choices: choicesNorm,
      });

      sendResponse(res, {
        code: StatusCodes.CREATED,
        message: 'Manual quiz created successfully',
        result: quiz,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /lessons/:lessonId/chunks/:chunkId/quizzes/batch
   * 
   * Generates multiple quizzes with distribution requirements.
   * 
   * Request Body:
   * {
   *   "count": 5,
   *   "distribution": [
   *     {
   *       "difficulty": "EASY",
   *       "bloomLevel": "REMEMBER",
   *       "count": 2
   *     },
   *     {
   *       "difficulty": "MEDIUM",
   *       "bloomLevel": "UNDERSTAND",
   *       "count": 3
   *     }
   *   ]
   * }
   * 
   * Response:
   * {
   *   "code": 201,
   *   "message": "Batch quizzes generated successfully",
   *   "result": {
   *     "count": 5,
   *     "quizzes": [ { quiz1 }, { quiz2 }, ... ]
   *   }
   * }
   */
  generateBatchQuizzes = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const chunkId = String(req.params.chunkId);
      const userId = String(req.user?.sub); // From auth middleware

      if (!userId) {
        throw new ApiError(
          StatusCodes.UNAUTHORIZED,
          'User not authenticated'
        );
      }

      // Validate request body
      const options = req.body as GenerateBatchQuizzesDto;

      if (!options.count || !Array.isArray(options.distribution)) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Missing required fields: count, distribution (array)'
        );
      }

      if (options.count < 1 || options.count > 50) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Count must be between 1 and 50'
        );
      }

      const quizzes = await quizService.generateBatchQuizzes(
        chunkId,
        userId,
        options
      );

      sendResponse(res, {
        code: StatusCodes.CREATED,
        message: 'Batch quizzes generated successfully',
        result: {
          count: quizzes.length,
          quizzes: quizzes.map(q => this.formatQuiz(q)),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /lessons/:lessonId/chunks/:chunkId/quizzes
   * 
   * Lists all quizzes for a lesson chunk (NO pagination).
   * Returns the quizzes array directly.
   * 
   * Response:
   * {
   *   "code": 200,
   *   "message": "Quizzes retrieved successfully",
   *   "result": [
   *     { quiz1 },
   *     { quiz2 },
   *     ...
   *   ]
   * }
   */
  listQuizzesForChunk = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const chunkId = String(req.params.chunkId);

      const quizzes = await quizService.getQuizzesForChunk(chunkId);

      sendResponse(res, {
        code: StatusCodes.OK,
        message: 'Quizzes retrieved successfully',
        result: quizzes,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /lessons/:lessonId/chunks/:chunkId/quizzes/:quizId
   * 
   * Retrieves a single quiz by ID with all its choices.
   * 
   * Response:
   * {
   *   "code": 200,
   *   "message": "Quiz retrieved successfully",
   *   "result": {
   *     "id": "...",
   *     "question": "...",
   *     "explanation": "...",
   *     "choices": [ ... ]
   *   }
   * }
   */
  getQuiz = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const quizId = String(req.params.quizId);

      const quiz = await quizService.getQuizById(quizId);

      if (!quiz) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          `Quiz not found: id=${quizId}`
        );
      }

      sendResponse(res, {
        code: StatusCodes.OK,
        message: 'Quiz retrieved successfully',
        result: quiz,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /assistant/quizzes/quiz/:quizId
   */
  updateQuiz = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const quizId = String(req.params.quizId);
      const body = req.data as UpdateQuizDto;

      const choicesNorm: NormalizedQuizChoiceInput[] = (body.choices ?? []).map((c) => ({
        text: c.text.trim(),
        isCorrect: c.isCorrect,
        feedback: c.feedback ?? null,
      }));

      QuizController.assertObjectiveQuizChoices(body.type, choicesNorm);

      const persistPayload: UpdateQuizPersistPayload = {
        question: body.question.trim(),
        explanation: (body.explanation ?? '').trim(),
        type: body.type,
        difficulty: body.difficulty,
        choices: choicesNorm,
      };
      if (body.bloomLevel !== undefined) {
        persistPayload.bloomLevel = body.bloomLevel;
      }

      const quiz = await quizService.updateQuizById(quizId, persistPayload);

      sendResponse(res, {
        code: StatusCodes.OK,
        message: 'Quiz updated successfully',
        result: quiz,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /assistant/quizzes/quiz/:quizId/approve
   */
  approveQuiz = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const quizId = String(req.params.quizId);
      const quiz = await quizService.approveQuizById(quizId);

      sendResponse(res, {
        code: StatusCodes.OK,
        message: 'Quiz approved successfully',
        result: quiz,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /assistant/quizzes/bulk-approve
   */
  bulkApproveQuizzes = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { quizIds } = req.body;
      if (!Array.isArray(quizIds)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'quizIds must be an array');
      }

      await quizService.approveQuizzesBulk(quizIds);

      sendResponse(res, {
        code: StatusCodes.OK,
        message: 'Quizzes approved successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /assistant/quizzes/quiz/:quizId
   */
  deleteQuiz = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const quizId = String(req.params.quizId);
      await quizService.deleteQuizById(quizId);

      sendResponse(res, {
        code: StatusCodes.OK,
        message: 'Quiz deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /assistant/quizzes/bulk-delete
   */
  bulkDeleteQuizzes = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { quizIds } = req.body;
      if (!Array.isArray(quizIds)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'quizIds must be an array');
      }

      await quizService.deleteQuizzesBulk(quizIds);

      sendResponse(res, {
        code: StatusCodes.OK,
        message: 'Quizzes deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Trắc nghiệm / đúng-sai: ít nhất 2 lựa chọn.
   * TRUE_FALSE: đúng 1 đáp án đúng.
   * MULTIPLE_CHOICE: ít nhất 1 đáp án đúng (có thể nhiều).
   */
  private static assertObjectiveQuizChoices(type: QuestionType, choices: NormalizedQuizChoiceInput[]): void {
    if (choices.length < 2) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Cần ít nhất 2 lựa chọn cho câu hỏi.'
      );
    }
    const correctCount = choices.filter((c) => c.isCorrect).length;
    if (correctCount < 1) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Phải có ít nhất một đáp án đúng.');
    }

    if (type === QuestionType.TRUE_FALSE && correctCount !== 1) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Câu hỏi Đúng/Sai (hoặc Single Choice) phải có đúng một đáp án đúng.');
    }
  }

  // -------------------------------------------------------------------------
  // Private Helpers
  // -------------------------------------------------------------------------

  /**
   * Formats a quiz record for API response.
   * Includes all choice details but hides internal fields.
   */
  private formatQuiz(quiz: any): any {
    return {
      id: quiz.id,
      question: quiz.question,
      explanation: quiz.explanation,
      type: quiz.type,
      difficulty: quiz.difficulty,
      bloomLevel: quiz.bloomLevel,
      choices: [...quiz.choices]
        .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
        .map((choice: any) => ({
        id: choice.id,
        text: choice.text,
        isCorrect: choice.isCorrect,
        feedback: choice.feedback,
      })),
      isApproved: quiz.isApproved,
      status: quiz.status,
      createdAt: quiz.createdAt.toISOString(),
      updatedAt: quiz.updatedAt.toISOString(),
    };
  }
}

// Export singleton instance
export default new QuizController();
