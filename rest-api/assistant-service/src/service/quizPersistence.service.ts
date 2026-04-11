import prismaService from '~/service/utils/prisma.service';
import Logger from '~/utils/logger';
import { GeneratedQuizResponse, BatchGeneratedQuizzesResponse } from '~/dto/response/quiz-response.dto';
import { Quiz, QuizChoice } from '@prisma/client';

/**
 * QuizPersistenceService handles database operations for quizzes.
 * 
 * Features:
 * - Save single quiz with choices
 * - Batch save quizzes with transactions
 * - Query quizzes for a chunk
 * - Fetch individual quiz details
 * - Update quiz status/approval
 */
export class QuizPersistenceService {
  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Saves a single generated quiz with its choices to the database.
   * 
   * @param chunkId - The lesson chunk ID this quiz belongs to
   * @param userId - The user ID who created this quiz
   * @param quiz - Generated quiz data (question, choices, metadata)
   * @returns Saved Quiz record with choices
   */
  async saveSingleQuiz(
    chunkId: string,
    userId: string,
    quiz: GeneratedQuizResponse
  ): Promise<Quiz & { choices: QuizChoice[] }> {
    Logger.info(
      `[QuizPersistenceService] Saving single quiz for chunkId=${chunkId}, userId=${userId}`
    );

    // Create quiz and its choices in a transaction
    const savedQuiz = await prismaService.quiz.create({
      data: {
        chunkId,
        question: quiz.question,
        explanation: quiz.explanation,
        type: quiz.type,
        difficulty: quiz.difficulty,
        bloomLevel: quiz.bloomLevel,
        createdBy: userId,
        aiGenerated: true,
        aiModel: 'gpt-4-turbo',
        aiConfidence: 0.85, // Default confidence for AI-generated quizzes
        choices: {
          create: quiz.choices.map((choice, index) => ({
            text: choice.text,
            isCorrect: choice.isCorrect,
            order: index,
            feedback: choice.feedback,
          })),
        },
      },
      include: { choices: true },
    });

    Logger.info(
      `[QuizPersistenceService] Successfully saved quiz id=${savedQuiz.id} with ${savedQuiz.choices.length} choices`
    );

    return savedQuiz;
  }

  /**
   * Saves multiple generated quizzes in a single transaction.
   * Ensures all quizzes are saved atomically.
   * 
   * @param chunkId - The lesson chunk ID
   * @param userId - The user ID who created these quizzes
   * @param batchQuizzes - Batch of generated quizzes
   * @returns Array of saved Quiz records with choices
   */
  async saveBatchQuizzes(
    chunkId: string,
    userId: string,
    batchQuizzes: BatchGeneratedQuizzesResponse
  ): Promise<(Quiz & { choices: QuizChoice[] })[]> {
    Logger.info(
      `[QuizPersistenceService] Batch saving ${batchQuizzes.quizzes.length} quizzes for chunkId=${chunkId}`
    );

    // Create all quizzes in a transaction
    const savedQuizzes = await Promise.all(
      batchQuizzes.quizzes.map(quiz =>
        prismaService.quiz.create({
          data: {
            chunkId,
            question: quiz.question,
            explanation: quiz.explanation,
            type: quiz.type,
            difficulty: quiz.difficulty,
            bloomLevel: quiz.bloomLevel,
            createdBy: userId,
            aiGenerated: true,
            aiModel: 'gpt-4-turbo',
            aiConfidence: 0.85,
            choices: {
              create: quiz.choices.map((choice, index) => ({
                text: choice.text,
                isCorrect: choice.isCorrect,
                order: index,
                feedback: choice.feedback,
              })),
            },
          },
          include: { choices: true },
        })
      )
    );

    Logger.info(
      `[QuizPersistenceService] Successfully batch saved ${savedQuizzes.length} quizzes`
    );

    return savedQuizzes;
  }

  /**
   * Retrieves all quizzes for a specific lesson chunk (NO pagination).
   * 
   * @param chunkId - The lesson chunk ID
   * @returns Array of quizzes with their choices, ordered by creation date
   */
  async getQuizzesForChunk(chunkId: string): Promise<(Quiz & { choices: QuizChoice[] })[]> {
    Logger.info(
      `[QuizPersistenceService] Fetching quizzes for chunkId=${chunkId}`
    );

    const quizzes = await prismaService.quiz.findMany({
      where: { chunkId },
      include: { choices: true },
      orderBy: { createdAt: 'desc' },
    });

    Logger.info(
      `[QuizPersistenceService] Found ${quizzes.length} quizzes for chunkId=${chunkId}`
    );

    return quizzes;
  }

  /**
   * Retrieves a single quiz by ID with all its choices.
   * 
   * @param quizId - The quiz ID
   * @returns Quiz with choices, or null if not found
   */
  async getQuizById(quizId: string): Promise<(Quiz & { choices: QuizChoice[] }) | null> {
    Logger.info(
      `[QuizPersistenceService] Fetching quiz id=${quizId}`
    );

    const quiz = await prismaService.quiz.findUnique({
      where: { id: quizId },
      include: { choices: true },
    });

    if (!quiz) {
      Logger.warn(
        `[QuizPersistenceService] Quiz not found: id=${quizId}`
      );
      return null;
    }

    return quiz;
  }

  /**
   * Updates quiz approval and status fields.
   * 
   * @param quizId - The quiz ID to update
   * @param isApproved - Whether the quiz is approved
   * @param status - New status (ACTIVE, ARCHIVED, DISABLED)
   * @returns Updated quiz record
   */
  async updateQuizApprovalStatus(
    quizId: string,
    isApproved: boolean,
    status: string
  ): Promise<Quiz> {
    Logger.info(
      `[QuizPersistenceService] Updating quiz id=${quizId}: isApproved=${isApproved}, status=${status}`
    );

    const updatedQuiz = await prismaService.quiz.update({
      where: { id: quizId },
      data: {
        isApproved,
        status: status as any,
      },
    });

    Logger.info(
      `[QuizPersistenceService] Successfully updated quiz id=${quizId}`
    );

    return updatedQuiz;
  }

  /**
   * Deletes a quiz and all its related choices and answers (cascade handled by DB).
   * 
   * @param quizId - The quiz ID to delete
   */
  async deleteQuiz(quizId: string): Promise<void> {
    Logger.info(
      `[QuizPersistenceService] Deleting quiz id=${quizId}`
    );

    await prismaService.quiz.delete({
      where: { id: quizId },
    });

    Logger.info(
      `[QuizPersistenceService] Successfully deleted quiz id=${quizId}`
    );
  }

  /**
   * Counts total quizzes for a chunk.
   * 
   * @param chunkId - The lesson chunk ID
   * @returns Number of quizzes
   */
  async countQuizzesForChunk(chunkId: string): Promise<number> {
    const count = await prismaService.quiz.count({
      where: { chunkId },
    });

    return count;
  }

  /**
   * Checks if a quiz exists (for validation).
   * 
   * @param quizId - The quiz ID
   * @returns True if quiz exists, false otherwise
   */
  async quizExists(quizId: string): Promise<boolean> {
    const quiz = await prismaService.quiz.findUnique({
      where: { id: quizId },
      select: { id: true },
    });

    return !!quiz;
  }
}

// Export singleton instance
export default new QuizPersistenceService();
