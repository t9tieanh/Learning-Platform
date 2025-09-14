'use client'

import { motion } from 'framer-motion'
import { Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const DashboardHeader = () => {
  return (
    <div className='flex items-center justify-between mb-6'>
      <div>
        <motion.h1
          className='text-2xl font-bold flex items-center gap-2'
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
          Xin chào, Anh Sang
        </motion.h1>

        <motion.h3
          className='text-base mt-2 text-muted-foreground'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          Chào mừng đến với hệ thống khoá học 🎓
        </motion.h3>
      </div>

      <div className='flex items-center gap-4'>
        {/* Nút thông báo nổi bật */}
        <Button
          variant='ghost'
          size='icon'
          className='relative transition-all duration-200 hover:bg-dashboard-primary/10 hover:shadow-lg border border-dashboard-primary/30'
        >
          <Bell className='w-5 h-5 text-dashboard-primary' />
          <span className='absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse'></span>
        </Button>

        {/* Avatar dropdown nổi bật */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='rounded-full p-0 border-2 border-dashboard-primary/40 shadow-md hover:shadow-lg transition-all duration-200'
            >
              <Avatar className='w-10 h-10 ring-2 ring-dashboard-primary/50'>
                <AvatarImage src='/avatar.jpg' alt='Avatar' />
                <AvatarFallback className='bg-dashboard-primary text-white font-bold'>AS</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem className='flex items-center gap-2'>
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
