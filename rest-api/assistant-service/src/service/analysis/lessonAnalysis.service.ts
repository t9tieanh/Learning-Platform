import Logger from '~/utils/logger';
import AssemblyAIService from '~/service/utils/assemblyai.service';
import prismaService from '~/service/utils/prisma.service';
import { DocumentService } from '~/service/utils/document.service';
import { LessonTypeEnum } from '~/enums/lessonType.enum';
import { LessonAnalysisEvent } from '~/dto/request/lesson-analysis.dto';
import { bullQueueService } from '~/service/utils/bullQueue.service';
import { ChunkingJobData } from '~/service/jobs/chunkingJob.processor';
import { BullJobType } from '~/enums/bullJobType.enum';

class LessonAnalysisService {
    private static instance: LessonAnalysisService;

    private documentService: DocumentService;

    private constructor() {
        this.documentService = new DocumentService();
    }

    public static getInstance(): LessonAnalysisService {
        if (!LessonAnalysisService.instance) {
            LessonAnalysisService.instance = new LessonAnalysisService();
        }
        return LessonAnalysisService.instance;
    }

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    public async handleLessonAnalysisEvent(event: LessonAnalysisEvent): Promise<void> {
        Logger.info(
            `Received lesson analysis event for lessonId: ${event.lessonId}, type: ${event.fileType}`
        );

        try {
            if (event.fileType === LessonTypeEnum.VIDEO) {
                await this.handleVideoAnalysis(event);
            } else if (event.fileType === LessonTypeEnum.ARTICLE) {
                await this.handleArticleAnalysis(event);
            }
        } catch (error) {
            Logger.error(`Error processing lesson analysis event: ${error}`);
        }
    }

    public async processTranscriptCompletion(transcriptId: string): Promise<void> {
        const transcript = await AssemblyAIService.getTranscript(transcriptId);
        if (transcript && transcript.text) {
            const subtitles = await AssemblyAIService.getSubtitles(transcriptId, 'srt');
            await this.createOrUpdateLessonFromTranscript(
                transcriptId,
                transcript.text,
                subtitles,
                transcript.audio_url
            );
        }
    }

    // -----------------------------------------------------------------------
    // Private Handlers
    // -----------------------------------------------------------------------
    private async handleVideoAnalysis(event: LessonAnalysisEvent): Promise<void> {
        Logger.info('Starting video analysis flow...');

        // 1. Submit video for transcription
        const transcript = await AssemblyAIService.transcribeVideo(event.fileUrl);
        Logger.info(`Transcription submitted. Id: ${transcript.id}`);

        // 2. Save / update lesson with transcriptId
        await prismaService.lesson.upsert({
            where: { id: event.lessonId },
            update: {
                url: event.fileUrl,
                transcriptId: transcript.id,
            },
            create: {
                id: event.lessonId,
                url: event.fileUrl,
                transcriptId: transcript.id,
            },
        });

        Logger.info(`Lesson ${event.lessonId} updated with transcriptId ${transcript.id}`);
    }

    private async handleArticleAnalysis(event: LessonAnalysisEvent): Promise<void> {
        Logger.info('Starting article analysis flow...');

        // 1. Extract content from PDF / document
        const content = await this.documentService.getPdfContentFromUrl(event.fileUrl);
        Logger.info(`Content extracted for lesson ${event.lessonId}`);

        // 2. Save to DB
        await prismaService.lesson.upsert({
            where: { id: event.lessonId },
            update: { url: event.fileUrl, transcript: content },
            create: { id: event.lessonId, url: event.fileUrl, transcript: content },
        });

        Logger.info(`Lesson ${event.lessonId} updated with content.`);

        // 3. Enqueue chunking job → triggers chunking→summarization→embedding pipeline
        //    via Bull queue. processRawText() handles plain text as well as SRT.
        await this.enqueueChunkingJob({
            lessonId: event.lessonId,
            subtitles: content,
            isSrt: false,
        });
    }

    private async createOrUpdateLessonFromTranscript(
        transcriptId: string,
        transcriptText: string,
        subtitles: string,
        audioUrl: string
    ): Promise<void> {
        // Try to find by transcriptId first
        let lesson = await prismaService.lesson.findUnique({
            where: { transcriptId },
        });

        if (lesson) {
            Logger.info(`Updating lesson with transcriptId ${transcriptId}`);
            await prismaService.lesson.update({
                where: { id: lesson.id },
                data: {
                    transcript: transcriptText,
                    subtitles: subtitles,
                    url: audioUrl,
                },
            });

            // Enqueue chunking job → triggers chunking pipeline asynchronously
            await this.enqueueChunkingJob({
                lessonId: lesson.id,
                subtitles,
            });

            return;
        }

        // Try to find by URL
        const existingLessonByUrl = await prismaService.lesson.findFirst({
            where: { url: audioUrl },
        });

        if (existingLessonByUrl) {
            Logger.info(`Updating lesson with url ${audioUrl}`);
            await prismaService.lesson.update({
                where: { id: existingLessonByUrl.id },
                data: {
                    transcriptId,
                    transcript: transcriptText,
                    subtitles,
                },
            });

            await this.enqueueChunkingJob({
                lessonId: existingLessonByUrl.id,
                subtitles,
            });

            return;
        }

        Logger.info(`Creating new lesson for transcriptId ${transcriptId}`);
        const newLesson = await prismaService.lesson.create({
            data: {
                transcriptId,
                transcript: transcriptText,
                subtitles,
                url: audioUrl,
            },
        });

        await this.enqueueChunkingJob({
            lessonId: newLesson.id,
            subtitles,
        });
    }

    // -----------------------------------------------------------------------
    // Job Queueing Helpers
    // -----------------------------------------------------------------------

    /**
     * Enqueue a chunking job to the Bull queue
     * 
     * The chunking job will:
     * 1. Semantically chunk the transcript/content
     * 2. Persist chunks to database
     * 3. Auto-enqueue a summarization job on completion
     */
    private async enqueueChunkingJob(jobData: ChunkingJobData): Promise<void> {
        try {
            await bullQueueService.lessonChunkingQueue.add(
                BullJobType.LESSON_CHUNKING,
                jobData,
                {
                    jobId: `chunking-${jobData.lessonId}`,
                }
            );

            Logger.info(
                `[LessonAnalysisService] Enqueued chunking job for lessonId=${jobData.lessonId}`
            );
        } catch (error) {
            Logger.error(
                `[LessonAnalysisService] Failed to enqueue chunking job for lessonId=${jobData.lessonId} – ${error}`
            );
            throw error;
        }
    }

}

export default LessonAnalysisService;
