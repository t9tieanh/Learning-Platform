// src/api/socket/socket.context.tsx
import React, { createContext, useState, useCallback, useEffect } from 'react'
import { socket } from './socket.config'

interface ConnectParams {
  user?: { id: string; role: string }
  [key: string]: unknown
}

interface SocketContextType {
  socket: typeof socket
  connectSocket: (params?: ConnectParams) => void
  disconnectSocket: () => void
  isConnected: boolean
}

export const SocketContext = createContext<SocketContextType>({
  socket,
  connectSocket: () => {},
  disconnectSocket: () => {},
  isConnected: false
})

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(socket.connected)

  const connectSocket = useCallback((params?: ConnectParams) => {
    if (!socket.connected) {
      socket.auth = {
        ...socket.auth,
        ...params
      }
      // console.log('[frontend][socket] attempting connect with auth', socket.auth);
      socket.connect()
      // setIsConnected(true); // Chưa chắc connect được
    }
  }, [])

  const disconnectSocket = useCallback(() => {
    if (socket.connected) {
      socket.disconnect()
      setIsConnected(false)
    }
  }, [])

  useEffect(() => {
    const onConnect = () => {
      // console.log('[frontend][socket] connected id=', socket.id);
      setIsConnected(true)
      try {
        const authUser = (socket.auth as unknown as { user?: { id?: string; role?: string } })?.user
        if (authUser?.id && String(authUser.role || '').toLowerCase() === 'physician') {
          console.log('[frontend][socket] auto join physician room for', authUser.id)
          socket.emit('join_physician', authUser.id)
        }
      } catch {
        // noop
      }
    }
    const onDisconnect = (reason: unknown) => {
      console.log('[frontend][socket] disconnected reason=', reason)
      setIsConnected(false)
    }
    const onError = (err: unknown) => {
      console.error('[frontend][socket] error', err)
    }
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('connect_error', onError)
    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('connect_error', onError)
    }
  }, [])

  return (
    <SocketContext.Provider value={{ socket, connectSocket, disconnectSocket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}
