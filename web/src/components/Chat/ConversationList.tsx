import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Conversation {
  id: string
  name: string
  avatar: string
  lastMessage: string
  time: string
  unread?: number
  online?: boolean
}

interface ConversationListProps {
  selectedId?: string
  onSelect: (id: string) => void
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    lastMessage: 'Chào bạn, hẹn gặp lại nhé!',
    time: '2 phút',
    unread: 2,
    online: true
  },
  {
    id: '2',
    name: 'Trần Thị B',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    lastMessage: 'Cảm ơn bạn nhiều nha',
    time: '1 giờ',
    online: true
  },
  {
    id: '3',
    name: 'Lê Minh C',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    lastMessage: 'Ok, tôi sẽ xem lại',
    time: '3 giờ'
  },
  {
    id: '4',
    name: 'Phạm Thu D',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
    lastMessage: 'Bạn có rảnh không?',
    time: 'Hôm qua'
  },
  {
    id: '5',
    name: 'Hoàng Anh E',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5',
    lastMessage: 'Đã nhận được file rồi',
    time: 'Thứ 2'
  }
]

export const ConversationList = ({ selectedId, onSelect }: ConversationListProps) => {
  return (
    <div className='flex h-full min-h-0 flex-col bg-white border-r border-slate-200'>
      {/* Header */}
      <div className='p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-blue-100 shadow-sm'>
        <h2 className='text-2xl font-bold mb-3 text-blue-600 tracking-wide pl-1'>Đoạn chat</h2>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400' />
          <Input
            placeholder='Tìm kiếm...'
            className='pl-9 !rounded-lg !border !border-slate-300 focus:!border-blue-500 focus:!ring-1 focus:!ring-blue-200 bg-white shadow-sm'
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className='flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent'>
        {mockConversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation.id)}
            className={cn(
              'group w-full flex items-center gap-3 p-4 text-left transition-all duration-150 border-b border-slate-100',
              'hover:bg-blue-50/60',
              selectedId === conversation.id && 'bg-blue-100/60'
            )}
          >
            {/* Avatar */}
            <div className='relative flex-shrink-0'>
              <Avatar className='h-12 w-12 ring-1 ring-slate-200'>
                <AvatarImage src={conversation.avatar} />
                <AvatarFallback>{conversation.name[0]}</AvatarFallback>
              </Avatar>
              {conversation.online && (
                <div className='absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-white shadow-[0_0_4px_#22c55e]' />
              )}
            </div>

            {/* Info */}
            <div className='flex-1 min-w-0'>
              <div className='flex items-center justify-between mb-0.5'>
                <h3 className='font-semibold text-slate-800 truncate'>{conversation.name}</h3>
                <span className='text-xs text-slate-400 shrink-0 ml-2'>{conversation.time}</span>
              </div>
              <p className='text-sm text-slate-500 truncate'>{conversation.lastMessage}</p>
            </div>

            {/* Unread badge */}
            {conversation.unread && (
              <div className='flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-blue-500 text-white text-xs font-semibold'>
                {conversation.unread}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
