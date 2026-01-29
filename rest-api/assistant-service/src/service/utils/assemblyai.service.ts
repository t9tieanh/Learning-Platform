import { AssemblyAI, Transcript } from 'assemblyai';
import { env } from '~/config/env';
import Logger from '~/utils/logger';

class AssemblyAIService {
    private client: AssemblyAI;

    constructor() {
        this.client = new AssemblyAI({
            apiKey: env.ASSEMBLYAI_API_KEY,
        });
    }

    async transcribeVideo(videoUrl: string): Promise<Transcript> {
        const webhookUrl = env.WEBHOOK_URL
            ? `${env.WEBHOOK_URL}/webhook/assemblyai`
            : undefined;

        Logger.info(`Submitting transcription job for ${videoUrl} with webhook ${webhookUrl}`);

        const params = {
            audio: videoUrl,
            webhook_url: webhookUrl,
            webhook_auth_header_name: 'x-assemblyai-webhook-secret',
            webhook_auth_header_value: env.ASSEMBLYAI_WEBHOOK_SECRET
        };

        const transcript = await this.client.transcripts.submit(params);
        return transcript;
    }

    async getTranscript(transcriptId: string): Promise<Transcript> {
        const transcript = await this.client.transcripts.get(transcriptId);
        return transcript;
    }

    async getSubtitles(transcriptId: string, format: 'srt' | 'vtt' = 'srt'): Promise<string> {
        const subtitles = await this.client.transcripts.subtitles(transcriptId, format);
        return subtitles;
    }
}

export default new AssemblyAIService();
