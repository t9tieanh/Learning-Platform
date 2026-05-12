import Logger from '~/utils/logger';
import prismaService from '~/service/utils/prisma.service';
import { EmbeddingE5Service } from '~/service/embedding/embeddingE5.service';
import { SearchChunkResponseDto } from '~/dto/response/search-response.dto';

export interface SearchChunkResult {
    id: string;
    lessonId: string;
    content: string;
    title: string | null;
    summary: string | null;
    chunkIndex: number;
    startTime: string | null;
    endTime: string | null;
    timestamp: string | null;
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

            const queryEmbedding = await this.embeddingService.embedQuery(query);

            if (!queryEmbedding) {
                throw new Error(
                    `[SearchService] Failed to generate embedding for query: "${query}"`
                );
            }

            Logger.info(
                `[SearchService] Generated embedding vector (dimension: ${queryEmbedding.length})`
            );

            // Step 2: Call the Supabase PL/pgSQL function to search similar chunks
            // We only fetch ID and similarity here to avoid column name mismatches in raw SQL
            const searchResults = await prismaService.$queryRaw<any[]>`
                SELECT 
                    chunk_id as id,
                    similarity
                    FROM search_lesson_chunks_by_embedding_v2(
                    ${lessonId},
                    ${queryEmbedding}::vector(768),
                    ${limit}::int
                )
            `;

            if (searchResults.length === 0) return [];

            // Step 3: Fetch full chunk details using Prisma Client (Type-safe mapping)
            const chunkIds = searchResults.map(r => r.id);
            const chunksFromDb = await prismaService.lessonChunk.findMany({
                where: { id: { in: chunkIds } }
            });

            // Step 4: Map back to SearchChunkResult and restore similarity scores
            const finalResults: SearchChunkResult[] = searchResults.map(searchResult => {
                const dbChunk = chunksFromDb.find(c => c.id === searchResult.id);
                return dbChunk ? new SearchChunkResponseDto(dbChunk, searchResult.similarity) : null;
            }).filter((res): res is SearchChunkResult => res !== null);

            Logger.info(
                `[SearchService] Found ${finalResults.length} similar chunk(s) for lessonId=${lessonId}`
            );

            return finalResults;
        } catch (error) {
            Logger.error(
                `[SearchService.searchChunks] Error searching chunks – lessonId=${lessonId}, query="${query}" – ${error}`
            );
            throw error;
        }
    }

    /**
     * Fetch full chunk details for a given list of IDs.
     * Useful for recovering sources cited by LLM from previous conversation turns.
     */
    async getChunksByIds(ids: string[]): Promise<SearchChunkResult[]> {
        if (ids.length === 0) return [];
        try {
            const chunksFromDb = await prismaService.lessonChunk.findMany({
                where: { id: { in: ids } }
            });

            return chunksFromDb.map(c => new SearchChunkResponseDto(c, 1.0));
        } catch (error) {
            Logger.error(
                `[SearchService.getChunksByIds] Error fetching chunks by IDs – ${error}`
            );
            return [];
        }
    }
}

// Export singleton instance
export const searchService = new SearchService();
