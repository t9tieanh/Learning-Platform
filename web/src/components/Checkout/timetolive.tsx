import Countdown from 'react-countdown'
import { Timer } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const TimeToLive = ({ ttl }: { ttl: number }) => {
  const THRESHOLD_SECONDS = 300
  const navigate = useNavigate()

  const renderer = ({ days, hours, minutes, seconds, completed, total }: any) => {
    if (completed) {
      toast.error('Thời gian thanh toán đã hết hạn. Vui lòng tạo lại đơn hàng !')
      navigate('/')
    }

    const remainingMs = total
    const isUrgent = remainingMs <= THRESHOLD_SECONDS * 1000

    const containerClass = isUrgent
      ? 'timetolive bg-red-50 border-l-4 rounded-b-xl border-red-400 p-2 mb-6'
      : 'timetolive bg-yellow-50 border-l-4 rounded-b-xl border-yellow-400 p-2 mb-6'

    const iconClass = isUrgent ? 'w-4 h-4 text-red-500' : 'w-4 h-4 text-yellow-500'
    let formatted = ''
    if (days > 0) {
      formatted = `${days}d ${hours}h ${minutes}m ${seconds}s`
    } else if (hours > 0) {
      formatted = `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    } else {
      formatted = `${minutes}:${String(seconds).padStart(2, '0')}`
    }

    return (
      <div className={containerClass}>
        <div className='flex items-center'>
          <Timer className={iconClass} />
          <div className='ml-2'>
            <p className={isUrgent ? 'text-sm text-red-600' : 'text-sm text-gray-600'}>
              Bạn còn <span className='font-bold'>{formatted}</span> để hoàn tất thanh toán.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ttl is seconds -> convert to ms
  return <Countdown date={Date.now() + ttl * 1000} renderer={renderer} />
}

export default TimeToLive
