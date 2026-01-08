import CustomInput from '@/components/common/Input'
import CustomButton from '@/components/common/Button'
import { Send, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import userService from '@/services/user/user.service'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { toast } from 'sonner'
import * as yup from 'yup'
import useLoading from '@/hooks/useLoading.hook'
import Countdown from 'react-countdown'

export const ResetPassSchema = yup.object({
  password: yup.string().required('Mật khẩu không được để trống').min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Mật khẩu xác nhận không khớp')
    .required('Xác nhận mật khẩu không được để trống')
})

const ResetPassForm: React.FC<{ code: string }> = ({ code }: { code: string }) => {
  const navigator = useNavigate()
  const { startLoading, stopLoading, loading } = useLoading()
  const [ttlRemaining, setTtlRemaining] = useState<number>(0)
  const [isExpired, setIsExpired] = useState<boolean>(false)

  useEffect(() => {
    const checkForgotPasswordToken = async (token: string) => {
      try {
        const response = await userService.checkForgotPasswordToken(token)
        if (response && response.code === 200) {
          toast.success('Yêu cầu hợp lệ, bạn có thể đặt lại mật khẩu.')
          // Set TTL from response
          if (response.result) {
            setTtlRemaining(response.result.timeToLive)
          }
          setIsExpired(false)
        } else {
          toast.error('Yêu cầu đã hết hạn, vui lòng thử lại sau.')
          setIsExpired(true)
          setTimeout(() => navigator('/auth'), 2000)
        }
      } catch (error) {
        console.log(error)
        toast.error('Có lỗi khi kiểm tra token quên mật khẩu')
        setIsExpired(true)
        setTimeout(() => navigator('/auth'), 2000)
      }
    }

    if (code) {
      checkForgotPasswordToken(code)
    }
  }, [code, navigator])

  // for form handling
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<{
    password: string
    confirmPassword: string
  }>({
    resolver: yupResolver(ResetPassSchema)
  })

  // handle reset password
  const onSubmit = async (data: { password: string; confirmPassword: string }) => {
    try {
      startLoading()
      const response = await userService.resetPassword(code, data.password)
      if (response && response.result && response.code === 200) {
        toast.success(`Đặt lại mật khẩu cho tài khoản ${response.result.email} thành công! Vui lòng đăng nhập lại.`)
        navigator('/auth')
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại!')
    } finally {
      stopLoading()
    }
  }

  return (
    <>
      {ttlRemaining > 0 && (
        <div className='text-sm p-4 bg-orange-50 rounded-lg border border-orange-200'>
          <Countdown
            onComplete={() => {
              setIsExpired(true)
              setTtlRemaining(0)
            }}
            date={Date.now() + ttlRemaining * 1000}
            renderer={({ hours, minutes, seconds, completed }) =>
              completed ? (
                <div className='flex items-center gap-2 text-red-600 font-semibold'>
                  <Clock className='h-4 w-4' />
                  <span>Yêu cầu đã hết hạn</span>
                </div>
              ) : (
                <div className='flex items-center gap-2 text-orange-600 font-semibold'>
                  <Clock className='h-4 w-4' />
                  <span>
                    Còn lại: {hours > 0 ? `${hours}h ` : ''} {minutes}m {seconds}s
                  </span>
                </div>
              )
            }
          />
        </div>
      )}

      {isExpired && ttlRemaining === 0 && (
        <div className='text-center py-8 text-sm'>
          <p className='text-red-600 font-semibold mb-4'>Yêu cầu đặt lại mật khẩu đã hết hạn</p>
          <CustomButton label='Quay lại đăng nhập' onClick={() => navigator('/auth')} className='w-full' />
        </div>
      )}

      {!isExpired && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <CustomInput
            id='password'
            type='password'
            placeholder='Nhập mật khẩu mới'
            className='mb-2 border-primary focus:border-primary shadow-lg'
            {...register('password')}
          />
          {errors.password && <span className='text-red-500 text-xs text-left'>{errors.password.message}</span>}
          <CustomInput
            id='confirm-password'
            type='password'
            placeholder='Xác nhận mật khẩu mới'
            className='mb-2 border-primary focus:border-primary shadow-lg'
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <span className='text-red-500 text-xs text-left'>{errors.confirmPassword.message}</span>
          )}
          <CustomButton
            className='hover:bg-blue-600 shadow-lg mt-3 transition-transform duration-300 ease-in-out hover:scale-105 text-white font-semibold py-2 rounded-lg w-full'
            label={<>Đặt lại mật khẩu</>}
            type='submit'
            isLoader={loading}
            disabled={isExpired}
            icon={<Send />}
          />
        </form>
      )}
    </>
  )
}

export default ResetPassForm
