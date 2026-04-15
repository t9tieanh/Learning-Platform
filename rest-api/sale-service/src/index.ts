import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import { errorHandlingMiddleware } from './middleware/error-handler.midleware'
import RabbitMQService from './service/utils/rabbitmq.service';
import session from 'express-session';
import { env } from './config/env';
import indexRoute from '~/routes';
import { initSagas } from './sagas/init/initSaga';
import Logger from './utils/logger';
import { checkAndSeedData } from './utils/bootstrap';

const { startGrpcServer } = require('./grpc/server/saleServer.grpc')

const app = express();

app.use(session({
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 2 * 24 * 60 * 60 * 1000,
  },
}));
app.use(express.json());

//health check
app.get('/ping', (_req, res) => res.json({ message: 'pong' }));
app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});

app.use(indexRoute);
app.use(errorHandlingMiddleware);

startGrpcServer();

const PORT = env.PORT || 4000;

async function bootstrap() {
  try {
    // 1. Connect to RabbitMQ
    await RabbitMQService.getInstance();
    Logger.info('Connected to RabbitMQ');
    initSagas();

    // 2. Check and Seed Data (VIP Packages & Discounts)
    await checkAndSeedData();

    // 3. Start Express server
    app.listen(PORT, () => Logger.info(`Learnova:sale_service running at http://localhost:${PORT}`));

  } catch (error) {
    Logger.error(`Bootstrap failed: ${error}`);
    process.exit(1);
  }
}

bootstrap();
