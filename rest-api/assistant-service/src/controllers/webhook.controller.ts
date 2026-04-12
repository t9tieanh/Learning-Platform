import { Request, Response, NextFunction } from 'express';
import Logger from '~/utils/logger';

import LessonAnalysisService from '~/service/analysis/lessonAnalysis.service';
import sendResponse from '~/dto/response/send-response';
import { StatusCodes } from 'http-status-codes';

class WebhookController {
    async handleAssemblyAIWebhook(req: Request, res: Response, next: NextFunction) {
        try {
            Logger.info("Received AssemblyAI Webhook:");
            Logger.info(JSON.stringify(req.body, null, 2));

            const { status, transcript_id } = req.body;

            if (status === 'completed') {
                // Then process asynchronously in background to avoid timeout
                sendResponse(res, {
                    code: StatusCodes.OK,
                    message: 'Webhook received successfully'
                });

                // Process in background WITHOUT blocking webhook response
                LessonAnalysisService.getInstance()
                    .processTranscriptCompletion(transcript_id)
                    .catch((error) => {
                        Logger.error(
                            `[WebhookController] Background processing failed for transcript ${transcript_id}: ${error}`
                        );
                    });
            } else {
                sendResponse(res, {
                    code: StatusCodes.OK,
                    message: 'Webhook received successfully'
                });
            }
        } catch (error) {
            Logger.error(`Error handling webhook: ${error}`);
            next(error);
        }
    }
}

export default new WebhookController();
