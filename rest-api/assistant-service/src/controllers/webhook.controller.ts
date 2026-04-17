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
                        // Mark as invalid if background processing fails completely
                        LessonAnalysisService.getInstance()
                            .markLessonAsInvalid(transcript_id, `Background processing error: ${error.message || error}`)
                            .catch(e => Logger.error(`Failed to mark lesson as invalid: ${e}`));
                    });
            } else if (status === 'error') {
                // If AssemblyAI fails at their end
                Logger.error(`AssemblyAI reported error for transcript ${transcript_id}`);
                LessonAnalysisService.getInstance()
                    .markLessonAsInvalid(transcript_id, 'AssemblyAI processing failed')
                    .catch(e => Logger.error(`Failed to mark lesson as invalid for AI error: ${e}`));

                sendResponse(res, {
                    code: StatusCodes.OK,
                    message: 'Webhook received and error logged'
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
