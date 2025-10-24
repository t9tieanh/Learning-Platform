import http from 'http';
import express from 'express';
import { initSocket } from './app';

const app = express();
const server = http.createServer(app);

initSocket(server);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Socket server running on port ${PORT}`));
