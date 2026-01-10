import CustomDialog from '@/components/common/Dialog'
import { Play, BookOpenCheck } from 'lucide-react'

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
      <div className='preview-content p-3 flex flex-col gap-4'>
        <span className='text-white text-base font-medium font-sans'>
          <BookOpenCheck className='inline w-5 h-5 mr-2' />
          Tiêu đề: {preview.previewTitle}
        </span>
        <hr />
        <span className='text-white text-sm font-medium text-base text-[#66D2CE]'>
          *Đây là bản xem trước công khai của bài học
          <p className='text-white mt-1 font-normal'>
            {preview.subTitle ||
              `Hãy mua khóa học ngay hôm nay để mở khóa toàn bộ các bài giảng và tận hưởng trọn vẹn hành trình học tập nhé!
            🚀`}
          </p>
        </span>
        {preview.previewUrl ? (
          <div className='w-full'>
            <video
              src={`https://${preview.previewUrl}` || undefined}
              controls
              autoPlay
              className='w-full h-[480px] rounded-md bg-black'
            >
              <track kind='captions' srcLang='en' label='English captions' src={`${preview.previewUrl || ''}.vtt`} />
            </video>
          </div>
        ) : (
          <div className='text-sm text-muted-foreground'>Không có video để xem trước</div>
        )}
      </div>
    </CustomDialog>
  )
}

export default PreviewPublicLesson
