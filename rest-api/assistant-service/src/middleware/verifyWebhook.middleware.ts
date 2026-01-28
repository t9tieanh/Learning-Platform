import { Request, Response, NextFunction } from 'express';
import { env } from '~/config/env';
import Logger from '~/utils/logger';

const verifyWebhook = (req: Request, res: Response, next: NextFunction) => {
    const secretHeader = req.headers['x-assemblyai-webhook-secret'];

    if (!secretHeader || secretHeader !== env.ASSEMBLYAI_WEBHOOK_SECRET) {
        Logger.warn('Unauthorized webhook attempt: Invalid or missing secret header');
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    next();
};

export default verifyWebhook;
