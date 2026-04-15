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
          <DropdownMenuContent align='end' className='w-64 p-2 rounded-2xl border-slate-100 shadow-2xl'>
            <div className='px-3 py-4 mb-1'>
              <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Tài khoản hiện tại</p>
              <div className='mt-2 flex items-center gap-3'>
                <Avatar className='w-9 h-9 border border-slate-100'>
                  <AvatarImage src={data?.avatarUrl} alt='Avatar' />
                  <AvatarFallback className='text-slate-400 font-bold bg-slate-50 text-[11px]'>{initials}</AvatarFallback>
                </Avatar>
                <div className='flex flex-col min-w-0'>
                  <p className='text-sm font-bold text-slate-800 truncate'>{displayName}</p>
                  <p className='text-[11px] text-slate-400 font-medium truncate'>Giảng viên hệ thống</p>
                </div>
              </div>
            </div>

            <div className='h-[1px] bg-slate-50 mx-1 mb-1' />

            <DropdownMenuItem
              onClick={() => navigate('/')}
              className='flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 transition-all cursor-pointer group'
            >
              <div className='w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors'>
                <User className='h-4 w-4' />
              </div>
              <span className='text-[13px] font-semibold'>Tài khoản học viên</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleLogout}
              className='flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50/50 transition-all cursor-pointer group'
            >
              <div className='w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-red-100 transition-colors'>
                <LogOut className='h-4 w-4' />
              </div>
              <span className='text-[13px] font-semibold'>Đăng xuất khỏi hệ thống</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default DashboardHeader
