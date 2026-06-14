import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import CustomButton from '../common/Button'
import { LogOut, GraduationCap, MessageCircle, User, Crown } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuth.stores'
import { useNavigate } from 'react-router-dom'
import { showConfirmToast } from '../common/ShowConfirmToast'
import userService from '@/services/user/user.service'
import { toast } from 'sonner'
import useLoading from '@/hooks/useLoading.hook'
import { useVipUpgrade } from '@/contexts/VipUpgradeContext'
import { cn } from '@/lib/utils'

const STUDY_LEAVE_CONFIRM = {
  title: 'Bạn đang trong buổi học',
  description: 'Bạn có chắc chắn muốn chuyển sang trang khác?',
  confirmLabel: 'Có, chuyển trang',
  cancelLabel: 'Ở lại học'
} as const

const Menu = ({
  username,
  name,
  avatarUrl,
  closeMenu,
  compact = false,
  confirmLeaveStudy = false
}: {
  username: string
  name: string
  avatarUrl: string
  closeMenu: () => void
  compact?: boolean
  confirmLeaveStudy?: boolean
}) => {
  const { data, setData } = useAuthStore()
  const navigate = useNavigate()
  const { loading: loggingOut, startLoading, stopLoading } = useLoading()
  const { openVipDialog } = useVipUpgrade()

  const confirmLeaveIfStudying = async () => {
    if (!confirmLeaveStudy) return true
    return showConfirmToast(STUDY_LEAVE_CONFIRM)
  }

  const runAfterLeaveConfirm = async (action: () => void) => {
    const allowed = await confirmLeaveIfStudying()
    if (!allowed) return
    action()
    closeMenu()
  }

  const handleLogout = async () => {
    const confirmed = await showConfirmToast({
      title: confirmLeaveStudy ? STUDY_LEAVE_CONFIRM.title : 'Đăng xuất',
      description: confirmLeaveStudy
        ? 'Bạn có chắc muốn đăng xuất và rời khỏi trang học?'
        : 'Bạn có chắc chắn muốn đăng xuất?',
      confirmLabel: 'Đăng xuất',
      cancelLabel: confirmLeaveStudy ? STUDY_LEAVE_CONFIRM.cancelLabel : 'Hủy'
    })
    if (confirmed) {
      // Call logout API
      try {
        startLoading()
        await userService.logout()
      } catch (error) {
        console.error('Error during logout:', error)
      } finally {
        stopLoading()
      }
      // Clear user data from store
      setData(null)
      toast.success('Đăng xuất thành công!')
      navigate('/auth')
    }
  }

  const handleChat = () => {
    void runAfterLeaveConfirm(() => navigate(`/chat/:id`, { state: { user: data } }))
  }

  const handleMyCoursesClick = () => {
    void runAfterLeaveConfirm(() => navigate('/me?mode=courses'))
  }

  const handleProfileClick = () => {
    void runAfterLeaveConfirm(() => navigate('/me?mode=info'))
  }

  const handleTeacherClick = () => {
    void runAfterLeaveConfirm(() => navigate('/teacher', { state: { user: data } }))
  }

  const iconClass = compact ? 'w-3.5 h-3.5 mr-1.5' : 'w-4 h-4 mr-2'
  const btnClass = cn(
    'rounded-md font-medium',
    compact ? 'h-8 min-h-8 text-xs px-2.5' : 'rounded-lg px-3'
  )

  return (
    <>
      <div className={cn('grid text-sm', compact ? 'gap-2' : 'gap-4')}>
        <button
          type='button'
          className={cn(
            'relative flex w-full items-center text-start hover:bg-gray-100 rounded-lg',
            compact ? 'gap-2 p-1.5' : 'gap-3 p-2'
          )}
          onClick={handleProfileClick}
        >
          <div className='relative shrink-0'>
            <Avatar
              className={cn(
                data?.isVip ? 'ring-2 ring-yellow-400 ring-offset-1' : '',
                compact ? 'h-9 w-9 rounded-xl' : 'h-12 w-12 rounded-2xl'
              )}
            >
              <AvatarImage src={avatarUrl} alt={`@${username}`} />
              <AvatarFallback className={compact ? 'text-xs' : undefined}>{name?.charAt(0)}</AvatarFallback>
            </Avatar>
            {data?.isVip && (
              <div className='absolute -bottom-0.5 -right-0.5 z-10 rounded-full border border-white bg-gradient-to-r from-yellow-400 to-yellow-600 p-px'>
                <Crown className={cn('text-white', compact ? 'h-2 w-2' : 'h-3 w-3')} strokeWidth={3} />
              </div>
            )}
          </div>
          <div className='min-w-0'>
            <p
              className={cn(
                'flex items-center gap-1 font-bold text-gray-900',
                compact ? 'text-xs' : 'text-sm gap-1.5'
              )}
            >
              <span className='truncate'>{name}</span>
              {data?.isVip && (
                <span className='shrink-0 rounded bg-gradient-to-r from-yellow-500 to-yellow-600 px-1 py-px text-[9px] font-bold uppercase leading-none text-white'>
                  VIP
                </span>
              )}
            </p>
            <p className={cn('truncate text-muted-foreground', compact ? 'text-[10px]' : 'text-xs')}>
              @{username}
            </p>
          </div>
        </button>
        <hr className={compact ? 'my-0' : undefined} />
        <div className={cn('flex flex-col', compact ? 'gap-1' : 'gap-2')}>
          {!data?.isVip && (
            <CustomButton
              label={compact ? 'Learnova VIP' : 'Tìm hiểu Learnova VIP'}
              icon={<Crown className={cn(iconClass, 'text-yellow-600')} />}
              className={cn(
                btnClass,
                'border border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 text-yellow-800 shadow-none'
              )}
              onClick={() => {
                openVipDialog()
                closeMenu()
              }}
            />
          )}
          <CustomButton
            label='Thông tin của tôi'
            icon={<User className={cn(iconClass, 'text-white')} />}
            className={cn(
              btnClass,
              'border-0 bg-gradient-to-r from-blue-500 via-blue-600 to-[#0C356A] text-white font-semibold shadow-md shadow-blue-500/30 hover:from-blue-600 hover:via-blue-700 hover:to-[#0a2d58] hover:text-white'
            )}
            onClick={handleMyCoursesClick}
          />
          <CustomButton
            label='Trang giảng viên'
            icon={<GraduationCap className={cn(iconClass, 'text-yellow-950')} />}
            className={cn(
              btnClass,
              'border-0 bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-400 text-yellow-950 font-semibold shadow-md shadow-yellow-400/40 hover:from-yellow-400 hover:via-yellow-500 hover:to-amber-500 hover:text-yellow-950'
            )}
            onClick={handleTeacherClick}
          />
          <CustomButton
            className={cn(btnClass, 'border border-slate-200 bg-white text-gray-800 hover:bg-blue-500 hover:text-white')}
            label='Tin nhắn'
            icon={<MessageCircle className={iconClass} />}
            onClick={handleChat}
          />
          <CustomButton
            className={cn(btnClass, 'w-full bg-red-600 hover:bg-red-700 text-white border-0')}
            label='Đăng xuất'
            icon={<LogOut className={iconClass} />}
            onClick={handleLogout}
            isLoader={loggingOut}
          />
        </div>
      </div>
    </>
  )
}

export default Menu
