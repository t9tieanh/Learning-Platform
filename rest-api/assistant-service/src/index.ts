import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import { errorHandlingMiddleware } from './middleware/error-handler.midleware'
import RabbitMQService from './service/utils/rabbitmq.service';
import initializeBullProcessors from '~/service/jobs/bullProcessorInit';
import { env } from './config/env';
import indexRoute from '~/routes';
import cookieParser from 'cookie-parser';
import Logger from './utils/logger';

const app = express();

app.use(express.json());
app.use(cookieParser());

//health check
app.get('/health', (_req, res) => {
    res.status(200).send('OK');
});

app.use(indexRoute);

app.use(errorHandlingMiddleware);

const PORT = env.PORT || 4000;

RabbitMQService.getInstance().then(async (rabbitClient) => {
    Logger.info('Connected to RabbitMQ');
}).catch((error) => {
    Logger.error(`Failed to connect to RabbitMQ: ${error}`);
});

// Initialize Bull job processors for lesson analysis pipeline
initializeBullProcessors().catch((error) => {
    Logger.error(`Failed to initialize Bull processors: ${error}`);
    process.exit(1);
});

app.listen(PORT, () => Logger.info(`Learnova:assistant_service running at http://localhost:${PORT}`));
