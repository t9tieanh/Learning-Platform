import { FC, useState, useEffect, useRef } from 'react'
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from '@/components/ui/navigation-menu'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import CustomButton from '../common/Button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import './style.scss'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuth.stores'
import { useCartStore } from '@/stores/useCart.stores'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  LogIn,
  UserPlus,
  ShoppingCart,
  Menu as MenuIcon,
  Crown,
  ChevronRight,
  House,
  BookOpen,
  GraduationCap,
  StickyNote,
  Building2
} from 'lucide-react'
import Menu from './menu'
import logo from '@/assets/images/logo1.png'
import { useVipUpgrade } from '@/contexts/VipUpgradeContext'
import { AnimatePresence, motion } from 'framer-motion'

const Header: FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const { data } = useAuthStore()
  const count = useCartStore((s) => s.count)
  const refresh = useCartStore((s) => s.refresh)
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
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

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const menuItems = [
    { icon: <House className='h-4 w-4' />, label: 'Trang chủ', value: 'home', path: '/' },
    { icon: <BookOpen className='h-4 w-4' />, label: 'Khóa học', value: 'course', path: '/courses' },
    { icon: <StickyNote className='h-4 w-4' />, label: 'Bài viết', value: 'blog', path: '/blog' },
    { icon: <Building2 className='h-4 w-4' />, label: 'Về chúng tôi', value: 'about', path: '/about' }
  ]
  const activeMenu = menuItems.find(
    (item) => location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
  )?.value

  return (
    <div
      ref={rootRef}
      className={`sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 px-4 py-3 backdrop-blur-md transition-all duration-300 ${
        isScrolled ? 'shadow-[0_14px_35px_rgba(15,23,42,0.1)]' : 'shadow-none'
      }`}
    >
      <NavigationMenu className='min-w-full mx-0'>
        <div className='mx-auto flex w-full max-w-7xl items-center justify-between rounded-2xl border border-slate-200 bg-white/90 px-4 py-2'>
          {/* Logo */}
          <NavigationMenuList className='text-left'>
            <button
              onClick={() => navigate('/')}
              className='group flex cursor-pointer items-center gap-2 rounded-xl border-none bg-transparent px-1 py-1.5'
            >
              <img src={logo} alt='LEARNOVA logo' className='h-9 w-auto select-none object-contain md:h-10' />
            </button>
          </NavigationMenuList>

          {/* Desktop Navigation */}
          <NavigationMenuList className='mx-auto hidden bg-transparent text-blue-500 md:block'>
            <NavigationMenuItem>
              <Tabs value={activeMenu} className='w-full'>
                <TabsList className='rounded-2xl border border-transparent bg-transparent p-1'>
                  {menuItems.map((item) => (
                    <motion.div
                      key={item.value}
                      whileHover={{ y: -1 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                      <TabsTrigger
                        value={item.value}
                        onClick={() => navigate(item.path)}
                        className='tab-page relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-base font-semibold text-blue-500 transition-all duration-300 hover:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-700 data-[state=active]:shadow-none'
                      >
                        {item.label}
                        {activeMenu === item.value && (
                          <motion.span
                            layoutId='header-active-pill'
                            className='absolute inset-x-2 -bottom-[1px] h-0.5 rounded-full bg-blue-500'
                            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                          />
                        )}
                      </TabsTrigger>
                    </motion.div>
                  ))}
                </TabsList>
              </Tabs>
            </NavigationMenuItem>
          </NavigationMenuList>

          {/* Right Section */}
          <NavigationMenuList className='flex items-center gap-2 md:gap-3'>
            {/* Cart Icon */}
            <motion.button
              onClick={() => navigate('/my-cart')}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className='relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 transition-all duration-300 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700'
              aria-label='Giỏ hàng'
            >
              <ShoppingCart className='h-5 w-5' />
              {count > 0 && (
                <span className='absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-600 px-1 text-xs font-semibold text-white'>
                  {count}
                </span>
              )}
            </motion.button>

            {/* User Menu / Auth Buttons */}
            {data ? (
              <div className='flex items-center gap-3 md:gap-5'>
                {/* Explore VIP Button — desktop only */}
                {!data.isVip && (
                  <motion.button
                    onClick={openVipDialog}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className='hidden items-center gap-1.5 rounded-full border border-amber-200 bg-gradient-to-r from-amber-200 via-yellow-200 to-orange-200 px-4 py-2 text-sm font-semibold text-amber-800 shadow-sm transition-all duration-300 hover:shadow-md md:flex'
                  >
                    <Crown className='h-4 w-4' />
                    <span>Khám phá VIP</span>
                  </motion.button>
                )}

                <div className='profile flex gap-2 text-sm font-bold items-center'>
                  <Popover open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                    <PopoverTrigger className='flex items-center gap-2 rounded-2xl border border-cyan-200/80 bg-gradient-to-r from-cyan-50 via-white to-blue-50 px-2.5 py-1.5 outline-none shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md'>
                      <p className='mt-0.5 hidden text-sm font-medium text-slate-800 md:block'>
                        <span className='font-semibold text-cyan-700'>Xin chào,</span> {data.name}
                      </p>
                      <div className='relative'>
                        <Avatar
                          className={`h-9 w-9 rounded-3xl border border-white transition-transform duration-300 hover:scale-105 md:h-10 md:w-10 ${
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
                    <PopoverContent className='w-88 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl'>
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
                <motion.button
                  type='button'
                  onClick={openVipDialog}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className='hidden items-center gap-1.5 rounded-full border border-amber-200 bg-gradient-to-r from-amber-200 via-yellow-200 to-orange-200 px-4 py-2 text-sm font-semibold text-amber-800 shadow-sm transition-all duration-300 hover:shadow-md md:flex'
                >
                  <Crown className='w-4 h-4 shrink-0' aria-hidden />
                  <span>Khám phá VIP</span>
                </motion.button>
                <CustomButton
                  label='Đăng ký'
                  icon={<UserPlus className='w-4 h-4' />}
                  className='signup-btn hidden rounded-xl border border-slate-200 bg-white px-3 text-slate-700 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 md:flex'
                  onClick={() => navigate('/auth?mode=signup')}
                />
                <CustomButton
                  label='Đăng nhập'
                  className='btn-primary login-btn hidden rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-3 shadow-md transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:from-cyan-700 hover:to-blue-700 md:flex'
                  onClick={() => navigate('/auth')}
                  icon={<LogIn className='w-4 h-4' />}
                />
              </div>
            )}

            {/* Mobile Hamburger Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className='md:hidden'>
                <button
                  className='rounded-xl border border-slate-200 bg-white p-2.5 transition-all duration-300 hover:border-cyan-200 hover:bg-cyan-50'
                  aria-label='Mở menu'
                >
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
                      <button
                        type='button'
                        onClick={() => {
                          openVipDialog()
                          setIsOpen(false)
                        }}
                        className='w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-yellow-700 bg-gradient-to-r from-yellow-50 to-amber-100 hover:from-yellow-100 hover:to-amber-200 border border-yellow-200 rounded-xl transition-all shadow-sm'
                      >
                        <span className='flex items-center gap-2'>
                          <Crown className='w-4 h-4 shrink-0' aria-hidden />
                          Khám phá VIP
                        </span>
                        <ChevronRight className='w-4 h-4 opacity-60 shrink-0' aria-hidden />
                      </button>
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
                      <motion.button
                        key={item.value}
                        whileHover={{ x: 2 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => {
                          navigate(item.path)
                          setIsOpen(false)
                        }}
                        className='flex items-center gap-3 px-4 py-3 hover:bg-cyan-50 rounded-xl transition-all duration-300 text-sm font-medium hover:text-cyan-700 text-left w-full text-slate-700'
                      >
                        <span className='w-5 h-5 flex items-center justify-center text-slate-500'>{item.icon}</span>
                        <span>{item.label}</span>
                        <AnimatePresence>
                          {(location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)) && (
                            <motion.span
                              initial={{ opacity: 0, x: -4 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -4 }}
                              className='ml-auto h-2 w-2 rounded-full bg-cyan-500'
                            />
                          )}
                        </AnimatePresence>
                      </motion.button>
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
