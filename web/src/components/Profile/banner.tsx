import { BookCheck } from 'lucide-react'
import HighGlossBackground from '@/components/common/HighGlossBackground'

const Banner = ({ name, description }: { name: string; description: string }) => {
  return (
    <HighGlossBackground className='px-6 py-8 md:px-10 md:py-12 rounded-xl shadow-2xl shadow-blue-900/10'>
      <div className='flex items-center gap-4 mb-4'>
        <div className='p-2.5 md:p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 flex-shrink-0'>
          <BookCheck className='text-white w-6 h-6 md:w-7 md:h-7' />
        </div>
        <h1 className='text-2xl md:text-3xl font-black text-white tracking-tight leading-tight'>
          {name || 'Hồ sơ cá nhân'}
        </h1>
      </div>
      <p className='text-blue-100/90 text-sm md:text-[15px] font-medium max-w-2xl leading-relaxed'>
        {description || 'Chào mừng bạn đã trở lại, cùng bắt đầu một ngày học tập tuyệt vời nhé! Khám phá kho tàng kiến thức và theo dõi tiến trình của chính mình.'}
      </p>
    </HighGlossBackground>
  )
}

export default Banner
