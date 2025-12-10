/* eslint-disable jsx-a11y/media-has-caption */
import { useEffect, useState } from 'react'
import './style.scss'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Play, BookOpenCheck, ArrowLeft } from 'lucide-react'
import CustomButton from '@/components/common/Button'
import { Badge } from '@/components/ui/badge'
import PreviewPublicLesson from '../CourseContent/detail/Sections/previewPublicLesson'
import AvatarNotFound from '@/assets/images/avatar-not-found.png'
import { useNavigate } from 'react-router-dom'

interface CoverProps {
  showSmallHeader: boolean
  video: string
  image: string
  title: string
  shortDescription: string
  teacher: {
    name: string
    avatar: string
  }
  tags?: { id: string; name: string; imageUrl: string }[]
}

const Cover = ({ video, image, title, shortDescription, teacher, tags, showSmallHeader }: CoverProps) => {
  const navigate = useNavigate()
  const [preview, setPreview] = useState<{
    openPreview: boolean
    previewUrl: string | null
    previewTitle: string
    subTitle: string
  }>({
    openPreview: false,
    previewUrl: video,
    previewTitle: title,
    subTitle: `🚀${shortDescription}`
  })

  // State to control showing image or video
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    setPreview((prev) => ({
      ...prev,
      previewUrl: video,
      previewTitle: title,
      subTitle: `🚀${shortDescription}`
    }))
    // Reset showVideo when video changes
    setShowVideo(false)
    let timer: NodeJS.Timeout | undefined
    if (video) {
      timer = setTimeout(() => setShowVideo(true), 2000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [video, title, shortDescription])

  return (
    <>
      {showSmallHeader && (
        <div
          className='fixed shadow-lg left-0 right-0 z-40 bg-[#0C356A] backdrop-blur-sm'
          style={{ top: 'var(--main-header-height, 100px)' }}
        >
          <div className='max-w-6xl mx-auto px-6 py-3 flex items-center justify-between min-h-[56px]'>
            <div className='text-sm flex flex-col items-center text-white font-bold text-md text-ellipsis overflow-hidden whitespace-nowrap max-w-[60%]'>
              <div className='flex justify-end items-center gap-2 rounded-2xl bg-white text-black py-1 px-4 shadow-xl'>
                {title}
                <span className='flex items-center gap-1 bg-white px-2 py-1 text-black'>
                  <Avatar className='w-6 h-6'>
                    <AvatarImage src={teacher.avatar || AvatarNotFound} />
                    <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {teacher.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className='relative group cover-container min-h-96 bg-[#0C356A] flex flex-col md:flex-row items-center justify-center mx-auto w-full py-16'>
        <div
          className='absolute left-4 z-50 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-200'
          style={{ top: showSmallHeader ? 'calc(var(--main-header-height, 100px) + 1rem)' : '1rem' }}
        >
          <CustomButton
            type='button'
            onClick={() => navigate(-1)}
            className='flex items-center gap-2 bg-white text-slate-700 px-4 py-2 rounded-full font-semibold shadow-md hover:bg-white/90'
            icon={<ArrowLeft className='h-5 w-5' />}
            label='Quay lại'
          />
        </div>

        <div
          className='video-introduction relative p-0 md:p-10 mb-6 md:mb-0 cursor-pointer'
          role='button'
          tabIndex={0}
          onClick={() => setPreview((prev) => ({ ...prev, openPreview: true }))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setPreview((prev) => ({
                ...prev,
                openPreview: true
              }))
            }
          }}
        >
          {video && !showVideo ? (
            <img src={image} alt='Video Thumbnail' className='h-[320px] w-[580px] object-cover rounded-2xl shadow-xl' />
          ) : video && showVideo ? (
            <video
              src={`http://${video}`}
              controls
              autoPlay
              muted
              className='h-[340px] w-[600px] object-cover rounded-2xl shadow-xl'
              poster={image}
            />
          ) : (
            <img src={image} alt='Video Thumbnail' className='h-[340px] w-[600px] object-cover rounded-2xl shadow-xl' />
          )}
          <div className='absolute inset-0 flex items-center justify-center'>
            {!showVideo && (
              <CustomButton
                type='button'
                className='flex items-center gap-2 bg-white text-slate-700 px-4 py-2 rounded-full font-semibold shadow-md hover:bg-white transition transition-transform duration-300 hover:scale-105'
                icon={<Play className='h-5 w-5' />}
              />
            )}
          </div>
        </div>

        <PreviewPublicLesson preview={preview} setPreview={setPreview} />

        <div className='title-container text-left text-white'>
          <h1 className='text-2xl md:text-4xl font-bold mb-4 max-w-xl text-justify'>Khóa học {title}</h1>
          <div className='flex items-center gap-2 mb-4'>
            <Avatar>
              <AvatarImage src={teacher.avatar} />
              <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className='text-lg text-white-200'>{teacher.name}</div>
          </div>
          <p className='text-sm md:text-base max-w-xl text-justify text-gray-200'>{shortDescription}</p>
          <div className='flex flex-wrap gap-2 mt-2 w-full max-w-[640px] break-words'>
            {tags?.map((tag) => (
              <Badge
                key={tag.id}
                variant='outline'
                className='text-xs px-3 border-none text-black bg-white flex items-center'
              >
                <Avatar>
                  <AvatarImage src={tag.imageUrl} />
                  <AvatarFallback>{tag.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Cover
