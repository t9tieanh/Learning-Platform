import { Request, Response, NextFunction } from 'express';
import Logger from '~/utils/logger';

import VideoAnalysisService from '~/service/models/videoAnalysis.service';
import sendResponse from '~/dto/response/send-response';
import { StatusCodes } from 'http-status-codes';

class WebhookController {
    async handleAssemblyAIWebhook(req: Request, res: Response, next: NextFunction) {
        try {
            Logger.info("Received AssemblyAI Webhook:");
            Logger.info(JSON.stringify(req.body, null, 2));

            const { status, transcript_id } = req.body;

            if (status === 'completed') {
                await VideoAnalysisService.getInstance().processTranscriptCompletion(transcript_id);
            }

            // Respond with 200 OK
            sendResponse(res, {
                code: StatusCodes.OK,
                message: 'Webhook received successfully'
            });
        } catch (error) {
            Logger.error(`Error handling webhook: ${error}`);
            next(error);
        }
    }
}

export default new WebhookController();
