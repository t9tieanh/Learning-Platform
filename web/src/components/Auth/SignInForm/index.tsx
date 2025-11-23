/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { FC } from 'react'
import CustomButton from '../../common/Button'
import CustomInput from '../../common/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FcGoogle } from 'react-icons/fc'
import CustomCheckbox from '../../common/CustomCheckbox'
import { FaSquareFacebook } from 'react-icons/fa6'
import { SignInFormInputs, signInSchema } from '@/utils/auth'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import userService from '@/services/user/user.service'
import aiChatService from '@/services/aiChat.service'
import { toast } from 'sonner'
import useLoading from '@/hooks/useLoading.hook'
import { useAuthStore } from '@/stores/useAuth.stores'
import { useNavigate } from 'react-router-dom'
import logo from '@/assets/images/logo1.png'

const SignInForm: FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignInFormInputs>({
    resolver: yupResolver(signInSchema)
  })
  const navigate = useNavigate()

  // Get state and actions
  const { data, setData, setConversationId } = useAuthStore()

  const { loading, startLoading, stopLoading } = useLoading()

  // handle signin
  const onSubmit = async (data: SignInFormInputs) => {
    try {
      startLoading()
      const response = await userService.login(data.username, data.password)
      if (response && response.result && response.code === 200) {
        const r: any = response.result
        const userId = r.userId || r.id || r._id || ''
        setData({
          accessToken: r.accessToken,
          refreshToken: r.refreshToken,
          userId,
          name: r.name || r.userName || r.username,
          username: r.username || r.userName,
          email: r.email,
          avatarUrl: r.avatarUrl
        })
        console.log('USERID', userId)
        // create/fetch AI conversation
        if (userId) {
          console.log('Co vo')
          try {
            const convRes = await aiChatService.createConversation(userId)
            if (convRes?.conversationId) setConversationId(convRes.conversationId)
          } catch (e) {
            console.warn('Cannot init AI conversation', e)
          }
        }
        toast.success('Đăng nhập thành công!')
        if (response.result.role === 'admin') {
          console.log('ADMIN')
          navigate('/admin')
        } else {
          navigate('/')
        }
      } else toast.error(response.message)
    } catch (error: any) {
      toast.error('Đã có lỗi trong quá trình xử lý !')
    } finally {
      stopLoading()

      // Fetch conversation
    }
  }

  //handle login with google
  const handleLoginWithGoogle = () => {
    try {
      const authUri = import.meta.env.VITE_GOOGLE_AUTH_URI as string
      const callbackUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI as string
      const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string

      const targetUrl = `${authUri}?redirect_uri=${encodeURIComponent(
        callbackUri
      )}&response_type=code&client_id=${googleClientId}&scope=openid%20email%20profile`

      window.location.href = targetUrl
    } catch (error: any) {
      console.log(error)
      toast.error('Đã có lỗi trong quá trình xử lý !')
    }
  }

  return (
    <div className='w-full bg-white rounded-lg md:mt-0 sm:max-w-md xl:py-0'>
      <Card className='shadow-xl py-12 border-none'>
        <CardHeader className='text-center'>
          <CardTitle className='flex items-center justify-center'>
            <img src={logo} alt='LEARNOVA logo' className='h-12 md:h-14 w-auto object-contain mx-auto select-none' />
          </CardTitle>
          <CardDescription className='text-[#2DD4BF] text-base font-semibold mt-2'>
            Đăng nhập để khám phá tri thức cùng Learnova.
          </CardDescription>
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
                <p
                  className='text-gray-700 text-sm font-bold'
                  onClick={() => {
                    navigate('/forgot')
                  }}
                >
                  Quên mật khẩu ?
                </p>
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
              <CustomButton
                onClick={handleLoginWithGoogle}
                icon={<FcGoogle />}
                className='bg-inherit w-1/2 hover:bg-blue-200'
              />
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
      <p className='text-xs text-center mt-2 text-muted-foreground'>Copyright © 2025 Learnova. All rights reserved.</p>
    </div>
  )
}

export default SignInForm
