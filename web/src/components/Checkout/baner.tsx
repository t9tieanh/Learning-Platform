import { CreditCard } from 'lucide-react'

const Banner = () => {
  return (
    <div className='cart-banner px-4 py-6 rounded-xl bg-[#0C356A]'>
      <p className='text-3xl font-bold flex text-blue-500 items-center'>
        <CreditCard className='cart-icon text-blue-400 w-8 h-8' />
        &nbsp;Thanh toán đơn hàng.
      </p>
      <p className='text-base flex items-center text-white mt-2'>
        &nbsp;Chốt đơn ngay hôm nay để nhận mức giá ưu đãi cực khủng - cơ hội chỉ đến một lần!
      </p>
    </div>
  )
}

export default Banner
