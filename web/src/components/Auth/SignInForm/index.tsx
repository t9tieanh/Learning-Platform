import React, { FC } from 'react'
import CustomButton from '../../common/Button'
import CustomInput from '../../common/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FcGoogle } from 'react-icons/fc'
import CustomCheckbox from '../../common/CustomCheckbox'
import { FaSquareFacebook } from 'react-icons/fa6'
import { BookOpen } from 'lucide-react'
import { SignInFormInputs, signInSchema } from '@/utils/auth'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import userService from '@/services/user.service'
import { toast } from 'react-toastify'
import useLoading from '@/hooks/useLoading.hook'
import { useAuthStore } from '@/stores/useAuth.stores'
import { useNavigate } from 'react-router-dom'

const SignInForm: FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignInFormInputs>({
    resolver: yupResolver(signInSchema)
  })
  const navigator = useNavigate()

  // Get state and actions
  const { data, setData } = useAuthStore()

  // check if already logged in
  if (data) {
    toast.info('Bạn đã đăng nhập rồi!')
    navigator('/')
  }

  const { loading, startLoading, stopLoading } = useLoading()

  // handle signin
  const onSubmit = async (data: SignInFormInputs) => {
    try {
      startLoading()
      const response = await userService.login(data.username, data.password)
      if (response && response.result && response.code === 200) {
        // save to localstorage
        setData(response.result)
        toast.success('Đăng nhập thành công!')
        navigator('/')
      } else toast.error(response.message)
    } catch (error: any) {
      toast.error('Đã có lỗi trong quá trình xử lý !')
    } finally {
      stopLoading()
    }
  }

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
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className='login-form flex flex-col gap-3'>
                <CustomInput placeholder='Nhập username hoặc email' {...register('username')} />
                {errors.username && <span className='text-red-500 text-xs text-left'>{errors.username.message}</span>}

                <CustomInput placeholder='Password' type='password' {...register('password')} />
                {errors.password && <span className='text-red-500 text-xs text-left'>{errors.password.message}</span>}
              </div>
              <div className='remember-me flex justify-between items-center mt-5'>
                <CustomCheckbox id='remember-me' label='Ghi nhớ tôi' className='text-gray-700' />
                <p className='text-gray-700 text-sm font-bold'>Quên mật khẩu ?</p>
              </div>
              <div className='signin-button w-full mt-5'>
                <CustomButton
                  label='Đăng nhập'
                  isLoader={loading}
                  type='submit'
                  className='w-full rounded-md border border-gray-300 bg-blue-500 py-3 text-white hover:bg-blue-600'
                />
              </div>
            </form>
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
