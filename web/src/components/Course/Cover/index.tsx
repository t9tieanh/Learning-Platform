import './style.scss'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

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
  return (
    <div className='cover-container min-h-96 bg-slate-800 flex flex-col md:flex-row items-center justify-center mx-auto w-full px-4 py-8'>
      <div className='video-introduction p-0 md:p-10 mb-6 md:mb-0'>
        <img src={video} alt='Course Cover' className='h-48 md:h-full object-cover image-cover rounded-xl' />
      </div>
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