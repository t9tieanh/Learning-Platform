import { Server, Socket } from 'socket.io';

export const registerChatHandlers = (io: Server, socket: Socket) => {
    socket.on("join_room", ({ instructorId, studentId }) => {
        const roomId = `instructor_${instructorId}_student_${studentId}`;
        socket.join(roomId);
        console.log(`✅ Client ${socket.id} joined room: ${roomId}`);
    });

    socket.on("send_message", (data) => {
        // data = {message, sender, roomId}
        console.log(`💬 Message from ${data.sender} in ${data.roomId}:`, data.message);
        io.to(data.roomId).emit("receive_message", data)
    });

    socket.on("disconnect", () => {
        console.log(`❌ User disconnected: ${socket.id}`);
    });
}