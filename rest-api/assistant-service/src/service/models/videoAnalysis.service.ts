import Logger from '~/utils/logger';
import AssemblyAIService from '~/service/utils/assemblyai.service';
import prismaService from '~/service/utils/prisma.service';

export interface VideoAnalysisEvent {
    lessonId: string;
    videoUrl: string;
}

class VideoAnalysisService {
    private static instance: VideoAnalysisService;

    private constructor() { }

    public static getInstance(): VideoAnalysisService {
        if (!VideoAnalysisService.instance) {
            VideoAnalysisService.instance = new VideoAnalysisService();
        }
        return VideoAnalysisService.instance;
    }

    public async handleVideoAnalysisEvent(event: VideoAnalysisEvent): Promise<void> {
        Logger.info(`Received video analysis event for lessonId: ${event.lessonId}, videoUrl: ${event.videoUrl}`);

        try {
            Logger.info('Starting video analysis flow...');

            // 1. Submit video for transcription
            const transcript = await AssemblyAIService.transcribeVideo(event.videoUrl);
            Logger.info(`Transcription submitted. Id: ${transcript.id}`);

            // 2. Save/Update lesson with transcriptId
            await prismaService.lesson.upsert({
                where: { id: event.lessonId },
                update: {
                    url: event.videoUrl,
                    transcriptId: transcript.id
                },
                create: {
                    id: event.lessonId,
                    url: event.videoUrl,
                    transcriptId: transcript.id
                }
            });

            Logger.info(`Lesson ${event.lessonId} updated with transcriptId ${transcript.id}`);
        } catch (error) {
            Logger.error(`Error processing video analysis event: ${error}`);
        }
    }

    public async processTranscriptCompletion(transcriptId: string): Promise<void> {
        const transcript = await AssemblyAIService.getTranscript(transcriptId);
        if (transcript && transcript.text) {
            const subtitles = await AssemblyAIService.getSubtitles(transcriptId, 'srt');
            await this.createOrUpdateLessonFromTranscript(transcriptId, transcript.text, subtitles, transcript.audio_url);
        }
    }

    private async createOrUpdateLessonFromTranscript(transcriptId: string, transcriptText: string, subtitles: string, audioUrl: string): Promise<void> {
        // Try to find by transcriptId first
        let lesson = await prismaService.lesson.findUnique({
            where: { transcriptId }
        });

        if (lesson) {
            Logger.info(`Updating lesson with transcriptId ${transcriptId}`);
            await prismaService.lesson.update({
                where: { id: lesson.id },
                data: {
                    transcript: transcriptText,
                    subtitles: subtitles,
                    url: audioUrl
                }
            });
            return;
        }

        // Try to find by URL
        const existingLessonByUrl = await prismaService.lesson.findFirst({
            where: { url: audioUrl }
        });

        if (existingLessonByUrl) {
            Logger.info(`Updating lesson with url ${audioUrl}`);
            await prismaService.lesson.update({
                where: { id: existingLessonByUrl.id },
                data: {
                    transcriptId: transcriptId,
                    transcript: transcriptText,
                    subtitles: subtitles
                }
            });
            return;
        }

        Logger.info(`Creating new lesson for transcriptId ${transcriptId}`);
        await prismaService.lesson.create({
            data: {
                transcriptId,
                transcript: transcriptText,
                subtitles: subtitles,
                url: audioUrl
            }
        });
    }
}

export default VideoAnalysisService;
