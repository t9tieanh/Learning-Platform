import { FC } from 'react'
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from '@/components/ui/navigation-menu'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import CustomButton from '../common/Button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import './style.scss'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuth.stores'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { LogIn, UserPlus, House, BookOpen, Building2, StickyNote, ShoppingCart } from 'lucide-react'
import Menu from './menu'
import logo from '../../assets/images/logo1.png'

const Header: FC = () => {
  const navigate = useNavigate()
  const { data, setData } = useAuthStore()

  const handleMyCartClick = () => {
    navigate('/my-cart')
  }

  return (
    <div className=' p-3 w-full bg-white'>
      <NavigationMenu className='min-w-full mx-0'>
        <div className='flex items-center justify-between w-full p-1'>
          <NavigationMenuList className='text-left ml-2'>
            <button onClick={() => navigate('/')} className='p-0 border-none bg-transparent cursor-pointer'>
              <img src={logo} alt='LEARNOVA logo' className='h-10 md:h-6 w-auto select-none object-contain' />
            </button>
          </NavigationMenuList>
          <NavigationMenuList className='mx-auto bg-transparent'>
            <NavigationMenuItem>
              <Tabs defaultValue='home' className='w-full'>
                <TabsList className='flex gap-6 bg-transparent px-4 py-2'>
                  <TabsTrigger
                    value='home'
                    onClick={() => navigate('/')}
                    className='tab-page font-semibold px-4 py-4 rounded-lg transition-colors duration-200 hover:bg-blue-100 hover:text-blue-700 data-[state=active]:bg-blue-500 data-[state=active]:text-white'
                  >
                    <House className='w-5 h-5' />
                    Trang chủ
                  </TabsTrigger>
                  <TabsTrigger
                    value='course'
                    onClick={() => navigate('/courses')}
                    className='tab-page font-semibold px-4 py-4 rounded-lg transition-colors duration-200 hover:bg-blue-100 hover:text-blue-700 data-[state=active]:bg-blue-500 data-[state=active]:text-white'
                  >
                    <BookOpen className='w-5 h-5' />
                    Khóa học
                  </TabsTrigger>
                  <TabsTrigger
                    value='about'
                    className='tab-page font-semibold px-4 py-4 rounded-lg transition-colors duration-200 hover:bg-blue-100 hover:text-blue-700 data-[state=active]:bg-blue-500 data-[state=active]:text-white'
                  >
                    <Building2 className='w-5 h-5' />
                    Về chúng tôi
                  </TabsTrigger>
                  <TabsTrigger
                    value='blog'
                    className='tab-page font-semibold px-4 py-4 rounded-lg transition-colors duration-200 hover:bg-blue-100 hover:text-blue-700 data-[state=active]:bg-blue-500 data-[state=active]:text-white'
                  >
                    <StickyNote className='w-5 h-5' />
                    Blog
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </NavigationMenuItem>
          </NavigationMenuList>
          <NavigationMenuList className='text-right'>
            {data ? (
              <>
                <CustomButton
                  label='Khóa học của tôi'
                  icon={<BookOpen className='w-4 h-4 mr-2' />}
                  className='border border-black-600 bg-white hover:bg-blue-500 hover:text-white text-gray-800 rounded-lg px-3'
                />
                <CustomButton
                  icon={<ShoppingCart className='w-4 h-4' />}
                  className='border border-black-600 bg-white hover:bg-gray-100 text-gray-800 rounded-lg px-3'
                  onClick={handleMyCartClick}
                  label='Giỏ hàng'
                />
                <div className='profile flex gap-2 text-sm font-bold items-center'>
                  <Popover>
                    <PopoverTrigger className='flex gap-2 items-center'>
                      <p className='ml-2'>
                        <span className='text-red-500 italic font-base'>Xin chào</span> {data.name}
                      </p>
                      <Avatar className='rounded-lg'>
                        <AvatarImage src={data.avatarUrl} alt='avatar' />
                        <AvatarFallback>{data.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </PopoverTrigger>
                    <PopoverContent className='w-80'>
                      <Menu
                        username={data.username as string}
                        name={data.name as string}
                        avatarUrl={data.avatarUrl as string}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            ) : (
              <>
                <NavigationMenuItem className='flex gap-2'>
                  <CustomButton
                    label='Đăng ký'
                    icon={<UserPlus className='w-4 h-4 mr-2' />}
                    className='signup-btn shadow-lg bg-white-100 text-blue-700 hover:text-white hover:bg-blue-800 rounded-xl font-base hover:scale-105 transition-transform duration-300 ease-in-out'
                    onClick={() => navigate('/auth?mode=signup')}
                  />
                  <CustomButton
                    label='Đăng nhập'
                    className='btn-primary shadow-lg login-btn bg-blue-600 hover:bg-blue-800 font-base rounded-xl hover:scale-105 transition-transform duration-300 ease-in-out'
                    onClick={() => navigate('/auth')}
                    icon={<LogIn className='w-4 h-4 mr-2' />}
                  />
                </NavigationMenuItem>
              </>
            )}
          </NavigationMenuList>
        </div>
      </NavigationMenu>
    </div>
  )
}

export default Header
