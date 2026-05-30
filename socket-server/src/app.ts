import { Server } from 'socket.io';
import http from 'http';
import { registerChatHandlers } from './socket/events/chat.handler';
import logger from './utils/logger';

export const initSocket = async (httpServer: http.Server) => {
    const io = new Server(httpServer, {});


    io.on("connection", (socket) => {
        logger.info(`Client connected: ${socket.id}`);
        registerChatHandlers(io, socket);
    })
}