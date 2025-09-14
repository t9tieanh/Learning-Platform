import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import CustomButton from '../common/Button'
import { LogOut } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuth.stores'

const Menu = ({ username, name, avatarUrl }: { username: string; name: string; avatarUrl: string }) => {
  const { setData } = useAuthStore()

  const handleLogout = () => {
    setData(null)
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
