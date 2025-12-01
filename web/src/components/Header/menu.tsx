import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import CustomButton from '../common/Button'
import { LogOut, GraduationCap, MessageCircle, User } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuth.stores'
import { useNavigate } from 'react-router-dom'
import { showConfirmToast } from '../common/ShowConfirmToast'
import userService from '@/services/user/user.service'
import { toast } from 'sonner'

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

  const handleLogout = async () => {
    const confirmed = await showConfirmToast({
      title: 'Đăng xuất',
      description: 'Bạn có chắc chắn muốn đăng xuất?',
      confirmLabel: 'Đăng xuất'
    })
    if (confirmed) {
      // Call logout API
      try {
        await userService.logout()
      } catch (error) {
        console.error('Error during logout:', error)
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
          className='space-y-2 flex items-center gap-2 text-start w-full hover:bg-gray-100 p-2 rounded-lg'
          onClick={handleProfileClick}
        >
          <Avatar className='rounded-2xl'>
            <AvatarImage src={avatarUrl} alt={`@${username}`} />
            <AvatarFallback>{name}</AvatarFallback>
          </Avatar>
          <div>
            <p className='text-muted-foreground text-sm font-bold'>{name}</p>
            <p className='text-muted-foreground text-sm'>@{username}</p>
          </div>
        </button>
        <hr />
        <div className='flex flex-col gap-2'>
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
          />
        </div>
      </div>
    </>
  )
}

export default Menu
