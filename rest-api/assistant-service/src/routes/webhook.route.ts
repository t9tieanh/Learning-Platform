import { Router } from 'express';
import webhookController from '~/controllers/webhook.controller';
import verifyWebhook from '~/middleware/verifyWebhook.middleware';

const webhookRouter = Router();

webhookRouter.post('/assemblyai', verifyWebhook, webhookController.handleAssemblyAIWebhook);

export default webhookRouter;
