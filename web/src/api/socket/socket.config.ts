import { io, Socket } from "socket.io-client";
import { AUTH_STORAGE_KEY } from '@/utils/auth/crossTabAuth.utils';


const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";
const getSocketPath = () => {
  if (import.meta.env.VITE_SOCKET_PATH) {
    return import.meta.env.VITE_SOCKET_PATH;
  }

  try {
    return new URL(SOCKET_URL).port === "8888" ? "/api/v1/socket.io" : "/socket.io";
  } catch {
    return "/socket.io";
  }
};

export const socket: Socket = io(SOCKET_URL, {
  path: getSocketPath(),
  autoConnect: false, // chỉ connect khi cần
  // transports: ["websocket"], // tránh fallback sang polling
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  auth: {
    token: localStorage.getItem(AUTH_STORAGE_KEY),
  },
});
