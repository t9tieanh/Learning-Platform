import { FC } from 'react'
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from '@/components/ui/navigation-menu'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import './style.scss'

const Header: FC = () => {
  return (
    <div className=' p-3 w-full header-container'>
      <NavigationMenu className='min-w-full mx-0'>
        <div className='flex items-center justify-between w-full p-1'>
          <NavigationMenuList className='text-left'>
            <Avatar className='rounded-lg'>
              <AvatarImage
                src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHR98lk3F3Pc1Fg4QjflSxwbbCeOd6D-JEnQ&s'
                alt='@shadcn'
              />
              <AvatarFallback>LEARNING_PLATFORM</AvatarFallback>
            </Avatar>
            {/* <NavigationMenuTrigger className='text-blue-700 font-bold'>Trái</NavigationMenuTrigger> */}
          </NavigationMenuList>
          <NavigationMenuList className='mx-auto bg-transparent'>
            <NavigationMenuItem>
              <Tabs defaultValue='home' className='w-full'>
                <TabsList className='flex gap-6 bg-transparent px-4 py-2'>
                  <TabsTrigger
                    value='home'
                    className='tab-page font-semibold px-4 py-4 rounded-lg transition-colors duration-200 hover:bg-blue-100 hover:text-blue-700 data-[state=active]:bg-blue-500 data-[state=active]:text-white'
                  >
                    Trang chủ
                  </TabsTrigger>
                  <TabsTrigger
                    value='course'
                    className='tab-page font-semibold px-4 py-4 rounded-lg transition-colors duration-200 hover:bg-blue-100 hover:text-blue-700 data-[state=active]:bg-blue-500 data-[state=active]:text-white'
                  >
                    Khóa học
                  </TabsTrigger>
                  <TabsTrigger
                    value='about'
                    className='tab-page font-semibold px-4 py-4 rounded-lg transition-colors duration-200 hover:bg-blue-100 hover:text-blue-700 data-[state=active]:bg-blue-500 data-[state=active]:text-white'
                  >
                    Về chúng tôi
                  </TabsTrigger>
                  <TabsTrigger
                    value='blog'
                    className='tab-page font-semibold px-4 py-4 rounded-lg transition-colors duration-200 hover:bg-blue-100 hover:text-blue-700 data-[state=active]:bg-blue-500 data-[state=active]:text-white'
                  >
                    Blog
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </NavigationMenuItem>
          </NavigationMenuList>
          <NavigationMenuList className='text-right'>
            <NavigationMenuItem className='flex gap-2'>
              <Button variant={'secondary'} className='signup-btn bg-blue-200 text-blue-700 rounded-xl font-normal'>
                Đăng ký
              </Button>
              <Button className='btn-primary login-btn bg-blue-500 rounded-xl font-normal'>Đăng nhập</Button>
            </NavigationMenuItem>
          </NavigationMenuList>
        </div>
      </NavigationMenu>
    </div>
  )
}

export default Header
