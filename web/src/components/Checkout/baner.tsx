import { CreditCard } from 'lucide-react'
import HighGlossBackground from '@/components/common/HighGlossBackground'

const Banner = () => {
  return (
    <HighGlossBackground className='px-4 sm:px-8 lg:px-10 py-8 sm:py-12 rounded-t-[32px] shadow-2xl shadow-blue-900/10'>
      <div className='flex items-center gap-3 sm:gap-4 mb-4'>
        <div className='p-2.5 sm:p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shrink-0'>
          <CreditCard className='text-white w-6 h-6 sm:w-7 sm:h-7' />
        </div>
        <h1 className='text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight'>
          Thanh toán đơn hàng.
        </h1>
      </div>
      <p className='text-blue-100/90 text-sm sm:text-[15px] font-medium max-w-2xl leading-relaxed'>
        Chốt đơn ngay hôm nay để nhận mức giá ưu đãi cực khủng - cơ hội chỉ đến một lần! Đừng bỏ lỡ kiến thức quý giá đang chờ đón bạn.
      </p>
    </HighGlossBackground>
  )
}

export default Banner
