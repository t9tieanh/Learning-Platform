
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import CustomButton from '../common/Button'
import { LogOut, GraduationCap } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuth.stores'
import { useNavigate } from 'react-router-dom'

const Menu = ({ username, name, avatarUrl, closeMenu }: { username: string; name: string; avatarUrl: string; closeMenu: () => void }) => {
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

  return (
    <>
      <div className='grid gap-4 text-sm'>
        <div className='space-y-2 flex items-center gap-2'>
          <Avatar className='rounded-lg'>
            <AvatarImage src={avatarUrl} alt={`@${username}`} />
            <AvatarFallback>{name}</AvatarFallback>
          </Avatar>
          <div>
            <p className='text-muted-foreground text-sm font-bold'>{name}</p>
            <p className='text-muted-foreground text-sm'>@{username}</p>
          </div>
        </div>
        <hr />
        {/* Trang giảng viên */}
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
        {/* Đăng xuất */}
        <CustomButton
          className='w-full bg-red-700 hover:bg-red-800'
          label='Đăng xuất'
          icon={<LogOut className='w-4 h-4 mr-2' />}
          onClick={handleLogout}
        />
      </div>
    </>
  )
}

export default Menu
