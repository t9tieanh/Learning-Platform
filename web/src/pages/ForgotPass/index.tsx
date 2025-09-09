import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import forgot from '@/assets/images/forgot.png'

const ForgotPass = () => {
  const [email, setEmail] = useState('')

  return (
    // <div className='min-h-screen flex flex-col items-center justify-center bg-gray-50'>
    <div className='relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300 overflow-hidden'>
      <div className='mb-6'>
        <img src={forgot} alt='Logo' className='h-64 mx-auto' />
      </div>
      <Card className='w-full max-w-md shadow-lg rounded-xl py-10 gap-4'>
        <CardHeader className=''>
          <h2 className='text-2xl font-semibold'>Quên mật khẩu</h2>
        </CardHeader>
        <CardDescription className=''>
          <p className='mx-6'>Vui lòng nhập địa chỉ email của bạn để nhận liên kết đặt lại mật khẩu.</p>
        </CardDescription>
        <form className='mx-6 flex flex-col gap-3'>
          <label htmlFor='email' className='font-medium mb-1'>
            Địa chỉ email
          </label>
          <Input
            id='email'
            type='email'
            placeholder='example@gmail.com'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='mb-2'
          />
          <Button className='hover:bg-blue-800 text-white font-semibold py-2 rounded-lg'>Nhận liên kết đặt lại</Button>
          <a href='/auth' className='text-primary text-sm text-center mt-2 hover:underline'>
            Đăng nhập
          </a>
        </form>
      </Card>
    </div>
  )
}

export default ForgotPass
