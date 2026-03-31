import Logger from '~/utils/logger';
import prismaService from '~/service/utils/prisma.service';
import redisService from '~/service/utils/redis.service';
import { SummaryService } from '~/service/analysis/summary.service';
import { EmbeddingE5Service } from '~/service/embedding/embeddingE5.service';
import { lessonChunkService } from '~/service/analysis/lessonChunk.service';
import { bullQueueService } from '~/service/utils/bullQueue.service';
import { AnalysisOutcome } from '~/enums/analysisOutcome.enum';
import { BullJobType } from '~/enums/bullJobType.enum';
import { BullJobDTO } from '~/dto/job/bulljob.dto';

export interface SummarizationJobData {
    lessonId: string;
    chunkCount: number;
}

/**
 * Summarization Job Processor
 * 
 * Runs Map-Reduce summarization on lesson chunks:
 *   - MAP: Summarize each chunk individually
 *   - REDUCE: Synthesize chunk summaries into lesson summary
 * 
 * Then generates and persists vector embeddings for semantic search.
 * 
 * Finally notifies long-polling clients via Redis pub/sub.
 */
export class SummarizationJobProcessor {
    private summaryService: SummaryService;
    private embeddingService: EmbeddingE5Service;

    constructor() {
        this.summaryService = new SummaryService();
        this.embeddingService = new EmbeddingE5Service();
    }

    /**
     * Process summarization job
     */
    async process(job: BullJobDTO<SummarizationJobData>): Promise<void> {
        const { lessonId, chunkCount } = job.data as SummarizationJobData;

        Logger.info(
            `[SummarizationJobProcessor] Starting summarization for lessonId=${lessonId}, chunkCount=${chunkCount}, jobId=${job.id}`
        );

        try {
            // Step 1: Run Map-Reduce summarization
            await this.summaryService.summarizeLesson(lessonId);

            Logger.info(
                `[SummarizationJobProcessor] Completed summarization for lessonId=${lessonId}`
            );

            // Step 2: Fetch all chunks for embedding generation
            Logger.info(
                `[SummarizationJobProcessor] Fetching chunks for embedding generation – lessonId=${lessonId}`
            );

            const chunks = await prismaService.lessonChunk.findMany({
                where: { lessonId },
                orderBy: { chunkIndex: 'asc' },
            });

            if (chunks.length > 0) {
                // Step 3: Generate embeddings for all chunk contents
                const chunkContents = chunks.map((chunk) => chunk.content);
                const embeddingMap = await this.embeddingService.generateEmbeddingsForChunkContents(
                    chunkContents
                );

                // Step 4: Update chunks with their embeddings in bulk
                Logger.info(
                    `[SummarizationJobProcessor] Updating ${chunks.length} chunk(s) with embeddings – lessonId=${lessonId}`
                );

                const updateData = chunks.map((chunk) => ({
                    chunkId: chunk.id,
                    embeddingVector: embeddingMap.get(chunk.chunkIndex) || null,
                }));

                await lessonChunkService.updateEmbeddingsBatch(updateData);

                Logger.info(
                    `[SummarizationJobProcessor] Successfully generated and persisted embeddings for lessonId=${lessonId}`
                );
            } else {
                Logger.warn(
                    `[SummarizationJobProcessor] No chunks found for embedding generation – lessonId=${lessonId}`
                );
            }

            // Step 5: Notify long-polling HTTP subscribers via Redis pub/sub
            Logger.info(
                `[SummarizationJobProcessor] Publishing completion event for lessonId=${lessonId}`
            );

            await redisService.publish(`analysis:${lessonId}`, {
                lessonId,
                status: AnalysisOutcome.COMPLETED,
            });

            Logger.info(
                `[SummarizationJobProcessor] Completed all steps for lessonId=${lessonId}`
            );
        } catch (error) {
            Logger.error(
                `[SummarizationJobProcessor] Error processing summarization for lessonId=${lessonId} – ${error}`
            );
            throw error;
        }
    }

    /**
     * Register the summarization job processor with Bull
     */
    register(): void {
        const processor = new SummarizationJobProcessor();
        
        bullQueueService.lessonSummarizationQueue.process(
            BullJobType.LESSON_SUMMARIZATION,
            2, // 2 concurrent jobs (LLM calls are heavy)
            async (job: BullJobDTO<SummarizationJobData>) => {
                return await processor.process(job);
            }
        );

        Logger.info('[SummarizationProcessor] Registered with Bull queue');
    }
}

// Singleton instance and export for backward compatibility
export const summarizationJobProcessor = new SummarizationJobProcessor();

export function registerSummarizationProcessor(): void {
    summarizationJobProcessor.register();
}
