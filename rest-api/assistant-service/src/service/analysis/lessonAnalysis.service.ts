import Logger from '~/utils/logger';
import AssemblyAIService from '~/service/utils/assemblyai.service';
import prismaService from '~/service/utils/prisma.service';
import { DocumentService } from '~/service/utils/document.service';
import { LessonTypeEnum } from '~/enums/lessonType.enum';
import { LessonAnalysisEvent } from '~/dto/request/lesson-analysis.dto';
import { bullQueueService } from '~/service/utils/bullQueue.service';
import { ChunkingJobData } from '~/service/jobs/chunkingJob.processor';
import { BullJobType } from '~/enums/bullJobType.enum';
import redisService from '~/service/utils/redis.service';
import { AnalysisOutcome } from '~/enums/analysisOutcome.enum';
import { AnalysisStatus } from '@prisma/client';

class LessonAnalysisService {
    private static instance: LessonAnalysisService;
    private documentService: DocumentService;
    private processingLessons = new Set<string>();

    private constructor() {
        this.documentService = new DocumentService();
    }

    public static getInstance(): LessonAnalysisService {
        if (!LessonAnalysisService.instance) {
            LessonAnalysisService.instance = new LessonAnalysisService();
        }
        return LessonAnalysisService.instance;
    }

    /**
     * Entry point for lesson analysis events.
     */
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

    /**
     * Processes completion of external transcription.
     */
    public async processTranscriptCompletion(transcriptId: string): Promise<void> {
        const transcript = await AssemblyAIService.getTranscript(transcriptId);

        if (!transcript || !transcript.text || transcript.text.trim().split(/\s+/).length < 5) {
            const reason = !transcript || !transcript.text
                ? 'No audio/text detected'
                : 'Content too short for quality standards';

            await this.markLessonAsInvalid(transcriptId, reason);
            Logger.warn(`Lesson quality check failed for transcript ${transcriptId}: ${reason}`);
            return;
        }

        const subtitles = await AssemblyAIService.getSubtitles(transcriptId, 'srt');
        await this.createOrUpdateLessonFromTranscript(
            transcriptId,
            transcript.text,
            subtitles,
            transcript.audio_url
        );
    }

    /**
     * Marks a lesson as failed in quality check.
     */
    public async markLessonAsInvalid(transcriptId: string, reason: string): Promise<void> {
        try {
            const lesson = await prismaService.lesson.update({
                where: { transcriptId: transcriptId },
                data: {
                    isQualityValid: false,
                    qualityReason: reason,
                    status: AnalysisStatus.FAILED
                }
            });
            Logger.info(`Marked lesson with transcriptId ${transcriptId} (lessonId: ${lesson.id}) as invalid. Reason: ${reason}`);

            await redisService.publish(`analysis:${lesson.id}`, {
                lessonId: lesson.id,
                status: AnalysisStatus.FAILED,
                reason: reason
            });
        } catch (error) {
            Logger.error(`Error marking lesson as invalid for transcriptId ${transcriptId}: ${error}`);
        }
    }

    private async handleVideoAnalysis(event: LessonAnalysisEvent): Promise<void> {
        Logger.info('Starting video analysis flow...');

        const transcript = await AssemblyAIService.transcribeVideo(event.fileUrl);
        Logger.info(`Transcription submitted. Id: ${transcript.id}`);

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

        const content = await this.documentService.getPdfContentFromUrl(event.fileUrl);
        Logger.info(`Content extracted for lesson ${event.lessonId}`);

        await prismaService.lesson.upsert({
            where: { id: event.lessonId },
            update: { url: event.fileUrl, transcript: content },
            create: { id: event.lessonId, url: event.fileUrl, transcript: content },
        });

        Logger.info(`Lesson ${event.lessonId} updated with content.`);

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

            await this.enqueueChunkingJob({
                lessonId: lesson.id,
                subtitles,
            });

            return;
        }

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

    /**
     * Enqueue a chunking job to the Bull queue with deduplication.
     */
    private async enqueueChunkingJob(jobData: ChunkingJobData): Promise<void> {
        const lessonId = jobData.lessonId;

        if (this.processingLessons.has(lessonId)) {
            Logger.info(
                `[LessonAnalysisService] Skipping duplicate chunking job for lessonId=${lessonId} (already processing)`
            );
            return;
        }

        try {
            this.processingLessons.add(lessonId);

            const existingJob = await bullQueueService.lessonChunkingQueue.getJob(
                `chunking-${lessonId}`
            );

            if (existingJob && !existingJob.isCompleted() && !existingJob.isFailed()) {
                Logger.info(
                    `[LessonAnalysisService] Skipping duplicate chunking job for lessonId=${lessonId} (already in queue)`
                );
                return;
            }

            await bullQueueService.lessonChunkingQueue.add(
                BullJobType.LESSON_CHUNKING,
                jobData,
                {
                    jobId: `chunking-${lessonId}`,
                }
            );

            Logger.info(
                `[LessonAnalysisService] Enqueued chunking job for lessonId=${lessonId}`
            );
        } catch (error) {
            Logger.error(
                `[LessonAnalysisService] Failed to enqueue chunking job for lessonId=${lessonId} – ${error}`
            );
            this.processingLessons.delete(lessonId);
            throw error;
        } finally {
            setTimeout(() => {
                this.processingLessons.delete(lessonId);
            }, 5 * 60 * 1000);
        }
    }

}

export default LessonAnalysisService;
