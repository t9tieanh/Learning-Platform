import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import Logger from '~/utils/logger';
import { RAGPrompts } from '~/prompts/rag.prompt';
import { searchService, SearchChunkResult } from '~/service/search/search.service';
import openaiQueueService from '~/service/queue/openaiQueue.service';

export interface RAGResult {
    answer: string;
    sources: Array<{
        chunkId: string;
        title: string | null;
        chunkIndex: number;
        similarity: number;
    }>;
}

/**
 * RAGService (Retrieval-Augmented Generation) implements context-aware QA.
 *
 * Flow:
 *   1. Search for similar chunks using embeddings (semantic search)
 *   2. Format retrieved chunks as context
 *   3. Send context + question to LLM with Structured Outputs
 *   4. Return LLM's answer + source metadata
 *
 * This ensures answers are grounded in lesson content, reducing hallucinations.
 */
export class LessonRAGService {
  
  constructor() {}

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Answer a user question about a lesson using retrieved context.
   *
   * Workflow:
   *   1. Search for up to 5 most similar chunks
   *   2. Format chunks as context (title + summary + content)
   *   3. Send to LLM with system prompt + context + question
   *   4. Return answer + source references
   *
   * @param lessonId - The lesson to search within
   * @param question - User's natural language question
   * @returns Promise containing answer and source chunk references
   */
  public async answerQuestion(lessonId: string, question: string): Promise<RAGResult> {
    try {
      Logger.info(
        `[RAGService] Answering question for lessonId=${lessonId}, question="${question}"`
      );

      // Step 1: Search for relevant chunks
      const chunks = await searchService.searchChunks(lessonId, question, 3);

      if (chunks.length === 0) {
        Logger.warn(
          `[RAGService] No relevant chunks found for lessonId=${lessonId}, question="${question}"`
        );
        return {
          answer: 'Xin lỗi, không có nội dung liên quan đến câu hỏi của bạn trong bài học này.',
          sources: [],
        };
      }

      Logger.info(
        `[RAGService] Retrieved ${chunks.length} relevant chunk(s) for question="${question}"`
      );

      // Step 2: Format context from retrieved chunks
      const context = this.formatContext(chunks);

      // Step 3: Send to LLM with RAG prompt (using Structured Outputs)
      const answer = await this.generateAnswer(context, question);

      // Step 4: Build result with source references
      const result: RAGResult = {
        answer,
        sources: chunks.map((chunk) => ({
          chunkId: chunk.id,
          title: chunk.title,
          chunkIndex: chunk.chunkIndex,
          similarity: chunk.similarity,
        })),
      };

      Logger.info(`[RAGService] Generated answer for lessonId=${lessonId}`);
      return result;
    } catch (error) {
      Logger.error(
        `[RAGService.answerQuestion] Error answering question – lessonId=${lessonId}, question="${question}" – ${error}`
      );
      throw error;
    }
  }

    // -------------------------------------------------------------------------
    // Private Helpers
    // -------------------------------------------------------------------------

    /**
     * Format retrieved chunks as context string.
     *
     * Format:
     * ```
     * [Chunk 0 - Title]
     * Summary: ...
     * Content: ...
     *
     * [Chunk 1 - Title]
     * Summary: ...
     * Content: ...
     * ```
     *
     * @param chunks - Array of retrieved search results
     * @returns Formatted context string for LLM
     */
    private formatContext(chunks: SearchChunkResult[]): string {
        return chunks
            .map((chunk, index) => {
                const title = chunk.title ? `[Phần ${chunk.chunkIndex + 1}: ${chunk.title}]` : `[Phần ${chunk.chunkIndex + 1}]`;

                const summary = chunk.summary
                    ? `Tóm tắt: ${chunk.summary}\n`
                    : '';

                return `${title}\n${summary}Nội dung: ${chunk.content}`;
            })
            .join('\n\n---\n\n');
    }

    /**
     * Generate answer using LLM with RAG context (using Structured Outputs).
     * 
     * Uses OpenAiQueueService for:
     * - Structured output guarantee (always returns valid JSON)
     * - Reliable error handling
     * - Future Bull Queue integration for retry logic
     *
     * @param context - Formatted chunks as context
     * @param question - User's question
     * @returns LLM-generated answer
     */
    private async generateAnswer(context: string, question: string): Promise<string> {
        try {
            Logger.info('[RAGService.generateAnswer] Calling OpenAI with Structured Outputs');
            
            const answer = await openaiQueueService.queueRAGAnswer(
                RAGPrompts.system(),
                RAGPrompts.human(context, question)
            );

            Logger.info('[RAGService.generateAnswer] Answer generated successfully');
            return answer;
        } catch (error) {
            Logger.error(`[RAGService.generateAnswer] LLM call failed – ${error}`);
            throw error;
        }
    }
}

// Export singleton instance
export const lessonRAGService = new LessonRAGService();
