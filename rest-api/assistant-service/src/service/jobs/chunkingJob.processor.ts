import Logger from '~/utils/logger';
import prismaService from '~/service/utils/prisma.service';
import { SemanticChunkingService } from '~/service/chunking/semanticChunking.service';
import { bullQueueService } from '~/service/utils/bullQueue.service';
import { BullJobType } from '~/enums/bullJobType.enum';
import { BullJobDTO } from '~/dto/job/bulljob.dto';

export interface ChunkingJobData {
    lessonId: string;
    subtitles: string;
    isSrt?: boolean;
}

/**
 * Chunking Job Processor
 * 
 * Processes lesson transcripts using semantic chunking.
 * Each chunk is stored in the database.
 * 
 * On successful completion, automatically enqueues the summarization job.
 */
export class ChunkingJobProcessor {
    private chunkingService: SemanticChunkingService;

    constructor() {
        this.chunkingService = new SemanticChunkingService();
    }

    /**
     * Process chunking job
     */
    async process(job: BullJobDTO<ChunkingJobData>): Promise<number> {
        const { lessonId, subtitles, isSrt = true } = job.data as ChunkingJobData;

        Logger.info(
            `[ChunkingJobProcessor] Starting chunking for lessonId=${lessonId}, jobId=${job.id}`
        );

        try {
            // Step 1: Run semantic chunking on the text
            const chunks = await this.chunkingService.processRawText(subtitles, {
                bufferSize: 3,
                percentileThreshold: 95,
                isSrt,
            });

            Logger.info(
                `[ChunkingJobProcessor] Produced ${chunks.length} chunk(s) for lessonId=${lessonId}`
            );

            // Step 2: Delete existing chunks for idempotency (safe to re-process)
            await prismaService.lessonChunk.deleteMany({ where: { lessonId } });

            // Step 3: Bulk-insert new chunks
            await prismaService.lessonChunk.createMany({
                data: chunks.map((chunk, index) => ({
                    lessonId,
                    content: chunk.content,
                    chunkIndex: index,
                    subtitleIndex: chunk.metadata?.subtitleIndex ?? null,
                    startTime: chunk.metadata?.startTime ?? null,
                    endTime: chunk.metadata?.endTime ?? null,
                    timestamp: chunk.metadata?.timestamp ?? null,
                    sentenceCount: chunk.metadata?.sentenceCount ?? null,
                    startSentenceIndex: chunk.metadata?.startSentenceIndex ?? null,
                    endSentenceIndex: chunk.metadata?.endSentenceIndex ?? null,
                })),
            });

            Logger.info(
                `[ChunkingJobProcessor] Successfully saved ${chunks.length} chunk(s) for lessonId=${lessonId}`
            );

            // Step 4: Automatically enqueue the summarization job
            await bullQueueService.lessonSummarizationQueue.add(
                BullJobType.LESSON_SUMMARIZATION,
                {
                    lessonId,
                    chunkCount: chunks.length,
                },
                {
                    jobId: `summarization-${lessonId}`,
                }
            );

            Logger.info(
                `[ChunkingJobProcessor] Enqueued summarization job for lessonId=${lessonId}`
            );

            return chunks.length;
        } catch (error) {
            Logger.error(
                `[ChunkingJobProcessor] Error processing chunking for lessonId=${lessonId} – ${error}`
            );
            throw error;
        }
    }

    /**
     * Register the chunking job processor with Bull
     */
    register(): void {
        const processor = new ChunkingJobProcessor();
        
        bullQueueService.lessonChunkingQueue.process(
            BullJobType.LESSON_CHUNKING,
            5, // 5 concurrent jobs
            async (job: BullJobDTO<ChunkingJobData>) => {
                return await processor.process(job);
            }
        );

        Logger.info('[ChunkingProcessor] Registered with Bull queue');
    }
}

// Singleton instance and export for backward compatibility
export const chunkingJobProcessor = new ChunkingJobProcessor();

export function registerChunkingProcessor(): void {
    chunkingJobProcessor.register();
}
