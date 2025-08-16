import React, { FC } from 'react'
import CustomButton from '../../common/Button'
import CustomInput from '../../common/Input'
import { RiLoginCircleFill } from 'react-icons/ri'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FcGoogle } from 'react-icons/fc'
import CustomCheckbox from '../../common/CustomCheckbox'
import { FaSquareFacebook } from 'react-icons/fa6'
import { BookOpen } from 'lucide-react'

const SignInForm: FC = () => {
  return (
    <div className='w-full bg-white rounded-lg md:mt-0 sm:max-w-md xl:py-0'>
      <Card className='shadow-xl py-12 border-none'>
        <CardHeader className='text-center'>
          <CardTitle className='font-bold flex items-center justify-center gap-2'>
            <BookOpen />
            Chào mừng bạn đã quay trở lại !
          </CardTitle>
          <CardDescription>Nhâp thông tin đăng nhập của bạn để tiếp tục.</CardDescription>
          <CardContent className='mt-5'>
            <div className='login-form flex flex-col gap-3'>
              <CustomInput placeholder='Email' />
              <CustomInput placeholder='Password' type='password' />
            </div>
            <div className='remember-me flex justify-between items-center mt-5'>
              <CustomCheckbox id='remember-me' label='Ghi nhớ tôi' className='text-gray-700' />
              <p className='text-gray-700 text-sm font-bold'>Quên mật khẩu ?</p>
            </div>
            <div className='signin-button w-full mt-5'>
              <CustomButton
                label='Đăng nhập'
                icon={<RiLoginCircleFill />}
                className='w-full rounded-md border border-gray-300 bg-blue-500 py-3 text-white hover:bg-blue-600'
              />
            </div>
            {/* Divider */}
            <div className='relative mt-5'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-300'></div>
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='px-2 bg-white text-gray-500'>Hoặc tiếp tục với</span>
              </div>
            </div>
            {/* login with other providers */}
            <div className='mt-5 flex items-center justify-center gap-3 w-full'>
              <CustomButton icon={<FcGoogle />} className='bg-inherit w-1/2' />
              <CustomButton icon={<FaSquareFacebook className='text-white' />} className='bg-blue-600 w-1/2' />
            </div>
            <p className='text-center text-sm text-gray-500 mt-5'>
              Bạn chưa có tài khoản?{' '}
              <a href='/login' className='text-blue-500 hover:underline'>
                Đăng ký
              </a>
            </p>
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  )
}

export default SignInForm
