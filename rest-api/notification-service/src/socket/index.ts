// src/socket/socketClient.ts
import { io, Socket } from 'socket.io-client'
import { env } from '~/config/env'
import Logger from '~/utils/logger'

const SOCKET_URL = env.SOCKET_URL || 'http://socket-server:5001'

const socket: Socket = io(SOCKET_URL, {
  reconnection: true,
  transports: ['websocket']
})

socket.on('connect', () => {
  Logger.info(`Backend connected to socket server: ${socket.id}`)
})

socket.on('disconnect', (reason) => {
  Logger.warn(`⚠️ Disconnected from socket server: ${reason}`)
})

socket.on('connect_error', (err) => {
  Logger.error(`❌ Socket connection error: ${err.message}`)
})

export default socket
