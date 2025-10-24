import { Server } from 'socket.io';
import http from 'http';
import { registerChatHandlers } from './socket/events/chat.handler';

export const initSocket = async (httpServer: http.Server) => {
    const io = new Server(httpServer, {
        cors: { origin: "*" }
    });

    // Check authen before connect socket
    // io.use((socket, next) => {
    //     const token = socket.handshake.auth?.token; 
    //     if (!token) {
    //         return next(new Error("No token provided"));
    //     }

    //     try {
    //         const user = verifyToken(token);  // grpc user-service
    //         (socket as any).user = user; 
    //         next();
    //     } catch (err) {
    //         next(new Error("Invalid token"));
    //     }
    // });


    io.on("connection", (socket) => {
        console.log(`Client connected: ${socket.id}`);
        registerChatHandlers(io, socket);
    })
}