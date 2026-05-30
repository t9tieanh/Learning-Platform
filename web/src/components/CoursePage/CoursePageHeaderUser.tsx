import { useRef, useState } from 'react'
import { Crown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import Menu from '@/components/Header/menu'
import { useAuthStore } from '@/stores/useAuth.stores'
import { useVipUpgrade } from '@/contexts/VipUpgradeContext'
import { cn } from '@/lib/utils'

const HOVER_CLOSE_DELAY_MS = 120

const CoursePageHeaderUser = () => {
  const { data } = useAuthStore()
  const { openVipDialog } = useVipUpgrade()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const scheduleClose = () => {
    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => setMenuOpen(false), HOVER_CLOSE_DELAY_MS)
  }

  const handlePointerEnter = () => {
    clearCloseTimer()
    setMenuOpen(true)
  }

  if (!data) {
    return (
      <div className='flex h-8 shrink-0 items-center rounded-full bg-white px-3 md:h-9'>
        <button
          type='button'
          onClick={() => navigate('/auth')}
          className='text-[11px] font-semibold leading-none text-blue-600 hover:text-blue-700 md:text-xs'
        >
          Đăng nhập
        </button>
      </div>
    )
  }

  return (
    <div
      className='flex h-8 max-w-[min(100%,18rem)] shrink-0 items-center gap-1 md:h-9 md:max-w-none md:gap-1.5'
      onMouseEnter={handlePointerEnter}
      onMouseLeave={scheduleClose}
    >
      {!data.isVip && (
        <button
          type='button'
          onClick={openVipDialog}
          className='flex h-6 shrink-0 items-center gap-0.5 rounded-full border border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 px-1.5 text-[10px] font-semibold leading-none text-yellow-800 transition-colors hover:from-yellow-100 hover:to-amber-100 md:h-[22px] md:px-2 md:text-[11px]'
        >
          <Crown className='h-3 w-3 shrink-0' aria-hidden />
          <span className='hidden sm:inline'>Khám phá VIP</span>
          <span className='sm:hidden'>VIP</span>
        </button>
      )}

      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger asChild>
          <button
            type='button'
            className='flex h-8 min-w-0 cursor-pointer items-center border-0 bg-transparent p-0 outline-none md:h-9'
            aria-label='Menu tài khoản'
          >
            <div className='relative z-10 h-8 w-8 shrink-0 md:h-9 md:w-9'>
              <Avatar
                className={cn(
                  'h-full w-full transition-transform hover:scale-[1.02]',
                  data.isVip && 'ring-2 ring-yellow-400 ring-offset-0'
                )}
              >
                <AvatarImage src={data.avatarUrl} alt={data.name ?? 'User'} className='object-cover' />
                <AvatarFallback className='bg-gradient-to-br from-[#17EAD9] to-[#1FA2FF] text-[10px] font-semibold text-white'>
                  {data.name?.charAt(0) ?? 'U'}
                </AvatarFallback>
              </Avatar>
              {data.isVip && (
                <div className='absolute -bottom-px -right-px z-10 rounded-full border border-[#1e3a5f] bg-gradient-to-r from-yellow-400 to-amber-500 p-px'>
                  <Crown className='h-2 w-2 text-white' strokeWidth={3} aria-hidden />
                </div>
              )}
            </div>

            <div
              className={cn(
                'relative z-0 -ml-3.5 flex h-8 min-w-0 items-center rounded-r-full bg-white pr-2.5 pl-5 transition-colors hover:bg-gray-50',
                'md:-ml-4 md:h-9 md:pl-6 md:pr-3'
              )}
            >
              <div className='hidden min-w-0 items-center gap-1 sm:flex'>
                <span className='truncate text-xs font-semibold leading-none text-gray-900 md:max-w-[120px]'>
                  {data.name}
                </span>
                {data.isVip && (
                  <span className='inline-flex shrink-0 items-center gap-0.5 text-[10px] font-semibold leading-none text-amber-600'>
                    <Crown className='h-2.5 w-2.5' aria-hidden />
                    VIP
                  </span>
                )}
              </div>
            </div>
          </button>
        </PopoverTrigger>

        <PopoverContent
          align='end'
          side='bottom'
          sideOffset={8}
          className='w-56 p-2.5 sm:w-60'
          onMouseEnter={handlePointerEnter}
          onMouseLeave={scheduleClose}
        >
          <Menu
            compact
            confirmLeaveStudy
            username={data.username ?? ''}
            name={data.name ?? ''}
            avatarUrl={data.avatarUrl ?? ''}
            closeMenu={() => setMenuOpen(false)}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default CoursePageHeaderUser
