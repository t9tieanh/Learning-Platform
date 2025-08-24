import React, { FC } from 'react'
import CustomButton from '../../common/Button'
import CustomInput from '../../common/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FcGoogle } from 'react-icons/fc'
import CustomCheckbox from '../../common/CustomCheckbox'
import { FaSquareFacebook } from 'react-icons/fa6'
import { BookOpen } from 'lucide-react'

const SignUpForm: FC = () => {
  return (
    <div className='w-full bg-white rounded-lg md:mt-0 sm:max-w-md xl:py-0'>
      <Card className='shadow-xl py-12 border-none'>
        <CardHeader className='text-center'>
          <CardTitle className='font-bold flex items-center justify-center gap-2'>
            <BookOpen />
            Đăng ký tài khoản mới
          </CardTitle>
          <CardDescription>Nhâp thông tin đăng nhập của bạn để tiếp tục.</CardDescription>
          <CardContent className='mt-5'>
            <div className='login-form flex flex-col gap-3'>
              <CustomInput placeholder='Email' />
              <CustomInput placeholder='Nhập tên của bạn !' />
              <CustomInput placeholder='Password' type='password' />
              <CustomInput placeholder='Xác nhận lại password' type='password' />
            </div>
            <div className='remember-me mt-5'>
              <CustomCheckbox id='remember-me' label='Đồng ý với điều khoản dịch ' className='text-gray-700' />
            </div>
            <div className='signin-button w-full mt-5'>
              <CustomButton
                label='Tạo tài khoản'
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
              <CustomButton icon={<FcGoogle />} className='bg-inherit w-1/2 border-2 border-solid hover:bg-red-600' />
              <CustomButton
                icon={<FaSquareFacebook className='text-white' />}
                className='bg-blue-600 w-1/2 border-2 border-solid hover:bg-blue-700'
              />
            </div>
            <p className='text-center text-sm text-gray-500 mt-5'>
              Bạn đã có tài khoản?{' '}
              <a href='/login' className='text-blue-500 hover:underline'>
                Đăng nhập
              </a>
            </p>
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  )
}

export default SignUpForm
