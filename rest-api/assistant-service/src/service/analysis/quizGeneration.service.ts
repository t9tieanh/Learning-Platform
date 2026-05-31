import Logger from '~/utils/logger';
import {
  GenerateQuizDto,
  GenerateBatchQuizzesDto,
} from '~/dto/request/quiz-generation.dto';
import { DifficultyLevel, BloomLevel, QuestionType } from '~/enums/quizStatus.enum';
import {
  GeneratedQuizResponse,
  BatchGeneratedQuizzesResponse
} from '~/dto/response/quiz-response.dto';
import { QuizPrompts, QuizLanguage } from '~/prompts/quiz.prompt';
import { LessonTestPrompts } from '~/prompts/lesson-test.prompt';
import openaiQueueService from '~/service/queue/openaiQueue.service';
import chunkCitationUtil from '~/utils/chunkCitation.util';

/**
 * QuizGenerationService handles OpenAI integration for quiz generation.
 * 
 * Features:
 * - Single quiz generation with context (lesson + chunk summary)
 * - Batch quiz generation with distribution requirements
 * - Uses Bull Queue for reliable retry logic with exponential backoff
 * - Response parsing and validation
 * - Error handling and logging
 */
export class QuizGenerationService {
  // All OpenAI operations are handled by openaiQueueService via Bull Queue

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Generates a single quiz question with multiple choice answers.
   * 
   * @param chunkContent - The lesson chunk content to generate quiz from
   * @param chunkSummary - Summary of the chunk for context
   * @param lessonSummary - Summary of the entire lesson for broader context
   * @param options - Generation options (difficulty, bloomLevel, questionType)
   * @param language - Language for quiz generation ('en' for English, 'vi' for Vietnamese)
   * @returns Generated quiz with choices and explanation
   */
  async generateSingleQuiz(
    chunkContent: string,
    chunkSummary: string,
    lessonSummary: string,
    options: GenerateQuizDto,
    language: QuizLanguage = 'en'
  ): Promise<GeneratedQuizResponse> {
    Logger.info(
      `[QuizGenerationService] Starting single quiz generation for difficulty=${options.difficulty}, bloomLevel=${options.bloomLevel}, language=${language}`
    );

    const prompt = QuizPrompts.buildSingleQuizPrompt(
      chunkContent,
      chunkSummary,
      lessonSummary,
      {
        difficulty: options.difficulty || DifficultyLevel.MEDIUM,
        bloomLevel: options.bloomLevel || BloomLevel.UNDERSTAND,
        questionType: options.questionType || QuestionType.MULTIPLE_CHOICE,
        userPrompt: options.userPrompt,
      },
      language
    );

    Logger.info(
      `[QuizGenerationService] Built prompt with language=${language}, system prompt starts: "${prompt.systemPrompt.substring(0, 80)}..."`
    );

    const response = await openaiQueueService.queueQuizGeneration(
      prompt.systemPrompt,
      prompt.userPrompt,
      false  // Single quiz generation
    );

    // Parse the response
    const parsedResponse = openaiQueueService.parseQuizResponse(response);

    // Ensure we're working with a single quiz, not an array
    const quiz = Array.isArray(parsedResponse) ? parsedResponse[0] : parsedResponse;

    if (!quiz) {
      throw new Error('No quiz generated from OpenAI response');
    }

    Logger.info(
      `[QuizGenerationService] Successfully generated single quiz: "${quiz.question.substring(0, 50)}..."`
    );

    return {
      question: quiz.question,
      explanation: quiz.explanation,
      type: quiz.type || options.questionType || 'MULTIPLE_CHOICE',
      difficulty: quiz.difficulty || options.difficulty || 'MEDIUM',
      bloomLevel: quiz.bloomLevel || options.bloomLevel || 'UNDERSTAND',
      choices: quiz.choices.map(choice => ({
        text: choice.text,
        isCorrect: choice.isCorrect,
        feedback: choice.feedback || (choice.isCorrect ? 'Chính xác!' : 'Không chính xác.'),
      })),
    };
  }

  /**
   * Batch generation for review/practice (ôn tập) — plain explanations, no chunk citations.
   */
  async generateBatchQuizzes(
    chunkContent: string,
    chunkSummary: string,
    lessonSummary: string,
    batchOptions: GenerateBatchQuizzesDto,
    language: QuizLanguage = 'en'
  ): Promise<BatchGeneratedQuizzesResponse> {
    Logger.info(
      `[QuizGenerationService] Starting review batch quiz generation for ${batchOptions.count} quizzes, language=${language}`
    );

    const prompt = QuizPrompts.buildBatchQuizPrompt(
      chunkContent,
      chunkSummary,
      lessonSummary,
      batchOptions,
      language
    );

    return this.mapBatchQuizResponse(
      await openaiQueueService.queueQuizGeneration(prompt.systemPrompt, prompt.userPrompt, true),
      batchOptions
    );
  }

  /**
   * Batch generation for a merged lesson-test chunk group (bài kiểm tra) — explanations include @{{chunkId}}@ citations.
   */
  async generateLessonTestGroupBatch(
    mergedContext: string,
    lessonSummary: string,
    batchOptions: GenerateBatchQuizzesDto,
    language: QuizLanguage = 'vi'
  ): Promise<BatchGeneratedQuizzesResponse> {
    const mergedChunkTopic =
      language === 'vi' ? LessonTestPrompts.mergedChunkTopicVi() : LessonTestPrompts.mergedChunkTopicEn();

    const chunkIds = chunkCitationUtil.extractChunkIdsFromMergedContext(mergedContext);

    Logger.info(
      `[QuizGenerationService] Starting lesson-test batch for ${batchOptions.count} quizzes, chunkIds=${chunkIds.length}`
    );

    const prompt = LessonTestPrompts.buildBatchQuizPrompt(
      mergedContext,
      mergedChunkTopic,
      lessonSummary || '',
      {
        distribution: batchOptions.distribution,
        userPrompt: batchOptions.userPrompt,
        chunkIds,
      },
      language
    );

    const response = await openaiQueueService.queueQuizGeneration(
      prompt.systemPrompt,
      prompt.userPrompt,
      true
    );

    return this.mapBatchQuizResponse(response, batchOptions, chunkIds);
  }

  private mapBatchQuizResponse(
    response: Awaited<ReturnType<typeof openaiQueueService.queueQuizGeneration>>,
    batchOptions: GenerateBatchQuizzesDto,
    citationChunkIds?: string[]
  ): BatchGeneratedQuizzesResponse {
    const parsedResponse = openaiQueueService.parseQuizResponse(response);
    const quizzes = Array.isArray(parsedResponse) ? parsedResponse : [parsedResponse];

    Logger.info(
      `[QuizGenerationService] Successfully generated ${quizzes.length} quizzes in batch`
    );

    const distributionMap = new Map<number, (typeof batchOptions.distribution)[number]>();
    let distIndex = 0;

    for (const dist of batchOptions.distribution) {
      const count = dist.count || 1;
      for (let i = 0; i < count; i++) {
        distributionMap.set(distIndex++, dist);
      }
    }

    const normalizeCitations = citationChunkIds != null && citationChunkIds.length > 0;

    return {
      quizzes: quizzes.map((q, index) => {
        const dist = distributionMap.get(index) || batchOptions.distribution[0];
        const explanation = normalizeCitations
          ? chunkCitationUtil.normalizeChunkCitationMarkers(q.explanation, citationChunkIds)
          : q.explanation;

        return {
          question: q.question,
          explanation,
          type: q.type || 'MULTIPLE_CHOICE',
          difficulty: q.difficulty || dist?.difficulty || 'MEDIUM',
          bloomLevel: q.bloomLevel || dist?.bloomLevel || 'UNDERSTAND',
          choices: q.choices.map(choice => ({
            text: choice.text,
            isCorrect: choice.isCorrect,
            feedback: choice.feedback || (choice.isCorrect ? 'Chính xác!' : 'Không chính xác.'),
          })),
        };
      }),
      count: quizzes.length,
    };
  }
}

// Export singleton instance
export default new QuizGenerationService();
