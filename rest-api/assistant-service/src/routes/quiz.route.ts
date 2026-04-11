import express, { Router } from 'express';
import quizController from '~/controllers/quiz.controller';

import Authentication from '~/middleware/auth.midleware';
import checkQuizGenerationVip from '~/middleware/checkQuizGenerationVip.middleware';
import validateDto from '~/middleware/validateDto.midleware';
import { GenerateQuizDto, GenerateBatchQuizzesDto } from '~/dto/request/quiz-generation.dto';

const quizRouter: Router = express.Router();

/**
 * POST /assistant/lessons/:lessonId/chunks/:chunkId/quizzes
 * 
 * Generates a single quiz question for a lesson chunk.
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
 *   "result": { quiz object with choices }
 * }
 */
quizRouter.post(
  '/lessons/:lessonId/chunks/:chunkId/quizzes',
  Authentication(true),
  checkQuizGenerationVip,
  validateDto(GenerateQuizDto),
  quizController.generateSingleQuiz
);

/**
 * POST /assistant/lessons/:lessonId/chunks/:chunkId/quizzes/batch
 * 
 * Generates multiple quiz questions with distribution requirements.
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
 *     "quizzes": [ { quiz1 }, { quiz2 }, ... ]
 *   }
 * }
 */
quizRouter.post(
  '/lessons/:lessonId/chunks/:chunkId/quizzes/batch',
  Authentication(true),
  checkQuizGenerationVip,
  validateDto(GenerateBatchQuizzesDto),
  quizController.generateBatchQuizzes
);

/**
 * GET /assistant/lessons/:lessonId/chunks/:chunkId/quizzes
 * 
 * Retrieves all quizzes for a lesson chunk (NO pagination).
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
  '/lessons/:lessonId/chunks/:chunkId/quizzes',
  Authentication(true),
  quizController.listQuizzesForChunk
);

/**
 * GET /assistant/lessons/:lessonId/chunks/:chunkId/quizzes/:quizId
 * 
 * Retrieves a single quiz by ID with all its choices.
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
  '/lessons/:lessonId/chunks/:chunkId/quizzes/:quizId',
  Authentication(true),
  quizController.getQuiz
);

export default quizRouter;
