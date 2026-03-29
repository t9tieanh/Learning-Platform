import EventEmitter from 'events';
import Logger from '~/utils/logger';
import prismaService from '~/service/utils/prisma.service';
import redisService from '~/service/utils/redis.service';
import { LessonEvent } from '~/enums/lessonEvents.enum';
import { SemanticChunkingService } from '~/service/chunking/semanticChunking.service';
import { EmbeddingE5Service } from '~/service/embedding/embeddingE5.service';
import { SummaryService } from '~/service/analysis/summary.service';
import { lessonChunkService } from '~/service/analysis/lessonChunk.service';
import {
    TranscriptSavedPayload,
    ChunkingCompletedPayload,
    ChunkingFailedPayload,
    SummarizationCompletedPayload,
    SummarizationFailedPayload,
    SummarizationStartedPayload,
} from '~/dto/event/lesson-analysis-events.dto';
import { AnalysisOutcome } from '~/enums/analysisOutcome.enum';

/**
 * Registers all lesson-related event listeners on the provided EventEmitter.
 *
 * Separating listener registration from the service that emits events keeps
 * each class focused on a single responsibility:
 *   - `LessonAnalysisService`  → emits events after DB writes
 *   - `LessonAnalysisEvents`   → reacts to those events (chunking, logging…)
 */
export class LessonAnalysisEvents {
    private emitter: EventEmitter;
    private chunkingService: SemanticChunkingService;
    private embeddingService: EmbeddingE5Service;
    private summaryService: SummaryService;

    constructor(
        emitter: EventEmitter,
        chunkingService: SemanticChunkingService,
        summaryService: SummaryService,
        embeddingService: EmbeddingE5Service = new EmbeddingE5Service()
    ) {
        this.emitter = emitter;
        this.chunkingService = chunkingService;
        this.embeddingService = embeddingService;
        this.summaryService = summaryService;
        this.register();
    }

    // -----------------------------------------------------------------------
    // Registration
    // -----------------------------------------------------------------------

    private register(): void {
        // When a transcript is saved → kick off the chunking pipeline
        this.emitter.on(
            LessonEvent.TRANSCRIPT_SAVED,
            (payload: TranscriptSavedPayload) => {
                this.onTranscriptSaved(payload).catch((err) => {
                    Logger.error(
                        `[${LessonEvent.CHUNKING_FAILED}] lessonId=${payload.lessonId} – ${err}`
                    );
                    this.emitter.emit(LessonEvent.CHUNKING_FAILED, {
                        lessonId: payload.lessonId,
                        error: err,
                    } satisfies ChunkingFailedPayload);
                });
            }
        );

        // When chunking completes → kick off the Map-Reduce summarization pipeline
        this.emitter.on(
            LessonEvent.CHUNKING_COMPLETED,
            ({ lessonId, chunkCount }: ChunkingCompletedPayload) => {
                Logger.info(
                    `[${LessonEvent.CHUNKING_COMPLETED}] lessonId=${lessonId} – saved ${chunkCount} chunk(s)`
                );

                this.onChunkingCompleted(lessonId, chunkCount).catch((err) => {
                    Logger.error(
                        `[${LessonEvent.SUMMARIZATION_FAILED}] lessonId=${lessonId} – ${err}`
                    );
                    this.emitter.emit(LessonEvent.SUMMARIZATION_FAILED, {
                        lessonId,
                        error: err,
                    } satisfies SummarizationFailedPayload);
                });
            }
        );

        // Log chunking errors
        this.emitter.on(
            LessonEvent.CHUNKING_FAILED,
            ({ lessonId, error }: ChunkingFailedPayload) => {
                Logger.error(
                    `[${LessonEvent.CHUNKING_FAILED}] lessonId=${lessonId} – ${error}`
                );
            }
        );

        // Log summarization completion
        this.emitter.on(
            LessonEvent.SUMMARIZATION_COMPLETED,
            ({ lessonId, chunkCount }: SummarizationCompletedPayload) => {
                Logger.info(
                    `[${LessonEvent.SUMMARIZATION_COMPLETED}] lessonId=${lessonId} – summarised ${chunkCount} chunk(s)`
                );
            }
        );

        // Log summarization errors
        this.emitter.on(
            LessonEvent.SUMMARIZATION_FAILED,
            ({ lessonId, error }: SummarizationFailedPayload) => {
                Logger.error(
                    `[${LessonEvent.SUMMARIZATION_FAILED}] lessonId=${lessonId} – ${error}`
                );
            }
        );
    }

    // -----------------------------------------------------------------------
    // Handlers
    // -----------------------------------------------------------------------

    /**
     * Triggered by `LessonEvent.TRANSCRIPT_SAVED`.
     *
     * Runs semantic chunking on the lesson's SRT subtitles and persists the
     * resulting chunks into the `lesson_chunks` table.
     *
     * Runs as async fire-and-forget so it never blocks the HTTP response path.
     */
    private async onTranscriptSaved(payload: TranscriptSavedPayload): Promise<void> {
        const { lessonId, subtitles, isSrt = true } = payload;

        Logger.info(
            `[${LessonEvent.TRANSCRIPT_SAVED}] Starting chunking pipeline for lessonId=${lessonId}`
        );

        // 1. Run semantic chunking on the text
        // 2 - 95 / 3 - 95 for e5base
        // 3 - 95 for openai
        const chunks = await this.chunkingService.processRawText(subtitles, {
            bufferSize: 3,
            percentileThreshold: 95,
            isSrt,
        });
        Logger.info(
            `Chunking produced ${chunks.length} chunk(s) for lessonId=${lessonId}`
        );

        // 2. Delete existing chunks for idempotency (safe to re-process)
        await prismaService.lessonChunk.deleteMany({ where: { lessonId } });

        // 3. Bulk-insert new chunks
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

        this.emitter.emit(LessonEvent.CHUNKING_COMPLETED, {
            lessonId,
            chunkCount: chunks.length,
        } satisfies ChunkingCompletedPayload);
    }

    /**
     * Triggered by `LessonEvent.CHUNKING_COMPLETED`.
     *
     * Runs Map-Reduce summarization:
     *   - MAP:    Summarises each chunk individually → saves to LessonChunk.summary
     *   - REDUCE: Synthesises all chunk summaries → saves to Lesson.summary
     *
     * Then generates and persists vector embeddings for all chunks using pgvector.
     */
    private async onChunkingCompleted(lessonId: string, chunkCount: number): Promise<void> {
        Logger.info(
            `[${LessonEvent.SUMMARIZATION_STARTED}] Starting Map-Reduce summarization for lessonId=${lessonId}`
        );

        this.emitter.emit(LessonEvent.SUMMARIZATION_STARTED, {
            lessonId,
            chunkCount,
        } satisfies SummarizationStartedPayload);

        // Step 1: Map-Reduce summarization
        await this.summaryService.summarizeLesson(lessonId);

        // Notify long-polling HTTP subscribers via Redis pub/sub
        await redisService.publish(`analysis:${lessonId}`, {
            lessonId,
            status: AnalysisOutcome.COMPLETED,
        });

        // Step 2: Fetch all chunks for embedding generation
        Logger.info(
            `[EmbeddingGeneration] Fetching chunks for embedding generation – lessonId=${lessonId}`
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
                `[EmbeddingGeneration] Updating ${chunks.length} chunk(s) with embeddings – lessonId=${lessonId}`
            );

            const updateData = chunks.map((chunk) => ({
                chunkId: chunk.id,
                embeddingVector: embeddingMap.get(chunk.chunkIndex) || null,
            }));

            await lessonChunkService.updateEmbeddingsBatch(updateData);

            Logger.info(
                `[EmbeddingGeneration] Successfully generated and persisted embeddings for lessonId=${lessonId}`
            );
        } else {
            Logger.warn(
                `[EmbeddingGeneration] No chunks found for embedding generation – lessonId=${lessonId}`
            );
        }

        this.emitter.emit(LessonEvent.SUMMARIZATION_COMPLETED, {
            lessonId,
            chunkCount,
        } satisfies SummarizationCompletedPayload);
    }
}
