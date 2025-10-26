import { ReactNode, useContext, useEffect } from 'react';
import { SocketContext } from '@/api/socket/socket.context';

const AuthenticationGate = ({ children }: { children: ReactNode }) => {
  const { connectSocket, disconnectSocket } = useContext(SocketContext);

  useEffect(() => {
    // ⚡ Khi component mount → thử kết nối socket
    const token = localStorage.getItem('user-storage');

    if (!token) {
      console.warn('⚠️ No access token found → skipping socket connection');
      return;
    }

    // 🧠 Connect socket kèm token (nếu server kiểm tra)
    connectSocket({ token });

    // 🧹 Khi component unmount → ngắt kết nối
    return () => {
      disconnectSocket();
    };
  }, [connectSocket, disconnectSocket]);

  // 🟢 Hiển thị nội dung sau khi xác thực
  return <>{children}</>;
};

export default AuthenticationGate;
