import prismaService from '~/service/utils/prisma.service';
import Logger from '~/utils/logger';
import { GeneratedQuizResponse, BatchGeneratedQuizzesResponse } from '~/dto/response/quiz-response.dto';
import { Prisma, Quiz, QuizChoice, QuizScope } from '@prisma/client';
import { QuestionType, DifficultyLevel, BloomLevel, QuizStatus } from '~/enums/quizStatus.enum';

/** Quiz row including nested choices (matches Prisma `include: { choices: true }`). */
export type QuizWithChoices = Prisma.QuizGetPayload<{ include: { choices: true } }>;

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
  ): Promise<QuizWithChoices> {
    Logger.info(
      `[QuizPersistenceService] Saving single quiz for chunkId=${chunkId}, userId=${userId}`
    );

    // Create quiz and its choices in a transaction
    const savedQuiz = await prismaService.quiz.create({
      data: {
        chunkId,
        question: quiz.question,
        explanation: quiz.explanation,
        type: quiz.type as QuestionType,
        difficulty: quiz.difficulty as DifficultyLevel,
        bloomLevel: quiz.bloomLevel as BloomLevel,
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
  ): Promise<QuizWithChoices[]> {
    Logger.info(
      `[QuizPersistenceService] Batch saving ${batchQuizzes.quizzes.length} quizzes for chunkId=${chunkId}`
    );

    const savedQuizzes: QuizWithChoices[] = [];
    for (const quiz of batchQuizzes.quizzes) {
      const row = await prismaService.quiz.create({
        data: {
          chunkId,
          question: quiz.question,
          explanation: quiz.explanation,
          type: quiz.type as QuestionType,
          difficulty: quiz.difficulty as DifficultyLevel,
          bloomLevel: quiz.bloomLevel as BloomLevel,
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
      });
      savedQuizzes.push(row);
    }

    Logger.info(
      `[QuizPersistenceService] Successfully batch saved ${savedQuizzes.length} quizzes`
    );

    return savedQuizzes;
  }

  /**
   * Saves a manually created quiz with its choices to the database.
   */
  async createManualQuiz(
    chunkId: string,
    userId: string,
    data: {
      question: string;
      explanation: string;
      type: QuestionType;
      difficulty: DifficultyLevel;
      bloomLevel: BloomLevel;
      choices: Array<{ text: string; isCorrect: boolean; feedback?: string | null }>;
    }
  ): Promise<QuizWithChoices> {
    Logger.info(
      `[QuizPersistenceService] Creating manual quiz for chunkId=${chunkId}, userId=${userId}`
    );

    const savedQuiz = await prismaService.quiz.create({
      data: {
        chunkId,
        question: data.question,
        explanation: data.explanation,
        type: data.type,
        difficulty: data.difficulty,
        bloomLevel: data.bloomLevel,
        createdBy: userId,
        aiGenerated: false,
        isApproved: true,
        status: QuizStatus.ACTIVE,
        choices: {
          create: data.choices.map((choice, index) => ({
            text: choice.text,
            isCorrect: choice.isCorrect,
            order: index,
            feedback: choice.feedback ?? null,
          })),
        },
      },
      include: { choices: true },
    });

    return savedQuiz;
  }

  /**
   * Saves batch quizzes for lesson-test scope (merged chunk-group generation).
   * `chunkId` is null; linkage is `lessonTestChunkGroupId` (+ optional group JSON chunk list on the group row).
   */
  async saveLessonTestBatchQuizzes(
    lessonTestChunkGroupId: string,
    userId: string,
    batchQuizzes: BatchGeneratedQuizzesResponse
  ): Promise<QuizWithChoices[]> {
    Logger.info(
      `[QuizPersistenceService] Batch saving ${batchQuizzes.quizzes.length} LESSON_TEST quizzes for groupId=${lessonTestChunkGroupId}`
    );

    const savedQuizzes: QuizWithChoices[] = [];
    for (const quiz of batchQuizzes.quizzes) {
      const row = await prismaService.quiz.create({
        data: {
          chunkId: quiz.groundedChunkId || null,
          quizScope: QuizScope.LESSON_TEST,
          lessonTestChunkGroupId,
          question: quiz.question,
          explanation: quiz.explanation,
          type: quiz.type as QuestionType,
          difficulty: quiz.difficulty as DifficultyLevel,
          bloomLevel: quiz.bloomLevel as BloomLevel,
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
      });
      savedQuizzes.push(row);
    }

    Logger.info(
      `[QuizPersistenceService] Successfully saved ${savedQuizzes.length} LESSON_TEST quizzes`
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
   * All LESSON_TEST quizzes linked to a blueprint chunk group (`chunkId` null).
   */
  async getQuizzesForLessonTestChunkGroup(
    lessonTestChunkGroupId: string
  ): Promise<(Quiz & { choices: QuizChoice[] })[]> {
    Logger.info(
      `[QuizPersistenceService] Fetching LESSON_TEST quizzes for lessonTestChunkGroupId=${lessonTestChunkGroupId}`
    );

    const quizzes = await prismaService.quiz.findMany({
      where: { lessonTestChunkGroupId },
      include: { choices: true },
      orderBy: { createdAt: 'desc' },
    });

    Logger.info(
      `[QuizPersistenceService] Found ${quizzes.length} quizzes for lessonTestChunkGroupId=${lessonTestChunkGroupId}`
    );

    return quizzes;
  }

  /**
   * All LESSON_TEST quizzes for a lesson, in learner-facing order: chunk groups by `createdAt` asc,
   * then quizzes in each group by `createdAt` asc.
   *
   * Single round-trip: load quizzes + choices + parent group timestamps, sort in memory (no N+1).
   */
  async getAllLessonTestQuizzesForLessonOrdered(lessonId: string): Promise<QuizWithChoices[]> {
    const rows = await prismaService.quiz.findMany({
      where: {
        quizScope: QuizScope.LESSON_TEST,
        lessonTestChunkGroup: { lessonId },
      },
      include: {
        choices: true,
        lessonTestChunkGroup: { select: { createdAt: true } },
      },
    });

    rows.sort((a, b) => {
      const ga = a.lessonTestChunkGroup?.createdAt.getTime() ?? 0;
      const gb = b.lessonTestChunkGroup?.createdAt.getTime() ?? 0;
      if (ga !== gb) return ga - gb;
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    const out: QuizWithChoices[] = rows.map((row) => {
      const { lessonTestChunkGroup: _g, choices, ...quiz } = row;
      const sortedChoices = [...choices].sort((x, y) => x.order - y.order);
      return { ...quiz, choices: sortedChoices } as QuizWithChoices;
    });

    Logger.info(
      `[QuizPersistenceService] Flat LESSON_TEST quiz list for lessonId=${lessonId}: ${out.length} items`
    );

    return out;
  }

  /**
   * Replace quiz stem/meta and all choices (transaction). Keeps same quiz id / chunk / lesson-test links.
   */
  async updateQuizWithChoicesReplace(
    quizId: string,
    data: {
      question: string;
      explanation: string;
      type: QuestionType;
      difficulty: DifficultyLevel;
      bloomLevel: BloomLevel;
      choices: Array<{ text: string; isCorrect: boolean; feedback?: string | null }>;
    }
  ): Promise<QuizWithChoices> {
    Logger.info(`[QuizPersistenceService] Replacing content for quiz id=${quizId}`);

    return prismaService.$transaction(async (tx) => {
      await tx.quizChoice.deleteMany({ where: { quizId } });

      const updated = await tx.quiz.update({
        where: { id: quizId },
        data: {
          question: data.question,
          explanation: data.explanation,
          type: data.type,
          difficulty: data.difficulty,
          bloomLevel: data.bloomLevel,
          choices: {
            create: data.choices.map((c, index) => ({
              text: c.text,
              isCorrect: c.isCorrect,
              order: index,
              feedback: c.feedback ?? null,
            })),
          },
        },
        include: { choices: true },
      });

      updated.choices.sort((a, b) => a.order - b.order);

      Logger.info(`[QuizPersistenceService] Updated quiz id=${quizId} choices=${updated.choices.length}`);
      return updated as QuizWithChoices;
    });
  }

  /**
   * Approves a quiz (sets isApproved to true).
   */
  async approveQuiz(quizId: string): Promise<QuizWithChoices> {
    const quiz = await prismaService.quiz.update({
      where: { id: quizId },
      data: { isApproved: true },
      include: { choices: true },
    });
    return quiz;
  }

  /**
   * Approves multiple quizzes by ID.
   */
  async approveQuizzes(quizIds: string[]): Promise<void> {
    await prismaService.quiz.updateMany({
      where: { id: { in: quizIds } },
      data: { isApproved: true },
    });
  }

  /**
   * Deletes multiple quizzes by ID.
   */
  async deleteQuizzes(quizIds: string[]): Promise<void> {
    await prismaService.quiz.deleteMany({
      where: { id: { in: quizIds } },
    });
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
   * Deletes a quiz and all its related choices (cascade handled by DB).
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
