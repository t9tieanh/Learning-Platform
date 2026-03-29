import Logger from '~/utils/logger';
import prismaService from '~/service/utils/prisma.service';
import { EmbeddingE5Service } from '~/service/embedding/embeddingE5.service';

export interface SearchChunkResult {
    id: string;
    lessonId: string;
    content: string;
    title: string | null;
    summary: string | null;
    chunkIndex: number;
    similarity: number;
}

/**
 * SearchService handles semantic search functionality using embeddings.
 * Generates embeddings for user queries and searches similar lesson chunks.
 */
export class SearchService {
    private embeddingService: EmbeddingE5Service;

    constructor(embeddingService: EmbeddingE5Service = new EmbeddingE5Service()) {
        this.embeddingService = embeddingService;
    }

    /**
     * Search for lesson chunks similar to a query using semantic embedding similarity.
     *
     * Workflow:
     * 1. Generate embedding for the user query using e5-base-v2 model
     * 2. Call Supabase PL/pgSQL function to find most similar chunks
     * 3. Return ranked chunks with similarity scores
     *
     * @param lessonId - The lesson ID to search within
     * @param query - The user's natural language query
     * @param limit - Maximum number of results to return (default 5)
     * @returns Promise<SearchChunkResult[]> - Array of similar chunks ranked by similarity
     */
    async searchChunks(
        lessonId: string,
        query: string,
        limit: number = 5
    ): Promise<SearchChunkResult[]> {
        try {
            Logger.info(
                `[SearchService] Searching chunks for lessonId=${lessonId}, query="${query}", limit=${limit}`
            );

            // Step 1: Generate embedding for the query
            // e5-base-v2 expects "query: " prefix for search queries (vs "passage: " for docs)
            const queryWithPrefix = `query: ${query}`;
            const embeddingsMap = await this.embeddingService.generateEmbeddingsForChunkContents([
                queryWithPrefix,
            ]);
            const queryEmbedding = embeddingsMap.get(0);

            if (!queryEmbedding) {
                throw new Error(
                    `[SearchService] Failed to generate embedding for query: "${query}"`
                );
            }

            Logger.info(
                `[SearchService] Generated embedding vector (dimension: ${queryEmbedding.length})`
            );

            // Step 2: Call the Supabase PL/pgSQL function to search similar chunks
            // Function: search_lesson_chunks_by_embedding_v2(lessonId TEXT, queryEmbedding vector(768), limit INT)
            // pgvector can parse JSON array as vector
            const results = await prismaService.$queryRaw<SearchChunkResult[]>`
                SELECT 
                    chunk_id as id,
                    lesson_id as "lessonId",
                    content,
                    title,
                    summary,
                    chunk_index as "chunkIndex",
                    similarity
                    FROM search_lesson_chunks_by_embedding_v2(
                    ${lessonId},
                    ${JSON.stringify(queryEmbedding)}::vector,
                    ${limit}::int
                )
            `;

            Logger.info(
                `[SearchService] Found ${results.length} similar chunk(s) for lessonId=${lessonId}`
            );

            return results;
        } catch (error) {
            Logger.error(
                `[SearchService.searchChunks] Error searching chunks – lessonId=${lessonId}, query="${query}" – ${error}`
            );
            throw error;
        }
    }
}

// Export singleton instance
export const searchService = new SearchService();
