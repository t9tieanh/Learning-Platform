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
import {
  LogIn,
  UserPlus,
  House,
  BookOpen,
  Building2,
  StickyNote,
  ShoppingCart,
  Menu as MenuIcon,
  Crown,
  ChevronRight
} from 'lucide-react'
import Menu from './menu'
import logo from '@/assets/images/logo1.png'
import { useVipUpgrade } from '@/contexts/VipUpgradeContext'

const Header: FC = () => {
  const navigate = useNavigate()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const { data } = useAuthStore()
  const count = useCartStore((s) => s.count)
  const refresh = useCartStore((s) => s.refresh)
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { openVipDialog } = useVipUpgrade()

  useEffect(() => {
    refresh().catch(() => {})
  }, [refresh])

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
    { icon: <StickyNote className='w-5 h-5' />, label: 'Bài viết', value: 'blog', path: '/blog' }
  ]

  return (
    <div ref={rootRef} className='p-3 w-full bg-white sticky top-0 z-50 shadow-sm'>
      <NavigationMenu className='min-w-full mx-0'>
        <div className='max-w-7xl mx-auto flex items-center justify-between w-full p-1'>
          {/* Logo */}
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
              <div className='flex items-center gap-3 md:gap-5'>
                {/* Explore VIP Button — desktop only */}
                {!data.isVip && (
                  <button
                    onClick={openVipDialog}
                    className='hidden md:flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold text-yellow-700 bg-gradient-to-r from-yellow-100 to-amber-100 hover:from-yellow-200 hover:to-amber-200 border border-yellow-200 rounded-full transition-all hover:scale-105 shadow-sm'
                  >
                    <Crown className='w-4 h-4' />
                    <span>Khám phá VIP</span>
                  </button>
                )}

                <div className='profile flex gap-2 text-sm font-bold items-center'>
                  <Popover open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                    <PopoverTrigger className='flex gap-2 items-center outline-none'>
                      <p className='hidden md:block mt-0.5'>
                        <span className='text-red-500 italic font-base'>Xin chào</span> {data.name}
                      </p>
                      <div className='relative'>
                        <Avatar
                          className={`rounded-3xl w-8 h-8 md:w-10 md:h-10 transition-transform hover:scale-105 ${
                            data.isVip ? 'ring-2 ring-yellow-400 ring-offset-2' : ''
                          }`}
                        >
                          <AvatarImage src={data.avatarUrl} alt='avatar' />
                          <AvatarFallback>{data.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {data.isVip && (
                          <div className='absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full p-0.5 shadow-sm border-2 border-white z-10'>
                            <Crown className='w-3 h-3 text-white' strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className='w-80'>
                      <Menu
                        username={data.username as string}
                        name={data.name as string}
                        avatarUrl={data.avatarUrl as string}
                        closeMenu={() => setIsProfileOpen(false)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            ) : (
              <div className='flex items-center gap-2'>
                <CustomButton
                  label='Đăng ký'
                  icon={<UserPlus className='w-4 h-4' />}
                  className='hidden md:flex signup-btn shadow-sm bg-white-100 text-blue-700 hover:text-white hover:bg-blue-800 rounded-xl font-base hover:scale-105 transition-transform duration-300 ease-in-out'
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

            {/* Mobile Hamburger Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className='md:hidden'>
                <button className='p-2 hover:bg-gray-100 rounded-full transition-colors' aria-label='Mở menu'>
                  <MenuIcon className='w-5 h-5' />
                </button>
              </SheetTrigger>
              <SheetContent side='right' className='w-[300px] sm:w-[360px] p-0 flex flex-col'>
                {/* Sheet Header */}
                <div className='flex items-center gap-3 px-5 py-4 border-b shrink-0'>
                  <img src={logo} alt='LEARNOVA logo' className='h-7 w-auto select-none object-contain' />
                </div>

                <div className='flex flex-col flex-1 overflow-y-auto'>
                  {/* Logged-in user profile section */}
                  {data ? (
                    <div className='px-4 pt-4 pb-3 border-b'>
                      <div className='flex items-center gap-3 mb-3'>
                        <div className='relative shrink-0'>
                          <Avatar className={`w-12 h-12 ${data.isVip ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}`}>
                            <AvatarImage src={data.avatarUrl} alt='avatar' />
                            <AvatarFallback>{data.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {data.isVip && (
                            <div className='absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full p-0.5 shadow-sm border-2 border-white z-10'>
                              <Crown className='w-3 h-3 text-white' strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        <div className='min-w-0'>
                          <p className='font-semibold text-sm truncate'>{data.name}</p>
                          <p className='text-xs text-muted-foreground truncate'>@{data.username}</p>
                          {data.isVip && (
                            <span className='inline-flex items-center gap-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full px-2 py-0.5 mt-1'>
                              <Crown className='w-3 h-3' /> VIP Member
                            </span>
                          )}
                        </div>
                      </div>

                      {/* VIP upgrade CTA in mobile menu */}
                      {!data.isVip && (
                        <button
                          onClick={() => {
                            openVipDialog()
                            setIsOpen(false)
                          }}
                          className='w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-yellow-700 bg-gradient-to-r from-yellow-50 to-amber-100 hover:from-yellow-100 hover:to-amber-200 border border-yellow-200 rounded-xl transition-all shadow-sm'
                        >
                          <span className='flex items-center gap-2'>
                            <Crown className='w-4 h-4' />
                            Khám phá gói VIP
                          </span>
                          <ChevronRight className='w-4 h-4 opacity-60' />
                        </button>
                      )}
                    </div>
                  ) : (
                    /* Guest auth buttons */
                    <div className='flex flex-col gap-2.5 px-4 py-4 border-b'>
                      <CustomButton
                        label='Đăng nhập'
                        icon={<LogIn className='w-4 h-4' />}
                        className='w-full btn-primary shadow-lg login-btn bg-blue-600 hover:bg-blue-800 font-medium text-sm rounded-xl py-2.5'
                        onClick={() => {
                          navigate('/auth')
                          setIsOpen(false)
                        }}
                      />
                      <CustomButton
                        label='Đăng ký'
                        icon={<UserPlus className='w-4 h-4' />}
                        className='w-full signup-btn shadow-sm bg-white text-blue-700 border border-blue-200 hover:text-white hover:bg-blue-800 rounded-xl font-medium text-sm py-2.5'
                        onClick={() => {
                          navigate('/auth?mode=signup')
                          setIsOpen(false)
                        }}
                      />
                    </div>
                  )}

                  {/* Navigation Links */}
                  <nav className='flex flex-col gap-1 px-3 py-3'>
                    {menuItems.map((item) => (
                      <button
                        key={item.value}
                        onClick={() => {
                          navigate(item.path)
                          setIsOpen(false)
                        }}
                        className='flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-xl transition-colors text-sm font-medium hover:text-blue-600 text-left w-full'
                      >
                        <span className='w-5 h-5 flex items-center justify-center text-gray-500'>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </NavigationMenuList>
        </div>
      </NavigationMenu>
    </div>
  )
}

export default Header
