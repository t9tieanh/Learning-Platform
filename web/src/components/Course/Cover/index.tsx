import { useState } from 'react'
import './style.scss'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import CustomButton from '@/components/common/Button'

interface CoverProps {
  video: string
  title: string
  shortDescription: string
  teacher: {
    name: string
    avatar: string
  }
}

const Cover = ({ video, title, shortDescription, teacher }: CoverProps) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className='cover-container min-h-96 bg-black flex flex-col md:flex-row items-center justify-center mx-auto w-full px-4 py-8'>
      <div
        className='video-introduction relative p-0 md:p-10 mb-6 md:mb-0 cursor-pointer'
        role='button'
        tabIndex={0}
        onClick={() => setIsOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsOpen(true)
          }
        }}
      >
        <img
          src={`https://img.youtube.com/vi/Lj-QNEo07yg/hqdefault.jpg`}
          alt='Video Thumbnail'
          className='h-64 w-96 object-cover rounded-xl'
        />
        <div className='absolute inset-0 flex items-center justify-center'>
          <button type='button' className='bg-white/80 text-black px-4 py-2 rounded-full font-semibold'>
            ▶ Play
          </button>
        </div>
      </div>

      {isOpen && (
        <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50'>
          <div className='bg-black rounded-xl overflow-hidden max-w-4xl w-full'>
            <button
              onClick={() => setIsOpen(false)}
              className='absolute top-3 right-3 text-white text-2xl font-bold hover:text-red-500'
            >
              ×
            </button>
            <iframe
              src='https://www.youtube.com/embed/Lj-QNEo07yg?autoplay=1'
              title='Video Player'
              className='w-full h-[500px]'
              allow='autoplay; encrypted-media'
              allowFullScreen
            />
          </div>
        </div>
      )}

      <div className='title-container text-left text-white'>
        <div className='flex items-center gap-2 mb-4'>
          <Avatar>
            <AvatarImage src={teacher.avatar} />
            <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className='text-md'>{teacher.name}</div>
        </div>
        <h1 className='text-2xl md:text-4xl font-bold mb-4 max-w-xl'>{title}</h1>
        <p className='text-sm md:text-base max-w-xl'>{shortDescription}</p>
      </div>
    </div>
  )
}

export default Cover
