import Logger from '~/utils/logger';
import prismaService from '~/service/utils/prisma.service';
import quizGenerationService from '~/service/analysis/quizGeneration.service';
import quizPersistenceService from '~/service/quizz/quizPersistence.service';
import lessonTestService from '~/service/lessonTest/lessonTest.service';
import { GenerateQuizDto, GenerateBatchQuizzesDto } from '~/dto/request/quiz-generation.dto';
import { ListQuizzesResponse } from '~/dto/response/quiz-response.dto';
import { Quiz, QuizChoice } from '@prisma/client';
import type { QuizWithChoices } from '~/service/quizz/quizPersistence.service';

import { QuestionType, DifficultyLevel, BloomLevel, QuizStatus } from '~/enums/quizStatus.enum';
import ApiError from '~/middleware/ApiError';
import { StatusCodes } from 'http-status-codes';
import { UpdateQuizPersistPayload } from '~/dto/request/quiz-update.dto';

/**
 * QuizService orchestrates quiz generation and persistence.
 * 
 * Responsibilities:
 * - Fetch context (chunk content, chunk summary, lesson summary)
 * - Coordinate generation service with persistence service
 * - Handle validation and error scenarios
 * - Provide high-level quiz operations
 */
export class QuizService {
  private mapQuizRowsToListResponse(quizzes: QuizWithChoices[]): ListQuizzesResponse {
    return quizzes.map((quiz) => ({
      id: quiz.id,
      chunkId: quiz.chunkId ?? undefined,
      question: quiz.question,
      explanation: quiz.explanation,
      type: quiz.type as unknown as QuestionType,
      difficulty: quiz.difficulty as unknown as DifficultyLevel,
      bloomLevel: quiz.bloomLevel as unknown as BloomLevel,
      choices: [...quiz.choices]
        .sort((a, b) => a.order - b.order)
        .map((choice) => ({
          id: choice.id,
          text: choice.text,
          isCorrect: choice.isCorrect,
          feedback: choice.feedback || undefined,
        })),
      isApproved: quiz.isApproved,
      status: quiz.status as unknown as QuizStatus,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
    }));
  }

  /**
   * Generates a single quiz for a lesson chunk with full context.
   * Fetches chunk and lesson data, calls generation service, saves to DB.
   * 
   * @param chunkId - The lesson chunk ID
   * @param userId - The user ID who triggered generation
   * @param options - Generation options (difficulty, bloomLevel, questionType)
   * @returns Generated quiz record
   * @throws Error if chunk not found or generation fails
   */
  async generateSingleQuiz(
    chunkId: string,
    userId: string,
    options: GenerateQuizDto
  ): Promise<Quiz & { choices: QuizChoice[] }> {
    Logger.info(
      `[QuizService] Generating single quiz for chunkId=${chunkId}, userId=${userId}`
    );

    // Fetch chunk with lesson context
    const chunk = await this.getChunkWithContext(chunkId);
    if (!chunk) {
      throw new Error(`Chunk not found: ${chunkId}`);
    }

    // Generate quiz using OpenAI (always Vietnamese)
    const generatedQuiz = await quizGenerationService.generateSingleQuiz(
      chunk.content,
      chunk.summary || '',
      chunk.lesson.summary || '',
      options,
      'vi'  // Always use Vietnamese
    );

    // Save to database
    const savedQuiz = await quizPersistenceService.saveSingleQuiz(
      chunkId,
      userId,
      generatedQuiz
    );

    Logger.info(
      `[QuizService] Successfully generated and saved quiz id=${savedQuiz.id}`
    );

    return savedQuiz;
  }

  /**
   * Creates a manual quiz for a lesson chunk.
   */
  async createManualQuiz(
    chunkId: string,
    userId: string,
    data: any
  ): Promise<any> {
    Logger.info(
      `[QuizService] Creating manual quiz for chunkId=${chunkId}, userId=${userId}`
    );

    const savedQuiz = await quizPersistenceService.createManualQuiz(
      chunkId,
      userId,
      data
    );

    return this.mapQuizRowsToListResponse([savedQuiz])[0];
  }

  /**
   * Generates multiple quizzes for a lesson chunk with distribution requirements.
   * 
   * @param chunkId - The lesson chunk ID
   * @param userId - The user ID who triggered generation
   * @param options - Batch generation options with distribution
   * @returns Saved quiz records
   * @throws Error if chunk not found or generation fails
   */
  async generateBatchQuizzes(
    chunkId: string,
    userId: string,
    options: GenerateBatchQuizzesDto
  ): Promise<(Quiz & { choices: QuizChoice[] })[]> {
    Logger.info(
      `[QuizService] Generating batch quizzes (${options.count}) for chunkId=${chunkId}`
    );

    // Fetch chunk with lesson context
    const chunk = await this.getChunkWithContext(chunkId);
    if (!chunk) {
      throw new Error(`Chunk not found: ${chunkId}`);
    }

    // Generate batch of quizzes (always Vietnamese)
    const generatedBatch = await quizGenerationService.generateBatchQuizzes(
      chunk.content,
      chunk.summary || '',
      chunk.lesson.summary || '',
      options,
      'vi'  // Always use Vietnamese
    );

    // Save all quizzes to database
    const savedQuizzes = await quizPersistenceService.saveBatchQuizzes(
      chunkId,
      userId,
      generatedBatch
    );

    Logger.info(
      `[QuizService] Successfully generated and saved ${savedQuizzes.length} quizzes`
    );

    return savedQuizzes;
  }

  /**
   * Retrieves all quizzes for a lesson chunk (NO pagination).
   * 
   * @param chunkId - The lesson chunk ID
   * @returns List of quizzes with choices
   * @throws Error if chunk not found
   */
  async getQuizzesForChunk(chunkId: string): Promise<ListQuizzesResponse> {
    Logger.info(
      `[QuizService] Fetching quizzes for chunkId=${chunkId}`
    );

    // Verify chunk exists
    const chunk = await prismaService.lessonChunk.findUnique({
      where: { id: chunkId },
      select: { id: true },
    });

    if (!chunk) {
      throw new Error(`Chunk not found=${chunkId}`);
    }

    const quizzes = await quizPersistenceService.getQuizzesForChunk(chunkId);

    Logger.info(
      `[QuizService] Found ${quizzes.length} quizzes for chunkId=${chunkId}`
    );

    return this.mapQuizRowsToListResponse(quizzes);
  }

  /**
   * LESSON_TEST quizzes for a blueprint chunk group (`chunkId` null on rows).
   */
  async getQuizzesForLessonTestChunkGroup(
    lessonId: string,
    groupId: string
  ): Promise<ListQuizzesResponse> {
    await lessonTestService.assertChunkGroupExists(lessonId, groupId);

    const quizzes =
      await quizPersistenceService.getQuizzesForLessonTestChunkGroup(groupId);

    Logger.info(
      `[QuizService] Found ${quizzes.length} LESSON_TEST quizzes for groupId=${groupId}`
    );

    return this.mapQuizRowsToListResponse(quizzes);
  }

  /**
   * Flat list of LESSON_TEST quizzes for the whole lesson (student-facing order).
   */
  async getQuizzesForLessonTestLesson(lessonId: string): Promise<ListQuizzesResponse> {
    const quizzes =
      await quizPersistenceService.getAllLessonTestQuizzesForLessonOrdered(lessonId);

    Logger.info(
      `[QuizService] Flat LESSON_TEST list for lessonId=${lessonId}: ${quizzes.length} quizzes`
    );

    return this.mapQuizRowsToListResponse(quizzes);
  }

  /**
   * Retrieves a single quiz by ID with all choices.
   * 
   * @param quizId - The quiz ID
   * @returns Quiz with choices, or null if not found
   */
  async getQuizById(quizId: string): Promise<any | null> {
    Logger.info(
      `[QuizService] Fetching quiz id=${quizId}`
    );

    const quiz = await quizPersistenceService.getQuizById(quizId);

    if (!quiz) {
      Logger.warn(
        `[QuizService] Quiz not found: id=${quizId}`
      );
      return null;
    }

    return {
      id: quiz.id,
      question: quiz.question,
      explanation: quiz.explanation,
      type: quiz.type as unknown as QuestionType,
      difficulty: quiz.difficulty as unknown as DifficultyLevel,
      bloomLevel: quiz.bloomLevel as unknown as BloomLevel,
      choices: [...quiz.choices]
        .sort((a, b) => a.order - b.order)
        .map((choice) => ({
          id: choice.id,
          text: choice.text,
          isCorrect: choice.isCorrect,
          feedback: choice.feedback || undefined,
        })),
      isApproved: quiz.isApproved,
      status: quiz.status as unknown as QuizStatus,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
    };
  }

  /**
   * Persists instructor edits (choices already validated + normalized in controller).
   */
  async updateQuizById(quizId: string, payload: UpdateQuizPersistPayload) {
    const existing = await quizPersistenceService.getQuizById(quizId);
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Quiz not found: id=${quizId}`);
    }

    const saved = await quizPersistenceService.updateQuizWithChoicesReplace(quizId, {
      question: payload.question,
      explanation: payload.explanation,
      type: payload.type,
      difficulty: payload.difficulty,
      bloomLevel: payload.bloomLevel ?? existing.bloomLevel as BloomLevel,
      choices: payload.choices,
    });

    const mapped = this.mapQuizRowsToListResponse([saved]);
    const row = mapped[0];
    if (!row) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to map updated quiz');
    }
    return row;
  }

  /**
   * Approves a quiz by ID.
   */
  async approveQuizById(quizId: string): Promise<any> {
    const existing = await quizPersistenceService.getQuizById(quizId);
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Quiz not found: id=${quizId}`);
    }
    const updated = await quizPersistenceService.approveQuiz(quizId);
    return this.mapQuizRowsToListResponse([updated])[0];
  }

  /**
   * Approves multiple quizzes in bulk.
   */
  async approveQuizzesBulk(quizIds: string[]): Promise<void> {
    await quizPersistenceService.approveQuizzes(quizIds);
  }

  /**
   * Deletes a quiz by ID.
   */
  async deleteQuizById(quizId: string): Promise<void> {
    const existing = await quizPersistenceService.getQuizById(quizId);
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Quiz not found: id=${quizId}`);
    }
    await quizPersistenceService.deleteQuiz(quizId);
  }

  /**
   * Deletes multiple quizzes in bulk.
   */
  async deleteQuizzesBulk(quizIds: string[]): Promise<void> {
    await quizPersistenceService.deleteQuizzes(quizIds);
  }

  /**
   * Fetches a lesson chunk with its lesson summary for context.
   * 
   * @param chunkId - The chunk ID
   * @returns Chunk with lesson data, or null if not found
   */
  private async getChunkWithContext(chunkId: string) {
    const chunk = await prismaService.lessonChunk.findUnique({
      where: { id: chunkId },
      include: {
        lesson: {
          select: {
            id: true,
            summary: true,
          },
        },
      },
    });

    return chunk;
  }
}

// Export singleton instance
export default new QuizService();
