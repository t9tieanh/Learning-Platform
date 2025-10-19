import { useLocation, useNavigate } from 'react-router-dom'
import { useMemo, useEffect } from 'react'
import userService from '@/services/user/user.service'
import { toast } from 'sonner'
import useLoading from '@/hooks/useLoading.hook'
import CustomSpinner from '@/components/common/CustomSpinner'

const UserPage = () => {
  const location = useLocation()
  const navigator = useNavigate()
  const { loading, startLoading, stopLoading } = useLoading()

  const token = useMemo(() => {
    const query = new URLSearchParams(location.search)
    return query.get('token')
  }, [location.search])
  // ...existing code...

  // useEffect
  useEffect(() => {
    const handleVerifyRegister = async () => {
      if (!token) return
      try {
        startLoading()
        const response = await userService.verifySignUp(token)

        if (response && response.message && response.code === 200) toast.success(response.message, { autoClose: 2000 })
        else throw new Error(response.message || 'Verification failed')
      } catch (e: any) {
        toast.error(e.message || 'Đã có lỗi trong quá trình xử lý !')
      } finally {
        stopLoading()
        navigator('/auth')
      }
    }

    handleVerifyRegister()
  }, [])

  return <div className='user-page items-center justify-center min-h-screen'>{loading && <CustomSpinner />}</div>
}

export default UserPage
