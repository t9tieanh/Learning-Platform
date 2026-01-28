import { Request, Response, NextFunction } from 'express';
import Logger from '~/utils/logger';

class WebhookController {
    async handleAssemblyAIWebhook(req: Request, res: Response, next: NextFunction) {
        try {
            Logger.info("Received AssemblyAI Webhook:");
            Logger.info(JSON.stringify(req.body, null, 2));

            // Respond with 200 OK to acknowledge receipt
            res.status(200).send('OK');
        } catch (error) {
            Logger.error(`Error handling webhook: ${error}`);
            next(error);
        }
    }
}

export default new WebhookController();
