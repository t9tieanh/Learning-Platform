'use client'

import { motion } from 'framer-motion'
import { Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthStore } from '@/stores/useAuth.stores'
import { useNavigate } from 'react-router-dom'

const DashboardHeader = () => {
  const { data } = useAuthStore()
  const navigate = useNavigate()
  const displayName = data?.name || 'Giảng viên'
  const initials = (data?.name || 'GV')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
  return (
    <div className='flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 md:gap-0'>
      <div>
        <motion.h1
          className='text-lg md:text-2xl font-bold flex items-center gap-2'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.span
            animate={{ rotate: [0, 20, -10, 20, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            👋
          </motion.span>
          <span className='truncate max-w-[160px] md:max-w-[220px] lg:max-w-none bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 bg-clip-text text-transparent'>
            Xin chào, {displayName}
          </span>
        </motion.h1>

        <motion.h3
          className='text-xs md:text-sm lg:text-base mt-2 text-muted-foreground'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          Chào mừng đến với hệ thống khoá học 🎓
        </motion.h3>
      </div>

      <div className='flex items-center gap-2 md:gap-4 self-end md:self-auto'>
        {/* Nút thông báo nổi bật */}
        <Button
          variant='ghost'
          size='icon'
          className='relative transition-all duration-200 hover:bg-primary/10 hover:shadow-lg border border-primary/30'
        >
          <Bell className='w-5 h-5 text-primary' />
          <span className='absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse'></span>
        </Button>

        {/* Avatar dropdown nổi bật */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='rounded-full p-0 border-2 border-primary/40 shadow-md hover:shadow-lg transition-all duration-200'
            >
              <Avatar className='w-8 h-8 md:w-10 md:h-10 ring-2 ring-primary/50'>
                <AvatarImage src={data?.avatarUrl} alt='Avatar' />
                <AvatarFallback className='bg-primary text-white font-bold'>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem className='flex items-center gap-2' onClick={() => navigate('/teacher/profile')}>
              <User size={16} /> Tài khoản
            </DropdownMenuItem>
            <DropdownMenuItem>Đăng xuất</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default DashboardHeader
