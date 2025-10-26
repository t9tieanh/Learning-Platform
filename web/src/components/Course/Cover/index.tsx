/* eslint-disable jsx-a11y/media-has-caption */
import { useState } from 'react'
import './style.scss'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Play } from 'lucide-react'
import CustomButton from '@/components/common/Button'

interface CoverProps {
  video: string
  image: string
  title: string
  shortDescription: string
  teacher: {
    name: string
    avatar: string
  }
}

const Cover = ({ video, image, title, shortDescription, teacher }: CoverProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className='cover-container min-h-96 bg-[#0C356A] flex flex-col md:flex-row items-center justify-center mx-auto w-full py-16'>
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
        <img src={image} alt='Video Thumbnail' className='h-64 w-96 object-cover rounded-xl' />
        <div className='absolute inset-0 flex items-center justify-center'>
          <CustomButton
            type='button'
            className='flex items-center gap-2 bg-white text-slate-700 px-4 py-2 rounded-full font-semibold shadow-md hover:bg-white transition transition-transform duration-300 hover:scale-105'
            icon={<Play className='h-5 w-5' />}
          />
        </div>
      </div>

      {isOpen && (
        <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50'>
          <div className='bg-black rounded-xl overflow-hidden max-w-4xl w-full relative'>
            <video src={`http://${video}`} controls autoPlay className='w-full h-[500px] rounded-xl' />
            <CustomButton
              type='button'
              onClick={() => setIsOpen(false)}
              aria-label='Close video'
              className='absolute bg-transparent hover:bg-black/50 top-3 right-3 text-white text-4xl font-bold z-50'
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setIsOpen(false)
              }}
            >
              ×
            </CustomButton>
          </div>
        </div>
      )}

      <div className='title-container text-left text-white'>
        <h1 className='text-2xl md:text-4xl font-bold mb-4 max-w-xl text-justify'>{title}</h1>
        <div className='flex items-center gap-2 mb-4'>
          <Avatar>
            <AvatarImage src={teacher.avatar} />
            <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className='text-lg text-white-200'>{teacher.name}</div>
        </div>
        <p className='text-sm md:text-base max-w-xl text-justify text-gray-200'>{shortDescription}</p>
      </div>
    </div>
  )
}

export default Cover
