import { useState } from 'react'
import CustomButton from '@/components/common/Button'
import CustomInput from '@/components/common/Input'
import { checkoutPaymentDevPassword } from '@/config/payment.config'
import { toast } from 'sonner'
import { LockIcon } from 'lucide-react'

type PaymentDevGateProps = {
  onUnlock: () => void
  /** Vertical stack for narrow panels (e.g. VIP dialog). */
  layout?: 'row' | 'column'
}

const PaymentDevGate = ({ onUnlock, layout = 'row' }: PaymentDevGateProps) => {
  const [password, setPassword] = useState('')

  const handleSubmit = () => {
    if (!checkoutPaymentDevPassword) {
      toast.error('Chưa cấu hình VITE_CHECKOUT_PAYMENT_DEV_PASSWORD trên web.')
      return
    }
    if (password.trim() === checkoutPaymentDevPassword) {
      setPassword('')
      onUnlock()
      toast.success('Đã mở phương thức thanh toán (chế độ dev).')
      return
    }
    toast.error('Mật khẩu không đúng.')
  }

  const isColumn = layout === 'column'

  return (
    <div
      className={
        isColumn ? 'flex flex-col gap-3' : 'flex flex-col gap-3 sm:flex-row sm:items-end'
      }
    >
      <div className='flex-1'>
        <CustomInput
          label='Mật khẩu dev'
          value={password}
          placeholder='Nhập mật khẩu để mở thanh toán'
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
          }}
        />
      </div>
      <CustomButton
        type='button'
        className={
          isColumn
            ? 'w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-700 shadow-sm'
            : 'bg-gray-800 text-white py-2 px-6 rounded-md hover:bg-gray-700 shadow-sm shrink-0'
        }
        label='Gửi'
        onClick={handleSubmit}
        icon={<LockIcon className='w-4 h-4' />}
      />
    </div>
  )
}

export default PaymentDevGate
