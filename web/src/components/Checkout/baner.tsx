import { CreditCard } from 'lucide-react'
import HighGlossBackground from '@/components/common/HighGlossBackground'

const Banner = () => {
  return (
    <HighGlossBackground className='px-10 py-12 rounded-t-[32px] shadow-2xl shadow-blue-900/10'>
      <div className='flex items-center gap-4 mb-4'>
        <div className='p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30'>
          <CreditCard className='text-white w-7 h-7' />
        </div>
        <h1 className='text-3xl font-black text-white tracking-tight'>
          Thanh toán đơn hàng.
        </h1>
      </div>
      <p className='text-blue-100/90 text-[15px] font-medium max-w-2xl leading-relaxed'>
        Chốt đơn ngay hôm nay để nhận mức giá ưu đãi cực khủng - cơ hội chỉ đến một lần! Đừng bỏ lỡ kiến thức quý giá đang chờ đón bạn.
      </p>
    </HighGlossBackground>
  )
}

export default Banner
