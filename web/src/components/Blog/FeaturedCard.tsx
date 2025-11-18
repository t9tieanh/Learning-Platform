import { Link } from 'react-router-dom'
import blogBg from '@/assets/images/blog-banner.png'

interface FeaturedCardProps {
  title: string
  description: string
  date: string
}

export const FeaturedCard = ({ title, description, date }: FeaturedCardProps) => {
  return (
    <Link to={`/blog-details/690a0cf610380836bc82f2f2`}>
      <article
        className='relative rounded-3xl overflow-hidden shadow-sm p-8 text-white hover:scale-[1.02] transition-transform'
        style={{
          backgroundImage: `url(${blogBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Overlay mờ để dễ đọc chữ */}
        <div className='absolute inset-0 bg-black/50 z-0' />

        {/* SVG trang trí */}
        <div className='absolute top-4 right-4 opacity-20 z-10'>
          <svg className='w-32 h-32' viewBox='0 0 100 100' fill='none'>
            <circle cx='50' cy='50' r='40' stroke='currentColor' strokeWidth='2' />
            <path
              d='M30 50 L45 65 L70 35'
              stroke='currentColor'
              strokeWidth='3'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </div>

        {/* Nội dung chính */}
        <div className='relative z-10'>
          <div className='inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold mb-4'>
            NỔI BẬT
          </div>

          <h2 className='text-2xl md:text-3xl font-bold mb-4 leading-tight'>{title}</h2>

          <p className='text-white/90 mb-6 leading-relaxed'>{description}</p>
        </div>
      </article>
    </Link>
  )
}
