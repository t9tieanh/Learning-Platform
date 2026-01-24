import http from 'http';
import express from 'express';
import { initSocket } from './app';

const app = express();
const server = http.createServer(app);

app.get('/health', (_req, res) => {
    res.status(200).send('OK');
});

initSocket(server);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Hello iam Learnova:socket_server running on port ${PORT}`));
