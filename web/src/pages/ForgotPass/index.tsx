import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import forgot from '@/assets/images/forgot1.png'

const ForgotPass = () => {
  const [email, setEmail] = useState('')

  return (
    <div className='relative min-h-screen flex items-center justify-center overflow-hidden bg-white'>
      {/* Gradient blur background */}
      <div className='absolute inset-0 pointer-events-none'>
        <div className='absolute left-[70%] top-[0%] w-[400px] h-[400px] sm:w-[200px] sm:h-[200px] md:w-[400px] md:h-[400px] bg-gradient-to-br from-blue-400 via-blue-200 to-transparent rounded-full blur-2xl sm:blur-3xl opacity-50 sm:opacity-60'></div>
        <div className='absolute right-[70%] bottom-[0%] w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[400px] md:h-[400px] bg-gradient-to-tr from-blue-400 via-blue-300 to-transparent rounded-full blur-xl sm:blur-2xl md:blur-3xl opacity-40 sm:opacity-50'></div>
      </div>
      <div className='flex w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10 flex-col md:flex-row'>
        {/* Left: Form */}
        <div className='flex-1 w-full max-w-3xl flex flex-col justify-center py-16 px-4 sm:py-20 sm:px-8'>
          <Card className='shadow-none border-none p-0'>
            <CardHeader>
              <h2 className='text-2xl sm:text-3xl font-semibold text-center text-primary'>Quên mật khẩu</h2>
            </CardHeader>
            <CardDescription>
              <p className='mb-2 text-center text-sm sm:text-base'>Vui lòng nhập địa chỉ email của bạn để nhận liên kết đặt lại mật khẩu.</p>
            </CardDescription>
            <form className='flex flex-col gap-3 mt-2'>
              <Input
                id='email'
                type='email'
                placeholder='example@gmail.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='mb-2 border-primary focus:border-primary'
              />
              <Button className='hover:bg-blue-600 transition-transform duration-300 ease-in-out hover:scale-105 text-white font-semibold py-2 rounded-lg'>
                Nhận liên kết đặt lại
              </Button>
              <a href='/auth' className='text-primary text-sm text-center mt-2 hover:underline hover:text-blue-600'>
                Đăng nhập
              </a>
            </form>
          </Card>
        </div>
        {/* Right: Image */}
        <div className='hidden md:flex flex-1 items-center justify-center bg-white'>
          <img src={forgot} alt='Forgot password' className='w-2/3 max-w-xs md:w-3/4' />
        </div>
      </div>
    </div>
  )
}

export default ForgotPass
