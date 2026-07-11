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
import { cn } from '@/lib/utils'

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
  const [isExpanded, setIsExpanded] = useState(false)

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
      <div
        className={cn(
          'fixed shadow-lg left-0 right-0 z-40 bg-gradient-to-r from-blue-600 to-blue-700 backdrop-blur-sm transition-all duration-500 transform',
          showSmallHeader ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        )}
        style={{ top: 'var(--main-header-height, 100px)' }}
      >
        <div className='max-w-6xl mx-auto px-3 md:px-6 py-2 md:py-3 flex items-center justify-between min-h-[48px] md:min-h-[56px]'>
          <div className='flex items-center gap-2 text-white font-bold w-full overflow-hidden'>
            <div className='flex flex-row items-center gap-2 rounded-xl md:rounded-2xl bg-white text-black py-1.5 px-3 md:px-4 shadow-xl min-w-0'>
              <span className='text-xs md:text-sm truncate'>{title}</span>
              <span className='flex items-center gap-1 flex-shrink-0'>
                <Avatar className='w-5 h-5 md:w-6 md:h-6 flex-shrink-0'>
                  <AvatarImage src={teacher.avatar || AvatarNotFound} />
                  <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className='hidden md:inline text-xs md:text-sm whitespace-nowrap'>{teacher.name}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className='relative group cover-container min-h-96 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-950 flex flex-col md:flex-row items-center justify-center mx-auto w-full py-8 md:py-16 px-4 md:px-0 overflow-hidden'>
        <div className='absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_-20%,#ffffff,transparent)]' />
        <div className='absolute inset-0 opacity-10 bg-[url("https://www.transparenttextures.com/patterns/cubes.png")]' />
        <div className='absolute bottom-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full -mr-32 -mb-32 blur-3xl' />
        <div
          className='absolute left-4 z-20 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-200'
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
          className='video-introduction relative p-0 md:p-10 mb-6 md:mb-0 cursor-pointer w-full md:w-auto'
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
            <img
              src={image}
              alt='Video Thumbnail'
              className='h-auto md:h-[320px] w-full md:w-[580px] object-cover rounded-lg md:rounded-2xl shadow-xl'
            />
          ) : video && showVideo ? (
            <video
              src={`${video}`}
              controls
              autoPlay
              muted
              className='h-auto md:h-[340px] w-full md:w-[600px] object-cover rounded-lg md:rounded-2xl shadow-xl'
              poster={image}
            />
          ) : (
            <img
              src={image}
              alt='Video Thumbnail'
              className='h-auto md:h-[340px] w-full md:w-[600px] object-cover rounded-lg md:rounded-2xl shadow-xl'
            />
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

        <div className='title-container text-left text-white w-full md:w-auto relative z-10'>
          <h1 data-testid='course-detail-title' className='text-xl md:text-4xl font-bold mb-4 max-w-xl text-justify'>
            Khóa học {title}
          </h1>
          <div className='flex items-center gap-2 mb-4'>
            <Avatar>
              <AvatarImage src={teacher.avatar} />
              <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className='text-base md:text-lg text-white-200'>{teacher.name}</div>
          </div>
          <div className='description-wrapper max-w-xl'>
            <p className={cn('text-sm md:text-base text-justify text-gray-200 transition-all duration-300', !isExpanded && 'line-clamp-3')}>
              {shortDescription}
            </p>
            {shortDescription && shortDescription.length > 150 && (
              <button
                type='button'
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsExpanded(!isExpanded)
                }}
                className='text-blue-400 hover:text-blue-300 text-xs md:text-sm font-semibold mt-1 transition-colors cursor-pointer relative z-20'
              >
                {isExpanded ? 'Thu gọn' : 'Xem thêm'}
              </button>
            )}
          </div>
          <div className='flex flex-wrap gap-2 mt-4 w-full max-w-[640px] break-words'>
            {tags?.slice(0, 8).map((tag) => (
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
