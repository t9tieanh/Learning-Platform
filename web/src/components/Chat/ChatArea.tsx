import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Phone, Video, MoreVertical, Send, Image, Paperclip, ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  content: string
  sender: 'me' | 'other'
  timestamp: string
}

interface ChatAreaProps {
  conversationId?: string
  onBack?: () => void
}

const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Chào bạn! Bạn khỏe không?',
    sender: 'other',
    timestamp: '14:23'
  },
  {
    id: '2',
    content: 'Mình khỏe, cảm ơn bạn nha!',
    sender: 'me',
    timestamp: '14:24'
  },
  {
    id: '3',
    content: 'Hôm nay bạn có rảnh không? Mình muốn hỏi về dự án',
    sender: 'other',
    timestamp: '14:25'
  },
  {
    id: '4',
    content: 'Có chứ, bạn cứ hỏi đi',
    sender: 'me',
    timestamp: '14:26'
  },
  {
    id: '5',
    content: 'Tuyệt vời! Để mình gửi file cho bạn nhé',
    sender: 'other',
    timestamp: '14:27'
  },
  {
    id: '5',
    content: 'Tuyệt vời! Để mình gửi file cho bạn nhé',
    sender: 'other',
    timestamp: '14:27'
  },
  {
    id: '5',
    content: 'Tuyệt vời! Để mình gửi file cho bạn nhé',
    sender: 'other',
    timestamp: '14:27'
  },
  {
    id: '5',
    content: 'Tuyệt vời! Để mình gửi file cho bạn nhé',
    sender: 'other',
    timestamp: '14:27'
  },
  {
    id: '5',
    content: 'Tuyệt vời! Để mình gửi file cho bạn nhé',
    sender: 'other',
    timestamp: '14:27'
  },
  {
    id: '5',
    content: 'Tuyệt vời! Để mình gửi file cho bạn nhé',
    sender: 'other',
    timestamp: '14:27'
  }
]
export const ChatArea = ({ conversationId, onBack }: ChatAreaProps) => {
  const [message, setMessage] = useState('')

  if (!conversationId) {
    return (
      <div className='flex items-center justify-center h-full bg-gray-50'>
        <div className='text-center'>
          <div className='text-6xl mb-4'>💬</div>
          <h3 className='text-xl font-semibold mb-2'>Chọn một cuộc trò chuyện</h3>
          <p className='text-gray-500'>Chọn từ danh sách bên trái để bắt đầu nhắn tin</p>
        </div>
      </div>
    )
  }

  const handleSend = () => {
    if (message.trim()) {
      setMessage('')
    }
  }

  return (
    <div className='flex flex-col flex-1 h-full min-h-0 bg-gray-50'>
      {/* Header */}
      <div className='flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm'>
        <div className='flex items-center gap-3'>
          {onBack && (
            <Button variant='ghost' size='icon' className='md:hidden text-gray-600 hover:bg-gray-100' onClick={onBack}>
              <ChevronLeft className='h-5 w-5' />
            </Button>
          )}
          <Avatar className='h-10 w-10'>
            <AvatarImage src='https://api.dicebear.com/7.x/avataaars/svg?seed=1' />
            <AvatarFallback>N</AvatarFallback>
          </Avatar>
          <div>
            <h3 className='font-semibold text-gray-800'>Nguyễn Văn A</h3>
            <p className='text-xs text-green-500'>● Đang hoạt động</p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='icon' className='text-gray-600 hover:bg-gray-100'>
            <Phone className='h-5 w-5' />
          </Button>
          <Button variant='ghost' size='icon' className='text-gray-600 hover:bg-gray-100'>
            <Video className='h-5 w-5' />
          </Button>
          <Button variant='ghost' size='icon' className='text-gray-600 hover:bg-gray-100'>
            <MoreVertical className='h-5 w-5' />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent'>
        {mockMessages.map((msg) => (
          <div
            key={msg.id}
            className={cn('flex items-end gap-2', msg.sender === 'me' ? 'justify-end' : 'justify-start')}
          >
            {msg.sender === 'other' && (
              <Avatar className='h-8 w-8'>
                <AvatarImage src='https://api.dicebear.com/7.x/avataaars/svg?seed=1' />
                <AvatarFallback>N</AvatarFallback>
              </Avatar>
            )}

            <div
              className={cn(
                'max-w-[70%] px-4 py-2 rounded-2xl shadow-sm transition-colors',
                msg.sender === 'me'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
              )}
            >
              <p className='text-sm leading-relaxed'>{msg.content}</p>
              <p className={cn('text-[11px] mt-1 text-right', msg.sender === 'me' ? 'text-blue-100' : 'text-gray-400')}>
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className='p-4 bg-white border-t shadow-sm'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='icon' className='text-gray-500 hover:bg-gray-100'>
            <Image className='h-5 w-5' />
          </Button>
          <Button variant='ghost' size='icon' className='text-gray-500 hover:bg-gray-100'>
            <Paperclip className='h-5 w-5' />
          </Button>

          <Input
            placeholder='Nhập tin nhắn...'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className='flex-1 rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-0 px-4 py-2 text-sm placeholder-gray-500'
          />

          <Button size='icon' onClick={handleSend} className='rounded-full bg-blue-500 hover:bg-blue-600 transition'>
            <Send className='h-5 w-5 text-white' />
          </Button>
        </div>
      </div>
    </div>
  )
}
