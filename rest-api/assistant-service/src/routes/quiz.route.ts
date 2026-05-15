import express, { Router } from 'express';
import quizController from '~/controllers/quiz.controller';

import Authentication from '~/middleware/auth.midleware';
import checkQuizGenerationVip from '~/middleware/checkQuizGenerationVip.middleware';
import validateDto from '~/middleware/validateDto.midleware';
import { GenerateQuizDto, GenerateBatchQuizzesDto } from '~/dto/request/quiz-generation.dto';
import { UpdateQuizDto } from '~/dto/request/quiz-update.dto';
import { CreateManualQuizDto } from '~/dto/request/quiz-create.dto';

const quizRouter: Router = express.Router();

/**
 * POST /assistant/chunks/:chunkId/quizzes
 * 
 * Generates a single quiz question for a lesson chunk in Vietnamese.
 * The lessonId is fetched from the database using chunkId.
 * 
 * Requirements:
 * - User must be authenticated
 * - User must have VIP subscription (checked via gRPC)
 * 
 * Body:
 * {
 *   "difficulty": "EASY|MEDIUM|HARD",
 *   "bloomLevel": "REMEMBER|UNDERSTAND|APPLY|ANALYZE|EVALUATE|CREATE",
 *   "questionType": "MULTIPLE_CHOICE|TRUE_FALSE|SHORT_ANSWER"
 * }
 * 
 * Response: 201 Created
 * {
 *   "code": 201,
 *   "message": "Quiz generated successfully",
 *   "result": { quiz object with Vietnamese content }
 * }
 */
quizRouter.post(
  '/chunks/:chunkId/quizzes',
  Authentication(true),
  checkQuizGenerationVip,
  validateDto(GenerateQuizDto),
  quizController.generateSingleQuiz
);

/**
 * POST /assistant/quizzes/chunks/:chunkId/quizzes/manual
 */
quizRouter.post(
  '/chunks/:chunkId/quizzes/manual',
  Authentication(true),
  validateDto(CreateManualQuizDto),
  quizController.createManualQuiz
);

/**
 * POST /assistant/chunks/:chunkId/quizzes/batch
 * 
 * Generates multiple quiz questions with distribution requirements in Vietnamese.
 * The lessonId is fetched from the database using chunkId.
 * 
 * Requirements:
 * - User must be authenticated
 * - User must have VIP subscription
 * 
 * Body:
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
 * Response: 201 Created
 * {
 *   "code": 201,
 *   "message": "Batch quizzes generated successfully",
 *   "result": {
 *     "count": 5,
 *     "quizzes": [ { quiz1 with Vietnamese content }, { quiz2 }, ... ]
 *   }
 * }
 */
quizRouter.post(
  '/chunks/:chunkId/quizzes/batch',
  Authentication(true),
  checkQuizGenerationVip,
  validateDto(GenerateBatchQuizzesDto),
  quizController.generateBatchQuizzes
);

/**
 * GET /assistant/chunks/:chunkId/quizzes
 * 
 * Retrieves all quizzes for a lesson chunk (NO pagination).
 * The lessonId is fetched from the database using chunkId.
 * 
 * Requirements:
 * - User must be authenticated
 * 
 * Response: 200 OK
 * Array of quiz objects directly:
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
quizRouter.get(
  '/chunks/:chunkId/quizzes',
  Authentication(true),
  quizController.listQuizzesForChunk
);

/**
 * GET /assistant/chunks/:chunkId/quizzes/:quizId
 * 
 * Retrieves a single quiz by ID with all its choices.
 * The lessonId is fetched from the database using chunkId.
 * 
 * Requirements:
 * - User must be authenticated
 * 
 * Response: 200 OK
 * {
 *   "code": 200,
 *   "message": "Quiz retrieved successfully",
 *   "result": { quiz object with choices }
 * }
 * 
 * Error: 404 Not Found
 * {
 *   "code": 404,
 *   "message": "Quiz not found: id=..."
 * }
 */
quizRouter.get(
  '/chunks/:chunkId/quizzes/:quizId',
  Authentication(true),
  quizController.getQuiz
);

/**
 * PATCH /assistant/quizzes/quiz/:quizId
 *
 * Instructor update: question, explanation, type, difficulty/bloom, choices (full replace).
 */
quizRouter.patch(
  '/quiz/:quizId',
  Authentication(true),
  validateDto(UpdateQuizDto),
  quizController.updateQuiz
);

/**
 * PATCH /assistant/quizzes/quiz/:quizId/approve
 */
quizRouter.patch(
  '/quiz/:quizId/approve',
  Authentication(true),
  quizController.approveQuiz
);

/**
 * POST /assistant/quizzes/bulk-approve
 */
quizRouter.post(
  '/bulk-approve',
  Authentication(true),
  quizController.bulkApproveQuizzes
);

/**
 * DELETE /assistant/quizzes/quiz/:quizId
 */
quizRouter.delete(
  '/quiz/:quizId',
  Authentication(true),
  quizController.deleteQuiz
);

/**
 * POST /assistant/quizzes/bulk-delete
 */
quizRouter.post(
  '/bulk-delete',
  Authentication(true),
  quizController.bulkDeleteQuizzes
);

export default quizRouter;
