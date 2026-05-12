import Logger from '~/utils/logger';
import { RAGPrompts } from '~/prompts/rag.prompt';
import { searchService, SearchChunkResult } from '~/service/search/search.service';
import openaiQueueService from '~/service/queue/openaiQueue.service';
import { lessonChatHistoryService, LessonChatHistoryService } from '~/service/lesson-chat/lessonChatHistory.service';
import { lessonChatSemanticSearchService } from '~/service/lesson-chat/lessonChatSemanticSearch.service';
import { lessonChatQueryService } from '~/service/lesson-chat/lessonChat.query.service';

export interface RAGResult {
  answer: string;
  sources: Array<{
    chunkId: string;
    title: string | null;
    summary: string | null;
    chunkIndex: number;
    startTime: string | null;
    endTime: string | null;
    timestamp: string | null;
    similarity: number;
  }>;
  /** Set after persisting lesson chat history (same id for subsequent requests). */
  sessionId?: string;
}

/**
 * RAGService (Retrieval-Augmented Generation) implements context-aware QA.
 *
 * Flow:
 *   1. In parallel: chunk search, recent session transcript, semantic message recall (session only)
 *   2. Format chunk text as primary lesson context
 *   3. Merge session blocks (recent + semantic, de-duplicated) into the user prompt
 *   4. Call the LLM and return answer + chunk sources
 *
 * This ensures answers are grounded in lesson content, reducing hallucinations.
 */
export class LessonRAGService {

  constructor() { }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Answer a user question about a lesson using retrieved context.
   *
   * When `sessionId` is set:
   * - Loads recent messages (verbatim) and related messages (same session, pgvector RPC)
   * - Semantic hits that already appear in the recent window are skipped to save tokens
   *
   * @param lessonId - Lesson scope for chunk search
   * @param question - User question
   * @param sessionId - Optional chat session for multi-turn context
   * @param userId - Optional user id to fetch session notes
   */
  public async answerQuestion(
    lessonId: string,
    question: string,
    sessionId?: string | null,
    userId?: string | null
  ): Promise<RAGResult> {
    try {
      Logger.info(
        `[RAGService] Answering question for lessonId=${lessonId}, question="${question}"`
      );

      const sessionActive = sessionId != null && sessionId !== '';

      const [chunks, recentData, semanticHits, sessionDetail] = await Promise.all([
        searchService.searchChunks(lessonId, question, 10),
        sessionActive
          ? lessonChatHistoryService.buildRecentTranscriptForRag(sessionId!)
          : Promise.resolve({ transcript: '', messageIds: [] as string[] }),
        sessionActive
          ? lessonChatSemanticSearchService.searchRelatedMessages(sessionId!, question, 5)
          : Promise.resolve([]),
        sessionActive && userId
          ? lessonChatQueryService.getSessionDetail(sessionId!, userId)
          : Promise.resolve(null),
      ]);

      const userNotes = sessionDetail?.notes;

      if (chunks.length === 0) {
        Logger.warn(
          `[RAGService] No relevant chunks found for lessonId=${lessonId}, question="${question}"`
        );
        return {
          answer: 'Xin lỗi, không có nội dung liên quan đến câu hỏi của bạn trong bài học này.',
          sources: [],
        };
      }

      const retrievedIds = chunks.map(c => c.id);
      Logger.info(
        `[RAGService] Retrieved ${chunks.length} relevant chunk(s) for question="${question}". IDs: ${retrievedIds.join(', ')}`
      );

      const context = this.formatContext(chunks);

      const recentIdSet = new Set(recentData.messageIds);
      const semanticFiltered = semanticHits.filter((h) => !recentIdSet.has(h.id));
      const semanticTranscript =
        lessonChatSemanticSearchService.formatHitsForPrompt(semanticFiltered);

      const historyForPrompt = LessonChatHistoryService.composeSessionHistoryForPrompt(
        recentData.transcript,
        semanticTranscript
      );

      if (historyForPrompt?.trim()) {
        Logger.info(
          `[RAGService] Session context included (${historyForPrompt.length} chars, recentIds=${recentData.messageIds.length}, semantic=${semanticFiltered.length})`
        );
      } else if (sessionActive) {
        Logger.info(
          `[RAGService] No prior session messages to attach (first turn or empty session)`
        );
      }

      const answer = await this.generateAnswer(context, question, historyForPrompt, userNotes || undefined);

      // Filter sources to only include those cited in the answer text with @{{chunkId}}@
      const citedIds = Array.from(new Set([...answer.matchAll(/@{{(.*?)}}@/g)].map((m) => m[1])));
      Logger.info(`[RAGService] LLM cited ${citedIds.length} unique chunks: ${citedIds.join(', ')}`);

      const existingCitedChunks = chunks.filter((c) => citedIds.includes(c.id));
      const existingCitedIds = new Set(existingCitedChunks.map(c => c.id));
      const missingCitedIds = citedIds.filter(id => !existingCitedIds.has(id));

      let finalChunks = existingCitedChunks;

      if (missingCitedIds.length > 0) {
        Logger.info(`[RAGService] Fetching ${missingCitedIds.length} missing cited chunks from DB: ${missingCitedIds.join(', ')}`);
        const recoveredChunks = await searchService.getChunksByIds(missingCitedIds);
        finalChunks = [...existingCitedChunks, ...recoveredChunks];
      }

      if (finalChunks.length === 0) {
        finalChunks = chunks;
      }

      const result: RAGResult = {
        answer,
        sources: finalChunks.map((chunk) => ({
          chunkId: chunk.id,
          title: chunk.title,
          summary: chunk.summary,
          chunkIndex: chunk.chunkIndex,
          startTime: chunk.startTime,
          endTime: chunk.endTime,
          timestamp: chunk.timestamp,
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
      .map((chunk) => {
        const title = chunk.title ? `[Phần ${chunk.chunkIndex + 1}: ${chunk.title}]` : `[Phần ${chunk.chunkIndex + 1}]`;
        const idTag = `[ID: ${chunk.id}]`;

        const summary = chunk.summary
          ? `Tóm tắt: ${chunk.summary}\n`
          : '';

        return `${title} ${idTag}\n${summary}Nội dung: ${chunk.content}`;
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
   * @param context - Formatted chunks as lesson context
   * @param question - User's question
   * @param chatHistoryTranscript - Optional session context (recent + semantic blocks)
   * @returns LLM-generated answer
   */
  private async generateAnswer(
    context: string,
    question: string,
    chatHistoryTranscript?: string,
    userNotes?: string
  ): Promise<string> {
    try {
      Logger.info('[RAGService.generateAnswer] Calling OpenAI with Structured Outputs');

      const answer = await openaiQueueService.queueRAGAnswer(
        RAGPrompts.system(),
        RAGPrompts.human(context, question, chatHistoryTranscript, userNotes)
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
