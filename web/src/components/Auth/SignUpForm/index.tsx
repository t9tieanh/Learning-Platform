/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from 'react'
import CustomButton from '../../common/Button'
import CustomInput from '../../common/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FcGoogle } from 'react-icons/fc'
import CustomCheckbox from '../../common/CustomCheckbox'
import { FaSquareFacebook } from 'react-icons/fa6'
import { BookOpen } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import userService from '@/services/user/user.service'
import { toast } from 'react-toastify'
import { SignUpFormInputs, signUpSchema } from '@/utils/auth'
import useLoading from '@/hooks/useLoading.hook'

const SignUpForm: FC<{ setIsSignUpMode: (value: boolean) => void }> = ({ setIsSignUpMode }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<SignUpFormInputs>({
    resolver: yupResolver(signUpSchema)
  })

  const { loading, startLoading, stopLoading } = useLoading()

  // handle signup
  const onSubmit = async (data: SignUpFormInputs) => {
    try {
      startLoading()
      const response = await userService.signUp(data)
      if (response && response.code === 200) {
        toast.success(response.message)
        setIsSignUpMode(false)
      } else toast.error(response.message)
    } catch (e: any) {
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
            Đăng ký tài khoản mới
          </CardTitle>
          <CardDescription>Nhâp thông tin đăng nhập của bạn để tiếp tục.</CardDescription>
          <CardContent className='mt-5'>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className='login-form flex flex-col gap-3'>
                <CustomInput placeholder='Email' type='email' {...register('email')} />
                {errors.email && <span className='text-red-500 text-xs text-left'>{errors.email.message}</span>}

                <CustomInput placeholder='Username' type='text' {...register('username')} />
                {errors.username && <span className='text-red-500 text-xs text-left'>{errors.username.message}</span>}

                <CustomInput placeholder='Nhập tên của bạn !' type='text' {...register('name')} />
                {errors.name && <span className='text-red-500 text-xs text-left'>{errors.name.message}</span>}

                <CustomInput placeholder='Nhập số điện thoại của bạn !' type='tel' {...register('phone')} />
                {errors.phone && <span className='text-red-500 text-xs text-left'>{errors.phone.message}</span>}

                <CustomInput placeholder='Password' type='password' {...register('password')} />
                {errors.password && <span className='text-red-500 text-xs text-left'>{errors.password.message}</span>}

                <CustomInput placeholder='Xác nhận lại password' type='password' {...register('confirmPassword')} />
                {errors.confirmPassword && (
                  <span className='text-red-500 text-xs text-left'>{errors.confirmPassword.message}</span>
                )}
              </div>
              <div className='remember-me mt-5'>
                <CustomCheckbox
                  id='agree'
                  label='Tôi đồng ý với điều khoản'
                  checked={!!watch('confirmRules')}
                  onChange={(e) => setValue('confirmRules', e.target.checked)}
                  className='text-gray-700'
                />
                {errors.confirmRules && (
                  <span className='text-red-500 text-xs text-left'>{errors.confirmRules.message}</span>
                )}
              </div>
              <div className='signin-button w-full mt-5'>
                <CustomButton
                  isLoader={loading}
                  label='Tạo tài khoản'
                  type='submit'
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
            </form>
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  )
}

export default SignUpForm
