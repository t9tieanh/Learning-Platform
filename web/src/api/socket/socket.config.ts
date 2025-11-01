import { io, Socket } from "socket.io-client";


const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false, // chỉ connect khi cần
  transports: ["websocket"], // tránh fallback sang polling
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  auth: {
    token: localStorage.getItem('user-storage'),
  },
});