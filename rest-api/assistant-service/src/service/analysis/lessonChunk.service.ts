import Logger from '~/utils/logger';
import prismaService from '~/service/utils/prisma.service';

/**
 * LessonChunkService handles operations on lesson chunks including
 * embedding generation and persistence.
 */
export class LessonChunkService {
    /**
     * Update a chunk's embedding vector in the database.
     *
     * Uses raw SQL since embedding is an Unsupported pgvector type in Prisma schema.
     *
     * @param chunkId - The chunk ID to update
     * @param embeddingVector - The embedding vector (number[] or null)
     */
    public async updateEmbedding(
        chunkId: string,
        embeddingVector: number[] | null
    ): Promise<void> {
        try {
            if (embeddingVector) {
                await prismaService.$executeRaw`
                    UPDATE "lesson_chunks" 
                    SET embedding = ${embeddingVector}::vector
                    WHERE id = ${chunkId}
                `;
            } else {
                await prismaService.$executeRaw`
                    UPDATE "lesson_chunks" 
                    SET embedding = NULL
                    WHERE id = ${chunkId}
                `;
            }
        } catch (error) {
            Logger.error(
                `[LessonChunkService.updateEmbedding] Failed to update embedding for chunkId=${chunkId} – ${error}`
            );
            throw error;
        }
    }

    /**
     * Bulk update embeddings for multiple chunks.
     *
     * @param updates - Array of { chunkId, embeddingVector } pairs
     */
    public async updateEmbeddingsBatch(
        updates: Array<{ chunkId: string; embeddingVector: number[] | null }>
    ): Promise<void> {
        try {
            const updatePromises = updates.map(({ chunkId, embeddingVector }) =>
                this.updateEmbedding(chunkId, embeddingVector)
            );

            await Promise.all(updatePromises);

            Logger.info(
                `[LessonChunkService.updateEmbeddingsBatch] Successfully updated embeddings for ${updates.length} chunk(s)`
            );
        } catch (error) {
            Logger.error(
                `[LessonChunkService.updateEmbeddingsBatch] Batch update failed – ${error}`
            );
            throw error;
        }
    }
}

// Export singleton instance
export const lessonChunkService = new LessonChunkService();
