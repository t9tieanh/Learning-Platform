// src/socket/socketClient.ts
import { io, Socket } from 'socket.io-client'

const SOCKET_URL = 'http://localhost:5001'

const socket: Socket = io(SOCKET_URL, {
  reconnection: true,
  transports: ['websocket']
})

socket.on('connect', () => {
  console.log('✅ Backend connected to socket server:', socket.id)
})

socket.on('disconnect', (reason) => {
  console.log('⚠️ Disconnected from socket server:', reason)
})

socket.on('connect_error', (err) => {
  console.error('❌ Socket connection error:', err.message)
})

export default socket
