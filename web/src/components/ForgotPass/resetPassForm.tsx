import CustomInput from '@/components/common/Input'
import CustomButton from '@/components/common/Button'
import { Send } from 'lucide-react'
import { useEffect } from 'react'
import userService from '@/services/user.service'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { toast } from 'react-toastify'
import * as yup from 'yup'
import useLoading from '@/hooks/useLoading.hook'

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

  useEffect(() => {
    const checkForgotPasswordToken = async (token: string) => {
      try {
        const response = await userService.checkForgotPasswordToken(token)
        if (response && response.code === 200) {
          toast.success('Yêu cầu hợp lệ, bạn có thể đặt lại mật khẩu.')
        } else {
          toast.error('Yêu cầu đã hết hạn, vui lòng thử lại sau.')
          navigator('/auth')
        }
      } catch (error) {
        console.log(error)
        toast.error('Có lỗi khi kiểm tra token quên mật khẩu:')
      }
    }

    if (code) {
      checkForgotPasswordToken(code)
    }
  }, [code])

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
          className='hover:bg-blue-600 shadow-lg mt-3 transition-transform duration-300 ease-in-out hover:scale-105 text-white font-semibold py-2 rounded-lg'
          label='Đặt lại mật khẩu'
          type='submit'
          isLoader={loading}
          icon={<Send />}
        />
      </form>
    </>
  )
}

export default ResetPassForm
