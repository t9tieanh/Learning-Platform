import { Server, Socket } from 'socket.io';

function getRoomId(instructorId: string, studentId: string) {
    const ids = [`instructor_${instructorId}`, `student_${studentId}`].sort();
    return ids.join("_");
}

export const registerChatHandlers = (io: Server, socket: Socket) => {
    socket.on("join_room", ({ instructorId, studentId }) => {
        const roomId = getRoomId(instructorId, studentId);
        socket.join(roomId);
        console.log(`✅ Client ${socket.id} joined room: ${roomId}`);
    });

    socket.on("send_message", (data) => {
        // data = { message, senderId, instructorId, studentId }
        const roomId = getRoomId(data.instructorId, data.studentId);
        console.log(`💬 Message from ${data.senderId} in ${roomId}:`, data.message);
        io.to(roomId).emit("receive_message", {
            senderId: data.senderId,
            message: data.message,
            createdAt: Date.now(),
            instructorId: data.instructorId,
            studentId: data.studentId,
            senderRole: data.senderId === data.instructorId ? 'instructor' : 'student'
        });
    });

    socket.on("disconnect", () => {
        console.log(`❌ User disconnected: ${socket.id}`);
    });
}