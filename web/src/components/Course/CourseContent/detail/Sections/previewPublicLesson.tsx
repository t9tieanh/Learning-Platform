import CustomDialog from '@/components/common/Dialog'
import { Play, BookOpenCheck } from 'lucide-react'
import { useState } from 'react'
import logo from '@/assets/images/logo1.png'
import { LoadingDots } from '@/components/common/Loading/LoadingDots'

const PreviewPublicLesson = ({
  preview,
  setPreview
}: {
  preview: {
    openPreview: boolean
    previewUrl: string | null
    previewTitle: string
    subTitle?: string
  }
  setPreview: any
}) => {
  const [isVideoLoading, setIsVideoLoading] = useState(true)
  return (
    <CustomDialog
      className='bg-[#0C356A] border-none text-white'
      open={preview.openPreview}
      setOpen={(v: boolean) => {
        setPreview((prev: any) => ({
          ...prev,
          openPreview: v
        }))
      }}
      title={
        <>
          <Play className='w-4 h-4 mr-1' />
          Xem trước video
        </>
      }
      size='full'
    >
      <div className='preview-content p-3 md:p-6 flex flex-col gap-4 max-h-[85vh] overflow-y-auto'>
        <span className='text-white text-sm md:text-base font-medium font-sans'>
          <BookOpenCheck className='inline w-4 md:w-5 h-4 md:h-5 mr-2' />
          Tiêu đề: {preview.previewTitle}
        </span>
        <hr />
        <span className='text-white text-xs md:text-sm font-medium text-[#66D2CE]'>
          *Đây là bản xem trước công khai của bài học
          <p className='text-white mt-1 font-normal text-xs md:text-sm line-clamp-1 md:line-clamp-none'>
            {preview.subTitle ||
              `Hãy mua khóa học ngay hôm nay để mở khóa toàn bộ các bài giảng và tận hưởng trọn vẹn hành trình học tập nhé!
            🚀`}
          </p>
        </span>
        {preview.previewUrl ? (
          <div className='w-full relative'>
            <video
              src={`${preview.previewUrl}` || undefined}
              controls
              autoPlay
              className='w-full h-[250px] md:h-[480px] rounded-md bg-black'
              onLoadStart={() => setIsVideoLoading(true)}
              onCanPlay={() => setIsVideoLoading(false)}
              onLoadedData={() => setIsVideoLoading(false)}
            >
              <track kind='captions' srcLang='en' label='English captions' src={`${preview.previewUrl || ''}.vtt`} />
            </video>
            {isVideoLoading && (
              <div className='absolute inset-0 flex items-center justify-center bg-black/40 rounded-md'>
                <div className='flex flex-col items-center gap-3'>
                  <div className='relative w-12 h-12'>
                    <img src={logo} alt='Loading' className='w-full h-full object-contain animate-bounce' />
                  </div>
                  <LoadingDots text='Chờ Learnova một tí nhé !' className='text-white text-xs md:text-sm font-medium' />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className='text-xs md:text-sm text-muted-foreground'>Không có video để xem trước</div>
        )}
      </div>
    </CustomDialog>
  )
}

export default PreviewPublicLesson
