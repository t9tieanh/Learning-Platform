import React, { useEffect } from 'react'
import SignInForm from '@/components/Auth/SignInForm'
import SignUpForm from '@/components/Auth/SignUpForm'
import { useSearchParams, useNavigate } from 'react-router-dom'
import useLoading from '@/hooks/useLoading.hook'
import userService from '@/services/user/user.service'
import aiChatService from '@/services/aiChat.service'
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
  const { data, setData, setConversationId } = useAuthStore()

  // Redirect away from Auth if already logged in (run once)
  useEffect(() => {
    const current = useAuthStore.getState().data
    if (current) {
      const role = current?.role
      const path = role === 'admin' ? '/admin' : '/'
      navigator(path, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const exchangeTokenForOauth2 = async (authorizationCode: string) => {
    try {
      startLoading()
      const response = await userService.loginWithGoogle(authorizationCode)

      if (response && response.result && response.code === 200) {
        const r: any = response.result
        const userId = r.userId || r.id || r._id || ''
        // normalize & persist auth data
        setData({
          accessToken: r.accessToken,
          refreshToken: r.refreshToken,
          userId,
          name: r.name || r.userName || r.username,
          username: r.username || r.userName,
          email: r.email,
          avatarUrl: r.avatarUrl,
          role: r.role
        } as any)
        // init/create AI conversation
        if (userId) {
          try {
            const convRes = await aiChatService.createConversation(userId)
            if (convRes?.conversationId) setConversationId(convRes.conversationId)
          } catch (e) {
            console.warn('Cannot init AI conversation (Google OAuth)', e)
          }
        }
        toast.success('Đăng nhập thành công!')
        const role = r.role
        const path = role === 'admin' ? '/admin' : '/'
        navigator(path)
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
    'absolute grid grid-cols-1 z-[5] left-1/2 w-full lg:w-1/2 top-[95%] lg:top-1/2 -translate-x-1/2 -translate-y-full lg:-translate-y-1/2 transition-[1s] duration-\\[1.6s\\] lg:duration-\\[1.4s\\] ease-\\[ease-in-out\\] max-lg:static max-lg:flex max-lg:items-center max-lg:justify-center max-lg:h-full max-lg:translate-x-0 max-lg:translate-y-0 max-lg:w-full'

  const containerMode = isSignUpMode
    ? 'lg:left-1/4 max-lg:top-[-10%] max-lg:-translate-x-2/4 max-lg:translate-y-0'
    : 'lg:left-3/4'

  const formBase = 'absolute inset-0 flex items-center justify-center transition-all duration-\\[6000ms\\] ease-in-out max-lg:static max-lg:w-full max-lg:h-auto'
  const signInMode = isSignUpMode ? 'opacity-0 -translate-x-20 pointer-events-none' : 'opacity-100 translate-x-0'
  const signUpMode = isSignUpMode ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20 pointer-events-none'

  return (
    <div className={`${containerBase} ${containerMode}`}>
      {/* Desktop with animation, Mobile with conditional rendering */}
      <div style={{ transition: 'all 1500ms ease-in-out' }} className={`${formBase} ${signInMode} hidden lg:flex`}>
        <SignInForm handleLoginWithGoogle={handleLoginWithGoogle} setIsSignUpMode={setIsSignUpMode} />
      </div>
      <div style={{ transition: 'all 1500ms ease-in-out' }} className={`${formBase} ${signUpMode} hidden lg:flex`}>
        <SignUpForm setIsSignUpMode={setIsSignUpMode} handleLoginWithGoogle={handleLoginWithGoogle} />
      </div>

      {/* Mobile version - conditional rendering */}
      <div className='w-full lg:hidden'>
        {!isSignUpMode && (
          <SignInForm handleLoginWithGoogle={handleLoginWithGoogle} setIsSignUpMode={setIsSignUpMode} />
        )}
        {isSignUpMode && (
          <SignUpForm setIsSignUpMode={setIsSignUpMode} handleLoginWithGoogle={handleLoginWithGoogle} />
        )}
      </div>
    </div>
  )
}

export default AuthPage
