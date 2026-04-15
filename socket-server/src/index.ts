import http from 'http';
import express from 'express';
import { initSocket } from './app';
import logger from './utils/logger';

const app = express();
const server = http.createServer(app);

app.get('/health', (_req, res) => {
    res.status(200).send('OK');
});

initSocket(server);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => logger.info(`Learnova:socket_server running on port ${PORT}`));
