/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from 'react'
import CustomButton from '../../common/Button'
import CustomInput from '../../common/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FcGoogle } from 'react-icons/fc'
import CustomCheckbox from '../../common/CustomCheckbox'
import { FaSquareFacebook } from 'react-icons/fa6'
import { Send, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import userService from '@/services/user/user.service'
import { toast } from 'sonner'
import { SignUpFormInputs, signUpSchema } from '@/utils/auth'
import useLoading from '@/hooks/useLoading.hook'
import logo from '@/assets/images/logo1.png'

const SignUpForm: FC<{ setIsSignUpMode: (value: boolean) => void; handleLoginWithGoogle: () => void }> = ({
  setIsSignUpMode,
  handleLoginWithGoogle
}) => {
  const navigate = useNavigate()
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
    <div className='w-full bg-white rounded-lg md:mt-0 sm:max-w-md xl:py-0 max-lg:-mt-12'>
      <Card className='shadow-xl py-12 border-none'>
        <CardHeader className='text-center'>
          <CardTitle className='flex items-center justify-center'>
            <button
              type='button'
              onClick={() => navigate('/')}
              className='focus:outline-none'
              aria-label='Về trang chủ'
            >
              <img
                src={logo}
                alt='LEARNOVA logo'
                className='h-12 md:h-14 w-auto object-contain mx-auto select-none hover:opacity-80 transition-opacity'
              />
            </button>
          </CardTitle>
          <CardDescription className='text-[#2DD4BF] text-base font-semibold mt-2'>
            Bắt đầu để khám phá tri thức cùng Learnova
          </CardDescription>
          <CardContent className='mt-5'>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className='login-form flex flex-col gap-3'>
                <CustomInput placeholder='Email' type='email' {...register('email')} />
                {errors.email && <span className='text-red-500 text-xs text-left'>{errors.email.message}</span>}

                <CustomInput placeholder='Tên đăng nhập' type='text' {...register('username')} />
                {errors.username && <span className='text-red-500 text-xs text-left'>{errors.username.message}</span>}

                <CustomInput placeholder='Họ và tên' type='text' {...register('name')} />
                {errors.name && <span className='text-red-500 text-xs text-left'>{errors.name.message}</span>}

                <CustomInput placeholder='Số điện thoại' type='tel' {...register('phone')} />
                {errors.phone && <span className='text-red-500 text-xs text-left'>{errors.phone.message}</span>}

                <CustomInput placeholder='Mật khẩu' type='password' {...register('password')} />
                {errors.password && <span className='text-red-500 text-xs text-left'>{errors.password.message}</span>}

                <CustomInput placeholder='Nhập lại mật khẩu' type='password' {...register('confirmPassword')} />
                {errors.confirmPassword && (
                  <span className='text-red-500 text-xs text-left'>{errors.confirmPassword.message}</span>
                )}
              </div>
              <div className='remember-me mt-5 flex flex-col gap-2'>
                <div className='flex gap-1'>
                  <CustomCheckbox
                    id='agree'
                    label='Tôi đồng ý với'
                    checked={!!watch('confirmRules')}
                    onChange={(e) => setValue('confirmRules', e.target.checked)}
                    className='text-gray-700'
                  />
                  <a
                    href='/term'
                    target='_blank'
                    className='text-blue-500 text-sm underline underline-offset-2 cursor-pointer hover:text-blue-600'
                  >
                    Điều khoản
                  </a>
                </div>
                {errors.confirmRules && (
                  <span className='text-red-500 text-xs text-start'>{errors.confirmRules.message}</span>
                )}
              </div>
              <div className='signin-button w-full mt-5'>
                <CustomButton
                  isLoader={loading}
                  label='Tạo tài khoản'
                  type='submit'
                  className='w-full shadow-lg rounded-md border border-gray-300 bg-blue-500 py-3 text-white hover:bg-blue-600'
                  icon={<Send size={16} />}
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
              <div className='mt-5 flex items-center justify-center gap-3 w-full mb-2'>
                <CustomButton
                  icon={<FcGoogle />}
                  className='bg-inherit w-full border-2 border-solid hover:bg-red-600'
                  onClick={handleLoginWithGoogle}
                />
              </div>
              <CustomButton
                type='button'
                onClick={() => navigate('/')}
                label='Về trang chủ'
                icon={<ArrowLeft size={16} />}
                className='w-full rounded-md shadow-lg border border-gray-300 bg-blue-500 py-3 text-white hover:bg-blue-600'
              />
            </form>
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  )
}

export default SignUpForm
