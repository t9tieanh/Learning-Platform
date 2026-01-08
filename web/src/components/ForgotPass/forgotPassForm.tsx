import CustomInput from '@/components/common/Input'
import CustomButton from '@/components/common/Button'
import { Send, LogIn } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { toast } from 'sonner'
import * as yup from 'yup'
import useLoading from '@/hooks/useLoading.hook'
import userService from '@/services/user/user.service'
import { useNavigate } from 'react-router'

export const ForgotPassSchema = yup.object({
  email: yup.string().required('Email không được để trống').email('Email không hợp lệ')
})

const ForgotPassForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<{
    email: string
  }>({
    resolver: yupResolver(ForgotPassSchema)
  })

  const { startLoading, stopLoading, loading } = useLoading()
  const navigator = useNavigate()

  // handle forgot password
  const onSubmit = async ({ email }: { email: string }) => {
    try {
      startLoading()
      const response = await userService.requestForgotPassword(email)
      if (response && response.code === 200) {
        toast.success(response.message)
        navigator('/auth')
      } else toast.error(response.message)
    } catch (error: any) {
      toast.error('Đã có lỗi trong quá trình xử lý !')
    } finally {
      stopLoading()
    }
  }

  return (
    <>
      <form className='flex flex-col gap-3 mt-2' onSubmit={handleSubmit(onSubmit)}>
        <CustomInput
          id='email'
          type='email'
          placeholder='learningplatform@hcmute.com'
          {...register('email')}
          className='mb-2 border-primary focus:border-primary'
        />
        {errors.email && <span className='text-red-500 text-xs text-left'>{errors.email.message}</span>}
        <CustomButton
          className='hover:bg-blue-600 shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 text-white font-semibold py-2 rounded-lg'
          label='Gửi liên kết xác nhận'
          isLoader={loading}
          type='submit'
          icon={<Send />}
        />
        <CustomButton
          className='hover:bg-blue-100 text-black bg-white shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 font-semibold py-2 rounded-lg'
          label='Đăng nhập'
          onClick={() => {
            navigator('/auth')
          }}
          icon={<LogIn />}
        />
      </form>
    </>
  )
}

export default ForgotPassForm
