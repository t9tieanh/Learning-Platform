import { FC, useState, useEffect, useRef } from 'react'
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from '@/components/ui/navigation-menu'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import CustomButton from '../common/Button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import './style.scss'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuth.stores'
import { useCartStore } from '@/stores/useCart.stores'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { LogIn, UserPlus, House, BookOpen, Building2, StickyNote, ShoppingCart, Menu as MenuIcon } from 'lucide-react'
import Menu from './menu'
import logo from '../../assets/images/logo1.png'

const Header: FC = () => {
  const navigate = useNavigate()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const { data } = useAuthStore()
  const count = useCartStore((s) => s.count)
  const refresh = useCartStore((s) => s.refresh)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // refresh cart count on header mount
    refresh().catch(() => {})
  }, [refresh])

  // publish header height as a CSS variable so pages can position elements under it
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const setVar = () => {
      const h = el.getBoundingClientRect().height || 0
      try {
        document.documentElement.style.setProperty('--main-header-height', `${Math.ceil(h)}px`)
      } catch (e) {
        // ignore
      }
    }
    setVar()
    window.addEventListener('resize', setVar)
    return () => window.removeEventListener('resize', setVar)
  }, [])

  const menuItems = [
    { icon: <House className='w-5 h-5' />, label: 'Trang chủ', value: 'home', path: '/' },
    { icon: <BookOpen className='w-5 h-5' />, label: 'Khóa học', value: 'course', path: '/courses' },
    { icon: <Building2 className='w-5 h-5' />, label: 'Về chúng tôi', value: 'about', path: '/about' },
    { icon: <StickyNote className='w-5 h-5' />, label: 'Blog', value: 'blog', path: '/blog' }
  ]

  return (
    <div ref={rootRef} className='p-3 w-full bg-white sticky top-0 z-50 shadow-sm'>
      <NavigationMenu className='min-w-full mx-0'>
        <div className='max-w-7xl mx-auto flex items-center justify-between w-full p-1'>
          <NavigationMenuList className='text-left'>
            <button onClick={() => navigate('/')} className='p-0 border-none bg-transparent cursor-pointer'>
              <img src={logo} alt='LEARNOVA logo' className='h-8 md:h-10 w-auto select-none object-contain' />
            </button>
          </NavigationMenuList>

          {/* Desktop Navigation */}
          <NavigationMenuList className='hidden md:block mx-auto bg-transparent'>
            <NavigationMenuItem>
              <Tabs defaultValue='home' className='w-full'>
                <TabsList className='flex gap-4 md:gap-6 bg-transparent px-4 py-2'>
                  {menuItems.map((item) => (
                    <TabsTrigger
                      key={item.value}
                      value={item.value}
                      onClick={() => navigate(item.path)}
                      className='tab-page font-semibold px-3 md:px-4 py-2 md:py-4 rounded-lg transition-colors duration-200 hover:bg-blue-100 hover:text-blue-700 data-[state=active]:bg-blue-500 data-[state=active]:text-white flex items-center gap-2'
                    >
                      {item.icon}
                      {item.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </NavigationMenuItem>
          </NavigationMenuList>

          {/* Right Section */}
          <NavigationMenuList className='flex items-center gap-2 md:gap-4'>
            {/* Cart Icon */}
            <button
              onClick={() => navigate('/my-cart')}
              className='relative p-2 hover:bg-gray-100 rounded-full transition-colors'
              aria-label='Giỏ hàng'
            >
              <ShoppingCart className='w-5 h-5' />
              {count > 0 && (
                <span className='absolute -top-1 -right-1 bg-blue-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center'>
                  {count}
                </span>
              )}
            </button>

            {/* User Menu / Auth Buttons */}
            {data ? (
              <div className='profile flex gap-2 text-sm font-bold items-center'>
                <Popover>
                  <PopoverTrigger className='flex gap-2 items-center'>
                    <p className='hidden md:block'>
                      <span className='text-red-500 italic font-base'>Xin chào</span> {data.name}
                    </p>
                    <Avatar className='rounded-3xl w-8 h-8 md:w-10 md:h-10'>
                      <AvatarImage src={data.avatarUrl} alt='avatar' />
                      <AvatarFallback>{data.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </PopoverTrigger>
                  <PopoverContent className='w-80'>
                    <Menu
                      username={data.username as string}
                      name={data.name as string}
                      avatarUrl={data.avatarUrl as string}
                      closeMenu={() => {}}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <div className='flex items-center gap-2'>
                <CustomButton
                  label='Đăng ký'
                  icon={<UserPlus className='w-4 h-4' />}
                  className='hidden md:flex signup-btn shadow-lg bg-white-100 text-blue-700 hover:text-white hover:bg-blue-800 rounded-xl font-base hover:scale-105 transition-transform duration-300 ease-in-out'
                  onClick={() => navigate('/auth?mode=signup')}
                />
                <CustomButton
                  label='Đăng nhập'
                  className='hidden md:flex btn-primary shadow-lg login-btn bg-blue-600 hover:bg-blue-800 font-base rounded-xl hover:scale-105 transition-transform duration-300 ease-in-out'
                  onClick={() => navigate('/auth')}
                  icon={<LogIn className='w-4 h-4' />}
                />
              </div>
            )}

            {/* Mobile Menu Button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className='md:hidden'>
                <button className='p-2 hover:bg-gray-100 rounded-full transition-colors'>
                  <MenuIcon className='w-5 h-5' />
                </button>
              </SheetTrigger>
              <SheetContent side='right' className='w-[300px] sm:w-[400px]'>
                <nav className='flex flex-col gap-4'>
                  {!data && (
                    <div className='flex flex-col gap-2 mb-4'>
                      <CustomButton
                        label='Đăng ký'
                        icon={<UserPlus className='w-4 h-4' />}
                        className='w-full signup-btn shadow-lg bg-white-100 text-blue-700 hover:text-white hover:bg-blue-800 rounded-xl font-base'
                        onClick={() => {
                          navigate('/auth?mode=signup')
                          setIsOpen(false)
                        }}
                      />
                      <CustomButton
                        label='Đăng nhập'
                        className='w-full btn-primary shadow-lg login-btn bg-blue-600 hover:bg-blue-800 font-base rounded-xl'
                        onClick={() => {
                          navigate('/auth')
                          setIsOpen(false)
                        }}
                        icon={<LogIn className='w-4 h-4' />}
                      />
                    </div>
                  )}
                  {menuItems.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => {
                        navigate(item.path)
                        setIsOpen(false)
                      }}
                      className='flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors'
                    >
                      {item.icon}
                      <span className='font-medium'>{item.label}</span>
                    </button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </NavigationMenuList>
        </div>
      </NavigationMenu>
    </div>
  )
}

export default Header
