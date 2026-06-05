import { FC, useState, useEffect, useRef } from 'react'
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
  ChevronDown,
  House,
  BookOpen,
  StickyNote,
  Building2
} from 'lucide-react'
import Menu from './menu'
import logo from '@/assets/images/logo1.png'
import { useVipUpgrade } from '@/contexts/VipUpgradeContext'
import { AnimatePresence, motion } from 'framer-motion'

const VIP_EXPLORE_LABEL = 'Khám phá VIP'

const VipExploreButton: FC<{ onClick: () => void; className?: string }> = ({ onClick, className = '' }) => (
  <motion.button
    type='button'
    onClick={onClick}
    title={VIP_EXPLORE_LABEL}
    aria-label={VIP_EXPLORE_LABEL}
    whileHover={{ y: -1 }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.2 }}
    className={`group/vip hidden h-10 w-10 shrink-0 flex-none items-center justify-center overflow-visible rounded-full border border-amber-200 bg-gradient-to-r from-amber-200 via-yellow-200 to-orange-200 text-sm font-semibold text-amber-800 shadow-sm transition-[width,padding,box-shadow] duration-200 hover:z-20 hover:w-auto hover:justify-start hover:px-2.5 hover:shadow-md md:flex ${className}`}
  >
    <Crown className='h-4 w-4 shrink-0' aria-hidden />
    <span className='inline-block max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-[max-width,opacity,margin] duration-200 ease-out group-hover/vip:ml-1.5 group-hover/vip:max-w-[6.5rem] group-hover/vip:opacity-100 group-focus-visible/vip:ml-1.5 group-focus-visible/vip:max-w-[6.5rem] group-focus-visible/vip:opacity-100'>
      {VIP_EXPLORE_LABEL}
    </span>
  </motion.button>
)

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
      className={`sticky top-0 z-50 w-full border-b px-4 py-2 transition-[border-color,box-shadow,background-color,backdrop-filter] duration-300 ${
        isScrolled
          ? 'border-slate-200/60 bg-white/70 shadow-[0_14px_35px_rgba(15,23,42,0.1)] backdrop-blur-md backdrop-saturate-150'
          : 'border-transparent bg-white shadow-none backdrop-blur-none'
      }`}
    >
      <div className='mx-auto grid h-14 w-full max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 px-2 md:gap-x-4 md:px-4'>
        {/* Logo */}
        <div className='flex shrink-0 items-center justify-start'>
          <button
            type='button'
            onClick={() => navigate('/')}
            className='shrink-0 rounded-xl border-none bg-transparent p-1'
          >
            <img src={logo} alt='LEARNOVA logo' className='h-9 w-auto select-none object-contain md:h-10' />
          </button>
        </div>

        {/* Desktop Navigation — căn giữa vùng giữa logo và actions */}
        <nav
          className='hidden min-w-0 justify-self-stretch md:flex md:items-center md:justify-center md:translate-x-14 lg:translate-x-16'
          aria-label='Điều hướng chính'
        >
          <Tabs value={activeMenu}>
            <TabsList className='h-auto w-auto flex-nowrap gap-0.5 rounded-2xl border border-transparent bg-transparent p-0.5 [&_[data-slot=tabs-trigger]]:flex-none'>
              {menuItems.map((item) => {
                const isActive = activeMenu === item.value
                return (
                  <TabsTrigger
                    key={item.value}
                    value={item.value}
                    onClick={() => navigate(item.path)}
                    className='tab-page relative flex h-10 shrink-0 flex-none items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition-colors duration-200 hover:bg-slate-50 hover:text-blue-600 data-[state=active]:bg-blue-50/80 data-[state=active]:text-blue-700 data-[state=active]:shadow-none'
                  >
                    <span
                      className={`flex shrink-0 items-center justify-center transition-colors duration-200 ${
                        isActive ? 'text-blue-600' : 'text-slate-400'
                      }`}
                      aria-hidden
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                    {isActive && (
                      <span className='absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-blue-500' />
                    )}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>
        </nav>

        {/* Right Section */}
        <div className='flex shrink-0 flex-nowrap items-center justify-end gap-2 md:gap-2.5'>
            {/* Cart Icon */}
            <motion.button
              onClick={() => navigate('/my-cart')}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className='relative shrink-0 rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 transition-all duration-300 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700'
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
              <div className='flex shrink-0 flex-nowrap items-center gap-2 md:gap-2.5'>
                {/* Explore VIP Button — desktop only */}
                {!data.isVip && <VipExploreButton onClick={openVipDialog} />}

                <div className='profile shrink-0'>
                  <Popover open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                    <PopoverTrigger className='group flex h-10 max-h-10 shrink-0 flex-nowrap items-center gap-2 rounded-full border border-slate-200/90 bg-white py-1 pl-1 pr-1.5 outline-none shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-all duration-300 hover:border-slate-300 hover:shadow-[0_4px_14px_rgba(15,23,42,0.08)] xl:gap-2.5 xl:pl-3 xl:pr-1.5'>
                      <span className='hidden max-w-[11rem] truncate whitespace-nowrap text-sm xl:inline'>
                        <span className='font-medium text-slate-500'>Xin chào, </span>
                        <span className='font-semibold text-slate-900'>{data.name}</span>
                      </span>
                      <div className='relative shrink-0'>
                        <Avatar
                          className={`h-9 w-9 rounded-full border-2 border-slate-100 transition-transform duration-300 group-hover:scale-[1.02] md:h-9 md:w-9 ${
                            data.isVip ? 'ring-2 ring-amber-400/90 ring-offset-2 ring-offset-white' : ''
                          }`}
                        >
                          <AvatarImage src={data.avatarUrl} alt='avatar' />
                          <AvatarFallback className='bg-slate-100 text-slate-600 text-sm font-semibold'>
                            {data.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {data.isVip && (
                          <div className='absolute -bottom-0.5 -right-0.5 z-10 rounded-full border-2 border-white bg-gradient-to-r from-amber-400 to-amber-600 p-0.5 shadow-sm'>
                            <Crown className='w-2.5 h-2.5 text-white' strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <ChevronDown
                        className='hidden h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 group-data-[state=open]:rotate-180 md:block xl:ml-0'
                        aria-hidden
                      />
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
                <VipExploreButton onClick={openVipDialog} />
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
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium text-left w-full ${
                          location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
                              ? 'bg-white text-blue-600 shadow-sm'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {item.icon}
                        </span>
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
        </div>
      </div>
    </div>
  )
}

export default Header
