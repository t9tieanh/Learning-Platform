import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import Logger from '~/utils/logger';
import { env } from '~/config/env';
import { 
  GenerateQuizDto, 
  GenerateBatchQuizzesDto,
  QuizDistribution 
} from '~/dto/request/quiz-generation.dto';
import { 
  GeneratedQuizResponse,
  BatchGeneratedQuizzesResponse 
} from '~/dto/response/quiz-response.dto';
import { QuizPrompts, ParsedQuiz, QuizLanguage } from '~/prompts/quiz.prompt';

/**
 * QuizGenerationService handles OpenAI integration for quiz generation.
 * 
 * Features:
 * - Single quiz generation with context (lesson + chunk summary)
 * - Batch quiz generation with distribution requirements
 * - Async retry logic with exponential backoff
 * - Response parsing and validation
 * - Error handling and logging
 */
export class QuizGenerationService {
  private llm: ChatOpenAI;

  /** Max retries for OpenAI API calls */
  private static readonly MAX_RETRIES = 3;

  /** Initial backoff delay in ms */
  private static readonly INITIAL_BACKOFF_MS = 1000;

  constructor() {
    this.llm = new ChatOpenAI({
      model: 'gpt-4-turbo',
      temperature: 0.7,
      apiKey: env.OPENAI_API_KEY,
      maxTokens: 2000,
    });
  }

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
        difficulty: options.difficulty || 'MEDIUM',
        bloomLevel: options.bloomLevel || 'UNDERSTAND',
        questionType: options.questionType || 'MULTIPLE_CHOICE',
      },
      language
    );

    const response = await this.callOpenAiWithRetry(
      prompt.systemPrompt,
      prompt.userPrompt
    );

    // Ensure we're working with a single quiz, not an array
    const quiz = Array.isArray(response) ? response[0] : response;

    Logger.info(
      `[QuizGenerationService] Successfully generated single quiz: "${quiz.question.substring(0, 50)}..."`
    );

    return {
      question: quiz.question,
      explanation: quiz.explanation,
      type: quiz.type || options.questionType || 'MULTIPLE_CHOICE',
      difficulty: quiz.difficulty || options.difficulty || 'MEDIUM',
      bloomLevel: quiz.bloomLevel || options.bloomLevel || 'UNDERSTAND',
      choices: quiz.choices,
    };
  }

  /**
   * Generates multiple quiz questions in a batch with specific distribution requirements.
   * 
   * @param chunkContent - The lesson chunk content
   * @param chunkSummary - Summary of the chunk
   * @param lessonSummary - Summary of the lesson
   * @param batchOptions - Batch generation options with distribution requirements
   * @param language - Language for quiz generation ('en' for English, 'vi' for Vietnamese)
   * @returns Array of generated quizzes
   */
  async generateBatchQuizzes(
    chunkContent: string,
    chunkSummary: string,
    lessonSummary: string,
    batchOptions: GenerateBatchQuizzesDto,
    language: QuizLanguage = 'en'
  ): Promise<BatchGeneratedQuizzesResponse> {
    Logger.info(
      `[QuizGenerationService] Starting batch quiz generation for ${batchOptions.count} quizzes, language=${language}`
    );

    const prompt = QuizPrompts.buildBatchQuizPrompt(
      chunkContent,
      chunkSummary,
      lessonSummary,
      batchOptions,
      language
    );

    const response = await this.callOpenAiWithRetry(
      prompt.systemPrompt,
      prompt.userPrompt
    );

    // Response should be an array of quizzes
    const quizzes = Array.isArray(response) ? response : [response];

    Logger.info(
      `[QuizGenerationService] Successfully generated ${quizzes.length} quizzes in batch`
    );

    // Map distribution for defaults
    const distributionMap = new Map<number, any>();
    let distIndex = 0;
    for (const dist of batchOptions.distribution) {
      for (let i = 0; i < dist.count; i++) {
        distributionMap.set(distIndex++, dist);
      }
    }

    return {
      quizzes: quizzes.map((q, index) => {
        const dist = distributionMap.get(index) || batchOptions.distribution[0];
        return {
          question: q.question,
          explanation: q.explanation,
          type: q.type || 'MULTIPLE_CHOICE',
          difficulty: q.difficulty || dist?.difficulty || 'MEDIUM',
          bloomLevel: q.bloomLevel || dist?.bloomLevel || 'UNDERSTAND',
          choices: q.choices,
        };
      }),
      count: quizzes.length,
    };
  }

  // -------------------------------------------------------------------------
  // Private Helpers
  // -------------------------------------------------------------------------

  /**
   * Calls OpenAI API with exponential backoff retry logic.
   * 
   * @param systemPrompt - System message for the LLM
   * @param userPrompt - User message with quiz generation instruction
   * @returns Parsed quiz object(s)
   * @throws Error if all retries fail
   */
  private async callOpenAiWithRetry(
    systemPrompt: string,
    userPrompt: string
  ): Promise<ParsedQuiz | ParsedQuiz[]> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < QuizGenerationService.MAX_RETRIES; attempt++) {
      try {
        const messages = [
          new SystemMessage(systemPrompt),
          new HumanMessage(userPrompt),
        ];

        const response = await this.llm.invoke(messages);
        
        // Handle different response structures from LangChain
        let raw: string;
        if (!response) {
          throw new Error('Empty response from OpenAI');
        }
        
        if (typeof response.content === 'string') {
          raw = (response.content as string).trim();
        } else if (response.content && typeof response.content === 'object') {
          // Handle AIMessage or other structured responses
          raw = JSON.stringify(response.content);
        } else {
          // Try to extract text from alternative structures
          const contentStr = (response as any).text || (response as any).message || String(response);
          raw = contentStr.trim();
        }

        if (!raw) {
          throw new Error('No content extracted from OpenAI response');
        }

        Logger.info(
          `[QuizGenerationService] Raw response (first 100 chars): ${raw.substring(0, 100)}`
        );

        return this.parseQuizResponse(raw);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        const backoffMs = QuizGenerationService.INITIAL_BACKOFF_MS * Math.pow(2, attempt);
        Logger.warn(
          `[QuizGenerationService] Attempt ${attempt + 1} failed: ${lastError.message}. ` +
          `Retrying in ${backoffMs}ms...`
        );

        if (attempt < QuizGenerationService.MAX_RETRIES - 1) {
          await this.delay(backoffMs);
        }
      }
    }

    throw new Error(
      `[QuizGenerationService] Failed after ${QuizGenerationService.MAX_RETRIES} retries. ` +
      `Last error: ${lastError?.message}`
    );
  }

  /**
   * Parses the LLM response to extract structured quiz data.
   * Handles both single quiz and batch quiz responses.
   * 
   * @param raw - Raw response string from LLM
   * @returns Parsed quiz or quiz array
   * @throws Error if parsing fails
   */
  private parseQuizResponse(raw: string): ParsedQuiz | ParsedQuiz[] {
    try {
      // If raw is not a string, convert it
      const rawStr = typeof raw === 'string' ? raw : JSON.stringify(raw);
      
      // Try to find JSON in the response (sometimes LLM adds extra text)
      let parsed;
      try {
        parsed = JSON.parse(rawStr);
      } catch {
        // Try to extract JSON from the response if it contains extra text
        const jsonMatch = rawStr.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (!jsonMatch) {
          throw new Error(`No JSON found in response: ${rawStr.substring(0, 200)}`);
        }
        parsed = JSON.parse(jsonMatch[0]);
      }

      // Handle batch response (array of quizzes)
      if (Array.isArray(parsed)) {
        return parsed.map(q => this.validateQuizStructure(q));
      }

      // Handle single quiz response
      return this.validateQuizStructure(parsed);
    } catch (error) {
      Logger.error(
        `[QuizGenerationService] Failed to parse quiz response: ${error instanceof Error ? error.message : String(error)}`
      );
      throw new Error(
        `Invalid quiz response format. Expected valid JSON with quiz structure. ` +
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Validates that parsed quiz has all required fields.
   * 
   * @param quiz - Quiz object to validate
   * @returns Validated quiz
   * @throws Error if validation fails
   */
  private validateQuizStructure(quiz: any): ParsedQuiz {
    if (
      !quiz.question ||
      !quiz.explanation ||
      !Array.isArray(quiz.choices)
    ) {
      throw new Error(
        'Quiz missing required fields: question, explanation, choices'
      );
    }

    if (quiz.choices.length < 2) {
      throw new Error('Quiz must have at least 2 choices');
    }

    const hasCorrectChoice = quiz.choices.some((c: any) => c.isCorrect === true);
    if (!hasCorrectChoice) {
      throw new Error('Quiz must have at least one correct choice');
    }

    return {
      question: quiz.question,
      explanation: quiz.explanation,
      type: quiz.type,
      difficulty: quiz.difficulty,
      bloomLevel: quiz.bloomLevel,
      confidence: quiz.confidence,
      choices: quiz.choices.map((c: any) => ({
        text: c.text,
        isCorrect: c.isCorrect === true,
        feedback: c.feedback,
      })),
    };
  }

  /**
   * Utility: Sleep for given milliseconds.
   * 
   * @param ms - Milliseconds to delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export default new QuizGenerationService();
