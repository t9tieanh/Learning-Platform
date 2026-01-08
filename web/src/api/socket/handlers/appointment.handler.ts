// src/api/socket/handlers/appointment.handler.ts
import { socket } from '../socket.config'

export function initAppointmentSocketHandlers() {
  const onAppointmentNotification = (data: any) => {
    console.log('[frontend][socket][appointment] 📅 Received appointment_notification:', data)
  }

  // Đăng ký event
  socket.on('appointment_notification', onAppointmentNotification)
  console.log('[frontend][socket][appointment] handler registered ✅')

  // Cleanup khi unmount
  return () => {
    socket.off('appointment_notification', onAppointmentNotification)
    console.log('[frontend][socket][appointment] handler cleaned up 🧹')
  }
}
