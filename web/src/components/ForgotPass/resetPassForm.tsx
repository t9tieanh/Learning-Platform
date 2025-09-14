import CustomInput from '@/components/common/Input'
import CustomButton from '@/components/common/Button'
import { Send } from 'lucide-react';

const ResetPassForm = () => {
  return (
    <>
      <form>
        <CustomInput
          id='password'
          type='password'
          placeholder='Nhập mật khẩu mới'
          className='mb-2 border-primary focus:border-primary shadow-lg'
        />
        <CustomInput
          id='confirm-password'
          type='password'
          placeholder='Xác nhận mật khẩu mới'
          className='mb-2 border-primary focus:border-primary shadow-lg'
        />
        <CustomButton
          className='hover:bg-blue-600 shadow-lg mt-3 transition-transform duration-300 ease-in-out hover:scale-105 text-white font-semibold py-2 rounded-lg'
          label='Đặt lại mật khẩu'
          onClick={() => {}}
          icon={<Send />}
        />
      </form>
    </>
  )
}

export default ResetPassForm
