'use client'

import { motion } from 'framer-motion'
import { Bell, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthStore } from '@/stores/useAuth.stores'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import CustomButton from '@/components/common/Button'

const DashboardHeader = () => {
  const { data, setData } = useAuthStore()
  const navigate = useNavigate()
  const displayName = data?.name || 'Giảng viên'
  const initials = (data?.name || 'GV')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const handleLogout = () => {
    setData(null)
    toast.success('Đăng xuất thành công!')
    navigate('/auth')
  }

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='rounded-full p-0 border-2 border-primary/40 shadow-md hover:shadow-lg transition-all duration-200'
            >
              <Avatar className='w-8 h-8 md:w-10 md:h-10 ring-2 ring-primary/50'>
                <AvatarImage src={data?.avatarUrl} alt='Avatar' />
                <AvatarFallback className='text-white font-bold'>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem className='!bg-transparent hover:!bg-white hover:!text-primary transition-colors'>
              <CustomButton
                label='Tài khoản học viên'
                className='w-full text-white rounded-md hover:bg-blue-700'
                type='button'
                onClick={() => navigate('/')}
                icon={<User className='h-4 w-4 ml-1 text-white' />}
              />
            </DropdownMenuItem>
            <DropdownMenuItem className='!bg-transparent hover:!bg-white hover:!text-primary transition-colors'>
              <CustomButton
                label='Đăng xuất'
                className='w-full bg-red-600 text-white hover:bg-red-700 rounded-md'
                type='button'
                onClick={handleLogout}
                icon={<LogOut className='h-4 w-4 ml-1 text-white' />}
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default DashboardHeader
