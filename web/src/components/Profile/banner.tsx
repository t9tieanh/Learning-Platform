import { BookCheck } from 'lucide-react'

const Banner = ({ name, description }: { name: string; description: string }) => {
  return (
    <div className='cart-banner px-4 py-6 rounded-xl bg-[#0C356A]'>
      <p className='text-3xl font-bold flex text-blue-500 items-center'>
        <BookCheck className='cart-icon text-blue-400 w-8 h-8' />
        &nbsp;{name || 'Hồ sơ cá nhân'}
      </p>
      <p className='text-base flex items-center text-white mt-2'>
        &nbsp;{description || 'Chào mừng bạn đã trở lại, cùng bắt đầu một ngày học tập tuyệt vời nhé!'}
      </p>
    </div>
  )
}

export default Banner
