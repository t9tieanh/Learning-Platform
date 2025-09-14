import { useState } from 'react'
import CustomInput from '@/components/common/Input'
import CustomButton from '@/components/common/Button'
import { Send, LogIn } from 'lucide-react'

const ForgotPassForm = () => {
  const [email, setEmail] = useState('')

  return (
    <>
      <form className='flex flex-col gap-3 mt-2'>
        <CustomInput
          id='email'
          type='email'
          placeholder='learningplatform@hcmute.com'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='mb-2 border-primary focus:border-primary'
        />
        <CustomButton
          className='hover:bg-blue-600 shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 text-white font-semibold py-2 rounded-lg'
          label='Nhận liên kết đặt lại'
          onClick={() => {}}
          icon={<Send />}
        />
        <CustomButton
          className='hover:bg-blue-100 text-black bg-white shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 font-semibold py-2 rounded-lg'
          label='Đăng nhập'
          onClick={() => {}}
          icon={<LogIn />}
        />
      </form>
    </>
  )
}

export default ForgotPassForm
