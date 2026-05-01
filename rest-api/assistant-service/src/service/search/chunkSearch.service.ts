import Logger from '~/utils/logger';
import prismaService from '~/service/utils/prisma.service';

/**
 * Service for semantic search of lesson chunks using embeddings.
 * 
 * Queries PostgreSQL database function that calculates vector similarity
 * between user query embedding and stored chunk embeddings using pgvector.
 */
export class ChunkSearchService {
    /**
     * Search for most similar chunks within a lesson using embedding similarity.
     *
     * @param {string} lessonId - The ID of the lesson to search within
     * @param {number[]} queryEmbedding - The embedding vector of the user's query (768-dim)
     * @param {number} limit - Number of chunks to return (default: 2)
     * @returns {Promise<ChunkSearchResult[]>} - Array of matching chunks sorted by distance (lowest first)
     */
    async searchChunksByEmbedding(
        lessonId: string,
        queryEmbedding: number[],
        limit: number = 2
    ): Promise<ChunkSearchResult[]> {
        try {
            Logger.info(
                `[ChunkSearchService] Searching chunks for lessonId=${lessonId}, limit=${limit}`
            );

            // Validate embedding dimension
            if (queryEmbedding.length !== 768) {
                Logger.warn(
                    `[ChunkSearchService] Query embedding has ${queryEmbedding.length} dimensions, expected 768`
                );
            }

            // Call PostgreSQL function with native pgvector type
            // Prisma will automatically handle number[] -> vector(768) conversion
            const results = await prismaService.$queryRaw<ChunkSearchResult[]>`
                SELECT
                    chunk_id as id,
                    lesson_id as "lessonId",
                    content,
                    title,
                    summary,
                    chunk_index as "chunkIndex",
                    start_time as "startTime",
                    end_time as "endTime",
                    distance
                FROM search_lesson_chunks_by_embedding_v2(
                    ${lessonId},
                    ${queryEmbedding}::vector(768),
                    ${limit}::int
                )
            `;

            Logger.info(
                `[ChunkSearchService] Found ${results.length} matching chunk(s) for lessonId=${lessonId}`
            );

            return results;
        } catch (error) {
            Logger.error(
                `[ChunkSearchService] Error searching chunks for lessonId=${lessonId}: ${error}`
            );
            // Return empty array instead of throwing to allow graceful degradation
            return [];
        }
    }

    /**
     * Batch search multiple lessons in parallel.
     *
     * @param {Array<{lessonId: string, queryEmbedding: number[]}>} searchParams - Array of lesson IDs and embeddings to search
     * @param {number} limit - Limit per search (default: 2)
     * @returns {Promise<Map<string, ChunkSearchResult[]>>} - Map of lessonId → matching chunks
     */
    async batchSearchChunksByEmbedding(
        searchParams: Array<{ lessonId: string; queryEmbedding: number[] }>,
        limit: number = 2
    ): Promise<Map<string, ChunkSearchResult[]>> {
        const resultMap = new Map<string, ChunkSearchResult[]>();

        try {
            Logger.info(
                `[ChunkSearchService] Batch searching ${searchParams.length} lesson(s)`
            );

            // Execute all searches in parallel
            const searchPromises = searchParams.map((param) =>
                this.searchChunksByEmbedding(param.lessonId, param.queryEmbedding, limit)
                    .then((results) => ({
                        lessonId: param.lessonId,
                        results,
                    }))
                    .catch((error) => {
                        Logger.error(
                            `[ChunkSearchService] Batch search failed for lessonId=${param.lessonId}: ${error}`
                        );
                        return {
                            lessonId: param.lessonId,
                            results: [],
                        };
                    })
            );

            const allResults = await Promise.all(searchPromises);

            // Build result map
            for (const { lessonId, results } of allResults) {
                resultMap.set(lessonId, results);
            }

            return resultMap;
        } catch (error) {
            Logger.error(`[ChunkSearchService] Batch search error: ${error}`);
            return resultMap;
        }
    }
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Result of a chunk search query, including L2 distance score.
 */
export interface ChunkSearchResult {
    id: string; // chunk ID
    lessonId: string;
    content: string;
    title: string | null;
    summary: string | null;
    chunkIndex: number;
    startTime: string | null;
    endTime: string | null;
    distance: number; // L2 distance (lower = more similar)
}

/**
 * Search query with embedding.
 */
export interface ChunkSearchQuery {
    lessonId: string;
    queryEmbedding: number[];
    limit?: number;
}
