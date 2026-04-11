import Logger from '~/utils/logger';
import prismaService from '~/service/utils/prisma.service';
import quizGenerationService from '~/service/analysis/quizGeneration.service';
import quizPersistenceService from '~/service/quizz/quizPersistence.service';
import { GenerateQuizDto, GenerateBatchQuizzesDto } from '~/dto/request/quiz-generation.dto';
import { ListQuizzesResponse } from '~/dto/response/quiz-response.dto';
import { Quiz, QuizChoice } from '@prisma/client';

import { QuestionType, DifficultyLevel, BloomLevel, QuizStatus } from '~/enums/quizStatus.enum';

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

    // Fetch all quizzes for this chunk
    const quizzes = await quizPersistenceService.getQuizzesForChunk(chunkId);

    Logger.info(
      `[QuizService] Found ${quizzes.length} quizzes for chunkId=${chunkId}`
    );

    // Return as array (no pagination wrapper)
    return quizzes.map(quiz => ({
      id: quiz.id,
      question: quiz.question,
      explanation: quiz.explanation,
      type: quiz.type as unknown as QuestionType,
      difficulty: quiz.difficulty as unknown as DifficultyLevel,
      bloomLevel: quiz.bloomLevel as unknown as BloomLevel,
      choices: quiz.choices.map(choice => ({
        id: choice.id,
        text: choice.text,
        isCorrect: choice.isCorrect,
        feedback: choice.feedback || undefined,
      })),
      isApproved: quiz.isApproved,
      status: quiz.status as unknown as QuizStatus,
      createdAt: quiz.createdAt,
    }));
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
      choices: quiz.choices.map(choice => ({
        id: choice.id,
        text: choice.text,
        isCorrect: choice.isCorrect,
        feedback: choice.feedback || undefined,
      })),
      isApproved: quiz.isApproved,
      status: quiz.status as unknown as QuizStatus,
      createdAt: quiz.createdAt,
    };
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
