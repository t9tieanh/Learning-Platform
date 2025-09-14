import { useState } from 'react'
import { Card, CardDescription, CardHeader } from '@/components/ui/card'
import forgot from '@/assets/images/forgot1.png'
import ForgotPassForm from '@/components/ForgotPass/forgotPassForm'
import ResetPassForm from '@/components/ForgotPass/resetPassForm'
import { KeyRound } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const ForgotPass = () => {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const code = params.get('code')

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
              <h2 className='text-2xl sm:text-3xl font-semibold text-center text-primary'>
                <KeyRound className='inline-block w-10 h-10 mb-1 mr-2 text-primary' />
                Quên mật khẩu
              </h2>
            </CardHeader>
            <CardDescription>
              <p className='mb-2 text-center text-sm sm:text-base'>
                Vui lòng nhập địa chỉ email của bạn để nhận liên kết đặt lại mật khẩu.
              </p>
            </CardDescription>
            {!code ? <ForgotPassForm /> : <ResetPassForm />}
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
