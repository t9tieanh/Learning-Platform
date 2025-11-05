import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import CustomButton from '../common/Button'
import { LogOut, GraduationCap, BookOpen } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuth.stores'
import { useNavigate } from 'react-router-dom'

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

  const handleLogout = () => {
    setData(null)
    navigate('/')
  }

  const handleChat = () => {
    navigate(`/chat/:id`, { state: { user: data } })
    closeMenu()
  }

  const handleMyCoursesClick = () => {
    navigate('/me?mode=courses')
  }

  const handleProfileClick = () => {
    navigate(`/me?mode=info`)
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
            label='Khóa học của tôi'
            icon={<BookOpen className='w-4 h-4 mr-2' />}
            className='border border-black-600 bg-white hover:bg-blue-500 hover:text-white text-gray-800 rounded-lg px-3'
            onClick={handleMyCoursesClick}
          />
          <CustomButton
            className='w-full bg-blue-600 hover:bg-blue-700'
            label='Trang giảng viên'
            icon={<GraduationCap className='w-4 h-4 mr-2' />}
            onClick={() => navigate('/teacher', { state: { user: data } })}
          />
          <CustomButton
            className='w-full bg-blue-600 hover:bg-blue-700'
            label='Tin nhắn'
            icon={<GraduationCap className='w-4 h-4 mr-2' />}
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
