import { Socket } from 'socket.io'
import { Server as ServerIO, Namespace } from 'socket.io'

export interface ApiResponse<T> {
  status: 'success' | 'error'
  message: T
}

export enum EventSocket {
  // Common
  ERROR = 'error',
  CONNECT_ERROR = 'connect_error',

  // Class related
  JOIN_CLASSROOM = 'join-classroom',
  JOIN_SUCCESS = 'join-success',

  // Message related
  SEND_MESSAGE = 'send-message',
  NEW_MESSAGE = 'new-message'
}

export const sendToSocket = <T>(socket: Socket, event: EventSocket, payload: ApiResponse<T>) => {
  socket.emit(event, payload)
}

export interface Message {
  sender?: {
    name: string
    username: string
    avatarUrl: string
  }
  content: string
  sendDate: Date
}

export const sendToRoom = (io: ServerIO | Namespace, to: any, event: EventSocket, payload: Message) => {
  io.to(to).emit(event, payload)
}
