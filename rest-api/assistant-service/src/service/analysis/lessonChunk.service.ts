import Logger from '~/utils/logger';
import prismaService from '~/service/utils/prisma.service';

const EMBEDDING_UPDATE_CONCURRENCY = 3;

export class LessonChunkService {
    public async updateEmbedding(
        chunkId: string,
        embeddingVector: number[] | null
    ): Promise<void> {
        try {
            if (embeddingVector) {
                await prismaService.$executeRaw`
                    UPDATE "lesson_chunks" 
                    SET embedding = ${embeddingVector}::vector(768)
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

    public async updateEmbeddingsBatch(
        updates: Array<{ chunkId: string; embeddingVector: number[] | null }>
    ): Promise<void> {
        try {
            for (let i = 0; i < updates.length; i += EMBEDDING_UPDATE_CONCURRENCY) {
                const window = updates.slice(i, i + EMBEDDING_UPDATE_CONCURRENCY);
                await Promise.all(
                    window.map(({ chunkId, embeddingVector }) =>
                        this.updateEmbedding(chunkId, embeddingVector)
                    )
                );
            }

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

export const lessonChunkService = new LessonChunkService();
