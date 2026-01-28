import { Request, Response, NextFunction } from 'express';
import assemblyaiService from '~/service/models/assemblyai.service';
import sendResponse from '~/dto/response/send-response';

class TranscriptionController {
    async transcribe(req: Request, res: Response, next: NextFunction) {
        try {
            const { videoUrl } = req.body;

            if (!videoUrl) {
                res.status(400).json({ message: 'videoUrl is required' });
                return;
            }

            const result = await assemblyaiService.transcribeVideo(videoUrl);

            sendResponse(res, {
                code: 200,
                message: 'Transcription submitted successfully',
                result: result
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new TranscriptionController();
