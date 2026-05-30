'use client'

import { motion } from 'framer-motion'
import { User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthStore } from '@/stores/useAuth.stores'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

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
    <div className='relative mb-8'>
      <div className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-20 bg-gradient-to-r from-cyan-50/70 via-blue-50/50 to-indigo-50/70 blur-2xl' />

      <div className='flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-6'>
        <div className='min-w-0 space-y-2'>
          <motion.h1
            className='truncate text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl md:text-[1.65rem]'
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            Xin chào, <span className='bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent'>{displayName}</span>
          </motion.h1>

          <motion.h3
            className='text-sm font-medium text-slate-500 md:text-[15px]'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            Chào mừng đến với hệ thống khoá học
          </motion.h3>
        </div>

        <div className='flex items-center justify-end gap-3'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='group h-11 w-11 rounded-2xl border border-slate-200/80 bg-white/80 p-0 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/70 hover:shadow-[0_12px_28px_rgba(37,99,235,0.15)] focus-visible:ring-2 focus-visible:ring-blue-400/60 focus-visible:ring-offset-2'
              >
                <Avatar className='h-9 w-9 ring-1 ring-slate-200 transition-all duration-300 group-hover:ring-blue-300'>
                  <AvatarImage src={data?.avatarUrl} alt='Avatar' />
                  <AvatarFallback className='bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-bold text-white'>
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align='end'
              className='w-72 rounded-2xl border border-slate-200/90 bg-white/95 p-2 shadow-[0_18px_45px_rgba(15,23,42,0.12)] backdrop-blur-xl'
            >
              <div className='rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-3'>
                <p className='text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400'>Tài khoản hiện tại</p>
                <div className='mt-2.5 flex items-center gap-3'>
                  <Avatar className='h-10 w-10 border border-slate-200'>
                    <AvatarImage src={data?.avatarUrl} alt='Avatar' />
                    <AvatarFallback className='bg-slate-100 text-xs font-bold text-slate-700'>{initials}</AvatarFallback>
                  </Avatar>

                  <div className='min-w-0'>
                    <p className='truncate text-sm font-semibold text-slate-900'>{displayName}</p>
                    <p className='truncate text-xs text-slate-500'>Giảng viên hệ thống</p>
                  </div>
                </div>
              </div>

              <div className='my-2 h-px bg-slate-100' />

              <DropdownMenuItem
                onClick={() => navigate('/')}
                className='group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-slate-700 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700'
              >
                <div className='flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white transition-colors group-hover:border-blue-200 group-hover:bg-blue-100/70'>
                  <User className='h-4 w-4' />
                </div>
                <span className='text-[13px] font-semibold'>Tài khoản học viên</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleLogout}
                className='group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-slate-700 transition-all duration-200 hover:bg-rose-50 hover:text-rose-700 focus:bg-rose-50 focus:text-rose-700'
              >
                <div className='flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white transition-colors group-hover:border-rose-200 group-hover:bg-rose-100/70'>
                  <LogOut className='h-4 w-4' />
                </div>
                <span className='text-[13px] font-semibold'>Đăng xuất khỏi hệ thống</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

export default DashboardHeader
