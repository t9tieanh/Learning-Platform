import { ReactNode, useContext, useEffect } from 'react'
import { SocketContext } from '@/api/socket/socket.context'
import { AUTH_STORAGE_KEY } from '@/utils/auth/crossTabAuth.utils'

const AuthenticationGate = ({ children }: { children: ReactNode }) => {
  const { connectSocket, disconnectSocket } = useContext(SocketContext)

  useEffect(() => {
    // ⚡ Khi component mount → thử kết nối socket
    const token = localStorage.getItem(AUTH_STORAGE_KEY)

    if (!token) {
      console.warn('⚠️ No access token found → skipping socket connection')
      return
    }

    // 🧠 Connect socket kèm token (nếu server kiểm tra)
    connectSocket({ token })

    // 🧹 Khi component unmount → ngắt kết nối
    return () => {
      console.log('NGAT KET NOI')
      disconnectSocket()
    }
  }, [connectSocket, disconnectSocket])

  // 🟢 Hiển thị nội dung sau khi xác thực
  return <>{children}</>
}

export default AuthenticationGate
