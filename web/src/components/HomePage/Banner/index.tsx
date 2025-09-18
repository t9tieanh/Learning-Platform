import './style.scss'
import { Button } from '@/components/ui/button'
import { FaPaperPlane } from 'react-icons/fa'

const Banner = () => {
  return (
    <>
      <div className='banner-container p-32'>
        <h2 className='text-2xl font-bold mt-32'>👋 Chào mừng bạn đến với ALL Study</h2>
        <h1 className='scroll-m-20 text-4xl mt-4 font-extrabold tracking-tight text-start'>
          Nền tảng học tập trực tuyến dành cho thế hệ mới
        </h1>
        <blockquote className='mt-6 border-l-2 pl-6 italic'>
          &quot;Cùng công nghệ, học tập trở nên dễ dàng hơn.&quot;
        </blockquote>
        <Button className='btn-primary mt-6 w-48 bg-blue-600 hover:bg-blue-700'>
          <FaPaperPlane />
          Bắt đầu ngay
        </Button>
      </div>
    </>
  )
}

export { Banner }
