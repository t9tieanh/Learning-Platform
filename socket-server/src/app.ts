import { Server } from 'socket.io';
import http from 'http';
import { registerChatHandlers } from './socket/events/chat.handler';

export const initSocket = async (httpServer: http.Server) => {
    const io = new Server(httpServer, {
        cors: { origin: "*" }
    });


    io.on("connection", (socket) => {
        console.log(`Client connected: ${socket.id}`);
        registerChatHandlers(io, socket);
    })
}