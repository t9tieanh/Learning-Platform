import React, { useEffect } from 'react'
import SignInForm from '@/components/Auth/SignInForm'
import SignUpForm from '@/components/Auth/SignUpForm'
import { useSearchParams, useNavigate } from 'react-router-dom'
import useLoading from '@/hooks/useLoading.hook'
import userService from '@/services/user/user.service'
import { useAuthStore } from '@/stores/useAuth.stores'
import { toast } from 'sonner'

interface SlidingLoginSignupProps {
  isSignUpMode: boolean
  setIsSignUpMode: (value: boolean) => void
}

const AuthPage: React.FC<SlidingLoginSignupProps> = ({ isSignUpMode, setIsSignUpMode }) => {
  // handle redirect oauth2 google
  const { loading, startLoading, stopLoading } = useLoading()
  const navigator = useNavigate()

  const [searchParams] = useSearchParams()
  const code = searchParams.get('code')

  // Get state and actions
  const { data, setData } = useAuthStore()

  useEffect(() => {
    if (data) {
      const role = (data as any)?.role
      if (role === 'admin') {
        navigator('/admin', { replace: true })
      } else {
        navigator('/', { replace: true })
      }
    }
  }, [data, navigator])

  const exchangeTokenForOauth2 = async (authorizationCode: string) => {
    try {
      startLoading()
      const response = await userService.loginWithGoogle(authorizationCode)

      if (response && response.result && response.code === 200) {
        // save to localstorage
        setData(response.result as any)
        toast.success('Đăng nhập thành công!')
        navigator('/')
      } else {
        toast.error(response.message)
      }
    } catch (error: any) {
      toast.error('Đã có lỗi trong quá trình xử lý !')
    } finally {
      stopLoading()
    }
  }

  // check if already logged in
  useEffect(() => {
    if (code) {
      exchangeTokenForOauth2(code)
    }
  }, [code])

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

  //Đã escape các class gây warning
  const containerBase =
    'absolute grid grid-cols-1 z-[5] left-1/2 w-full lg:w-1/2 top-[95%] lg:top-1/2 -translate-x-1/2 -translate-y-full lg:-translate-y-1/2 transition-[1s] duration-\\[1.6s\\] lg:duration-\\[1.4s\\] ease-\\[ease-in-out\\] max-lg:static max-lg:flex max-lg:items-center max-lg:justify-center max-lg:h-full max-lg:translate-x-0 max-lg:translate-y-0'

  const containerMode = isSignUpMode
    ? 'lg:left-1/4 max-lg:top-[-10%] max-lg:-translate-x-2/4 max-lg:translate-y-0'
    : 'lg:left-3/4'

  const formBase = 'absolute inset-0 flex items-center justify-center transition-all duration-\\[6000ms\\] ease-in-out'
  const signInMode = isSignUpMode ? 'opacity-0 -translate-x-20 pointer-events-none' : 'opacity-100 translate-x-0'
  const signUpMode = isSignUpMode ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20 pointer-events-none'

  return (
    <div className={`${containerBase} ${containerMode}`}>
      <div style={{ transition: 'all 1500ms ease-in-out' }} className={`${formBase} ${signInMode}`}>
        <SignInForm handleLoginWithGoogle={handleLoginWithGoogle} />
      </div>
      <div style={{ transition: 'all 1500ms ease-in-out' }} className={`${formBase} ${signUpMode}`}>
        <SignUpForm setIsSignUpMode={setIsSignUpMode} handleLoginWithGoogle={handleLoginWithGoogle} />
      </div>
    </div>
  )
}

export default AuthPage
