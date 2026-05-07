import Queue from 'bull';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import Logger from '~/utils/logger';
import { env } from '~/config/env';
import { ParsedQuiz, ParsedQuizChoice } from '~/prompts/quiz.prompt';
import { SingleQuizSchema, BatchQuizSchema, SingleQuiz, BatchQuiz, QuizChoice, RAGAnswerSchema, RAGAnswer } from '~/schemas/openai.schema';
import { json } from 'stream/consumers';

/**
 * OpenAI Queue Service Job Data Type
 */
interface OpenAiQueueJobData {
  systemPrompt: string;
  userPrompt: string;
  isBatch: boolean;
}

/**
 * OpenAI Queue Service
 * Uses Bull Queue for reliable retry logic with exponential backoff
 * Uses OpenAI Structured Outputs (JSON mode) for guaranteed JSON responses
 * Handles LLM calls with built-in failure recovery
 */
export class OpenAiQueueService {
  private llm: ChatOpenAI;
  private llmBatch: ChatOpenAI;
  private llmRAG: ChatOpenAI;
  private openaiQueue: Queue.Queue<OpenAiQueueJobData>;

  constructor() {
    // Single quiz generation LLM
    this.llm = new ChatOpenAI({
      model: 'gpt-4-turbo',
      temperature: 0.7,
      apiKey: env.OPENAI_API_KEY,
      maxTokens: 2000,
    });

    // Batch quiz generation LLM
    this.llmBatch = new ChatOpenAI({
      model: 'gpt-4-turbo',
      temperature: 0.7,
      apiKey: env.OPENAI_API_KEY,
      maxTokens: 4000,
    });

    // RAG answer generation LLM (lower temperature for consistency)
    this.llmRAG = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      apiKey: env.OPENAI_API_KEY,
      maxTokens: 800,
    });

    // Initialize Bull queue with Redis
    this.openaiQueue = new Queue<OpenAiQueueJobData>('openai-quiz-generation', {
      redis: {
        host: env.REDIS_DB_HOST || 'localhost',
        port: Number(env.REDIS_DB_PORT || '6379'),
        password: env.REDIS_DB_PASSWORD as string,
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000, // Start with 1 second, then 2s, then 4s
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    });

    this.setupProcessors();
  }

  /**
   * Setup queue processors
   */
  private setupProcessors(): void {
    this.openaiQueue.process(async (job: Queue.Job<OpenAiQueueJobData>) => {
      Logger.info(
        `[OpenAiQueueService] Processing job ${job.id} (attempt ${job.attemptsMade + 1}/3)`
      );

      const { systemPrompt, userPrompt, isBatch } = job.data;

      try {
        const response = await this.callOpenAi(systemPrompt, userPrompt, isBatch);
        Logger.info(
          `[OpenAiQueueService] Job ${job.id} completed successfully`
        );
        return response;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        Logger.warn(
          `[OpenAiQueueService] Job ${job.id} failed: ${errorMsg}. ` +
          `Attempt ${job.attemptsMade + 1}/3`
        );
        throw error;
      }
    });

    // Handle completed jobs
    this.openaiQueue.on('completed', (job: Queue.Job) => {
      Logger.info(`[OpenAiQueueService] Job ${job.id} completed`);
    });

    // Handle failed jobs
    this.openaiQueue.on('failed', (job: Queue.Job, err: Error) => {
      Logger.error(
        `[OpenAiQueueService] Job ${job.id} failed after 3 attempts: ${err.message}`
      );
    });

    // Handle stalled jobs (timeout)
    this.openaiQueue.on('stalled', (job: Queue.Job) => {
      Logger.warn(`[OpenAiQueueService] Job ${job.id} stalled, will retry`);
    });
  }

  /**
   * Queue a quiz generation request
   * Returns a promise that resolves when the job completes
   * 
   * @param systemPrompt - System message for the LLM
   * @param userPrompt - User message with quiz generation instruction
   * @param isBatch - Whether this is a batch request
   * @returns Promise resolving to parsed quiz(zes)
   */
  async queueQuizGeneration(
    systemPrompt: string,
    userPrompt: string,
    isBatch: boolean = false
  ): Promise<SingleQuiz | BatchQuiz> {
    try {
      // Add job to queue
      const job = await this.openaiQueue.add(
        {
          systemPrompt,
          userPrompt,
          isBatch,
        },
        {
          jobId: `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        }
      );

      Logger.info(`[OpenAiQueueService] Job queued: ${job.id}`);

      // Wait for job to complete
      const result = await job.finished();

      Logger.info(`[OpenAiQueueService] Job ${job.id} result received`);
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      Logger.error(
        `[OpenAiQueueService] Queue error: ${errorMsg}`
      );
      throw new Error(
        `Quiz generation failed after retries: ${errorMsg}`
      );
    }
  }

  /**
   * Direct OpenAI call with Structured Outputs (JSON mode)
   * 
   * @param systemPrompt - System message
   * @param userPrompt - User message
   * @param isBatch - Whether this is batch generation
   * @returns Parsed JSON response
   */
  private async callOpenAi(
    systemPrompt: string,
    userPrompt: string,
    isBatch: boolean = false
  ): Promise<SingleQuiz | BatchQuiz> {
    const llm = isBatch ? this.llmBatch : this.llm;
    const schema = isBatch ? BatchQuizSchema : SingleQuizSchema;

    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt),
    ];

    try {
      // Log the prompts to verify language
      Logger.info(
        `[OpenAiQueueService] Sending prompts for ${isBatch ? 'batch' : 'single'} quiz`
      );
      Logger.info(
        `[OpenAiQueueService] System prompt starts with: "${systemPrompt.substring(0, 100)}..."`
      );
      Logger.info(
        `[OpenAiQueueService] User prompt includes: "${userPrompt.substring(0, 100)}..."`
      );

      // Use withStructuredOutput for guaranteed JSON response
      const llmWithSchema = llm.withStructuredOutput(schema);
      const response = await llmWithSchema.invoke(messages);

      Logger.info(
        `[OpenAiQueueService] Structured output received for ${isBatch ? 'batch' : 'single'} quiz`
      );

      return response as SingleQuiz | BatchQuiz;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      Logger.error(
        `[OpenAiQueueService] Structured output error: ${errorMsg}`
      );
      throw new Error(`Failed to get structured output: ${errorMsg}`);
    }
  }

  /**
   * Parse quiz response (passthrough for compatibility)
   * With Structured Outputs, parsing is automatic
   * 
   * @param response - Response (already parsed)
   * @returns Parsed quiz
   */
  parseQuizResponse(response: SingleQuiz | BatchQuiz | string): ParsedQuiz | ParsedQuiz[] {
    try {
      // If it's a string, parse it
      if (typeof response === 'string') {
        const parsed = JSON.parse(response) as SingleQuiz | BatchQuiz;
        return this.convertToParseQuiz(parsed);
      }

      // Already parsed (from structured output)
      return this.convertToParseQuiz(response);
    } catch (error) {
      Logger.error(
        `[OpenAiQueueService] Failed to parse quiz response: ${error instanceof Error ? error.message : String(error)}`
      );
      throw new Error(
        `Invalid quiz response format. ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Convert structured output to ParsedQuiz format
   */
  private convertToParseQuiz(data: SingleQuiz | BatchQuiz): ParsedQuiz | ParsedQuiz[] {
    // Check if it's a batch response
    if ('quizzes' in data && Array.isArray(data.quizzes)) {
      return data.quizzes.map((q: SingleQuiz) => this.convertSingleQuiz(q));
    }

    // Single quiz
    return this.convertSingleQuiz(data as SingleQuiz);
  }

  /**
   * Convert single quiz to ParsedQuiz
   */
  private convertSingleQuiz(quiz: SingleQuiz): ParsedQuiz {
    // Validate quiz structure
    if (!quiz.question || !quiz.explanation || !Array.isArray(quiz.choices)) {
      throw new Error('Quiz missing required fields: question, explanation, choices');
    }

    if (quiz.choices.length < 2) {
      throw new Error('Quiz must have at least 2 choices');
    }

    const hasCorrectChoice = quiz.choices.some((c: QuizChoice) => c.isCorrect === true);
    if (!hasCorrectChoice) {
      throw new Error('Quiz must have at least one correct choice');
    }

    // Convert QuizChoice to ParsedQuizChoice
    const convertedChoices: ParsedQuizChoice[] = quiz.choices.map((c: QuizChoice) => ({
      text: c.text,
      isCorrect: c.isCorrect,
      feedback: c.feedback,
    }));

    return {
      question: quiz.question,
      explanation: quiz.explanation,
      choices: convertedChoices,
      confidence: quiz.confidence,
    };
  }

   /**
    * Generate RAG answer using structured outputs
    * 
    * @param systemPrompt - System message for RAG
    * @param userPrompt - User message with context and question
    * @returns Answer string
    */
   async queueRAGAnswer(
     systemPrompt: string,
     userPrompt: string
   ): Promise<string> {
     try {
       const messages = [
         new SystemMessage(systemPrompt),
         new HumanMessage(userPrompt),
       ];

       Logger.info(`[OpenAiQueueService] Calling RAG LLM with structured output', ${JSON.stringify(messages)}`);
       Logger.info(`[OpenAiQueueService] System prompt: ${systemPrompt}`);
       Logger.info(`[OpenAiQueueService] User prompt: ${userPrompt}`);

       // Use withStructuredOutput for guaranteed JSON response
       const llmWithSchema = this.llmRAG.withStructuredOutput(RAGAnswerSchema);
       const response = await llmWithSchema.invoke(messages) as RAGAnswer;

       Logger.info('[OpenAiQueueService] RAG answer generated successfully');

       return response.answer;
     } catch (error) {
       const errorMsg = error instanceof Error ? error.message : String(error);
       Logger.error(
         `[OpenAiQueueService] RAG generation error: ${errorMsg}`
       );
       throw new Error(`RAG answer generation failed: ${errorMsg}`);
     }
   }

  /**
    * Clean up queue resources
    */
   async close(): Promise<void> {
     await this.openaiQueue.close();
     Logger.info('[OpenAiQueueService] Queue closed');
   }
 }

// Export singleton instance
export default new OpenAiQueueService();
