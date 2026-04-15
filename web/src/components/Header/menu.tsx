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

const Menu = ({
  username,
  name,
  avatarUrl,
  closeMenu
}: {
  username: string
  name: string
  avatarUrl: string
  closeMenu: () => void
}) => {
  const { data, setData } = useAuthStore()
  const navigate = useNavigate()
  const { loading: loggingOut, startLoading, stopLoading } = useLoading()
  const { openVipDialog } = useVipUpgrade()

  const handleLogout = async () => {
    const confirmed = await showConfirmToast({
      title: 'Đăng xuất',
      description: 'Bạn có chắc chắn muốn đăng xuất?',
      confirmLabel: 'Đăng xuất'
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
    navigate(`/chat/:id`, { state: { user: data } })
    closeMenu()
  }

  const handleMyCoursesClick = () => {
    navigate('/me?mode=courses')
    closeMenu()
  }

  const handleProfileClick = () => {
    navigate(`/me?mode=info`)
    closeMenu()
  }

  const handleTeacherClick = () => {
    navigate('/teacher', { state: { user: data } })
    closeMenu()
  }

  return (
    <>
      <div className='grid gap-4 text-sm'>
        <button
          className='space-y-2 flex items-center gap-3 text-start w-full hover:bg-gray-100 p-2 rounded-lg relative'
          onClick={handleProfileClick}
        >
          <div className='relative'>
            <Avatar className={`rounded-2xl w-12 h-12 ${data?.isVip ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}`}>
              <AvatarImage src={avatarUrl} alt={`@${username}`} />
              <AvatarFallback>{name}</AvatarFallback>
            </Avatar>
            {data?.isVip && (
              <div className='absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full p-0.5 shadow-sm border-2 border-white z-10'>
                <Crown className='w-3 h-3 text-white' strokeWidth={3} />
              </div>
            )}
          </div>
          <div>
            <p className='text-gray-900 text-sm font-bold flex items-center gap-1.5'>
              {name}
              {data?.isVip && (
                <span className='bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded shadow-sm leading-none'>
                  VIP
                </span>
              )}
            </p>
            <p className='text-muted-foreground text-xs'>@{username}</p>
          </div>
        </button>
        <hr />
        <div className='flex flex-col gap-2'>
          {!data?.isVip && (
            <CustomButton
              label='Tìm hiểu Learnova VIP'
              icon={<Crown className='w-4 h-4 mr-2 text-yellow-600' />}
              className='border border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 text-yellow-800 font-semibold rounded-lg px-3 shadow-sm'
              onClick={() => {
                openVipDialog()
                closeMenu()
              }}
            />
          )}
          <CustomButton
            label='Thông tin của tôi'
            icon={<User className='w-4 h-4 mr-2' />}
            className='border-2 border-slate-300 bg-white hover:bg-blue-500 hover:text-white text-gray-800 rounded-lg px-3'
            onClick={handleMyCoursesClick}
          />
          <CustomButton
            className='border-2 border-slate-300 bg-white hover:bg-blue-500 hover:text-white text-gray-800 rounded-lg px-3'
            label='Trang giảng viên'
            icon={<GraduationCap className='w-4 h-4 mr-2' />}
            onClick={handleTeacherClick}
          />
          <CustomButton
            className='border-2 border-slate-300 bg-white hover:bg-blue-500 hover:text-white text-gray-800 rounded-lg px-3'
            label='Tin nhắn'
            icon={<MessageCircle className='w-4 h-4 mr-2' />}
            onClick={handleChat}
          />
          <CustomButton
            className='w-full bg-red-700 hover:bg-red-800'
            label='Đăng xuất'
            icon={<LogOut className='w-4 h-4 mr-2' />}
            onClick={handleLogout}
            isLoader={loggingOut}
          />
        </div>
      </div>
    </>
  )
}

export default Menu
