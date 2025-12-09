/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable prettier/prettier */
import CustomInput from '@/components/common/Input'
import { Label } from '@/components/ui/label'
import CustomButton from '@/components/common/Button'
import { Upload, Video as VideoIcon, MousePointer2 } from 'lucide-react'
import QuillEditor from '@/components/common/Input/QuillEditor'
import CustomCheckbox from '@/components/common/CustomCheckbox'
import { useEffect, useRef, useState } from 'react'
import { MdCancel } from 'react-icons/md'
import { CreationLessonFormValues, CreationLessonSchema } from '@/utils/create-course/curriculum'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { HandleAddLesson } from '@/components/TC_CreateCourse/CurriculumForm/index'

const AddVideoForm = ({
  chapterId,
  handleAddLesson,
  setOpen
}: {
  chapterId: string
  handleAddLesson: HandleAddLesson
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CreationLessonFormValues>({
    resolver: yupResolver(CreationLessonSchema) as any
  })

  const handleSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log('Selected file:', file)
      const url = URL.createObjectURL(file)
      setVideoSrc(url)
      setSelectedFile(file)
    }
  }

  // when video metadata is loaded, capture duration and set into form
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    const seconds = Math.floor(videoRef.current.duration || 0)
    // set duration into react-hook-form
    setValue('duration', seconds)
  }

  const handleCancel = () => {
    if (videoSrc) URL.revokeObjectURL(videoSrc)
    setVideoSrc(null)
    setSelectedFile(null)
    const inp = document.getElementById('video-file') as HTMLInputElement | null
    if (inp) inp.value = ''
  }

  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return '0:00'
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  // play when a new source is set
  useEffect(() => {
    if (videoSrc && videoRef.current) {
      // autoplay - play() returns a promise; ignore errors
      const p = videoRef.current.play()
      if (p && typeof p.catch === 'function') p.catch(() => {})
    }

    // cleanup object URL when component unmounts or src changes
    return () => {
      if (videoSrc) {
        URL.revokeObjectURL(videoSrc)
      }
    }
  }, [videoSrc])

  return (
    <div className='add-video-form'>
      <form
        className='flex flex-col gap-5'
        onSubmit={handleSubmit(handleAddLesson(selectedFile as File, chapterId, setOpen, 'learning/lessons/video'))}
      >
        <div className='file-upload flex flex-col justify-center items-center gap-3 p-4 border-2 border-blue-600 h-full min-h-[280px] rounded-2xl bg-white'>
          {videoSrc ? (
            /* eslint-disable-next-line jsx-a11y/media-has-caption */
            <div className='w-full flex justify-center items-center'>
              <video
                ref={videoRef}
                src={videoSrc}
                controls
                onLoadedMetadata={handleLoadedMetadata}
                className='w-full max-h-[240px] object-contain rounded-lg bg-black mb-2'
                style={{ minHeight: 300 }}
              />
            </div>
          ) : (
            <>
              <div className='mx-auto p-3 border-2 border-blue-600 rounded-full'>
                <VideoIcon className='h-10 w-10 text-blue-600' />
              </div>
              <Label htmlFor='video-file' className='font-medium'>
                Chọn video để upload
              </Label>
              <p className='text-xs text-gray-500'>Định dạng được hỗ trợ: MP4, AVI, MOV. Kích thước tối đa: 500MB.</p>
              <CustomButton
                label='Chọn file'
                icon={<Upload className='h-4 w-4 ml-1' />}
                className='bg-blue-600 text-white hover:bg-blue-700 rounded-2xl'
                onClick={() => {
                  document.getElementById('video-file')?.click()
                }}
                type='button'
              />
            </>
          )}

          <CustomInput type='file' id='video-file' accept='video/*' className='hidden' onChange={handleSelectFile} />
          {selectedFile && (
            <div className='flex justify-between items-center gap-3 w-full px-3'>
              <div className='text-xs text-gray-600'>
                <div>{selectedFile.name}</div>
                <div>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</div>
                {watch('duration') ? (
                  <div>Thời lượng: {formatDuration(watch('duration') as number)}</div>
                ) : null}
              </div>
              <div className='flex items-center gap-2'>
                <CustomButton
                  label='Chọn khác'
                  onClick={() => document.getElementById('video-file')?.click()}
                  className='bg-white text-black border rounded-2xl'
                  icon={<MousePointer2 className='h-4 w-4 ml-1' />}
                  type='button'
                />
                <CustomButton
                  label='Hủy'
                  onClick={handleCancel}
                  className='bg-red-600 text-white rounded-2xl'
                  icon={<MdCancel className='h-4 w-4 ml-1' />}
                  type='button'
                />
              </div>
            </div>
          )}
        </div>

        <div className='flex-1 flex flex-col gap-2 px-0 md:px-2'>
          <CustomInput
            placeholder='Nhập tiêu đề video'
            className='w-full'
            label='Tiêu đề video'
            id='video-title'
            {...register('title')}
          />
          <p>{errors.title && <span className='text-red-500 text-xs'>{errors.title.message}</span>}</p>

          <div>
            <label htmlFor='video-description' className='font-medium mb-1 block text-sm'>Mô tả video</label>
            <div className='bg-white rounded-lg border border-gray-200'>
              <QuillEditor
                initialHtml={watch('content')}
                onChange={(html) => setValue('content', html)}
                className='min-h-[180px]'
              />
            </div>
            <p>{errors.content && <span className='text-red-500 text-xs'>{errors.content.message}</span>}</p>
          </div>

          <CustomCheckbox
            id='free-preview'
            label='Đặt video này làm bài giảng xem trước miễn phí'
            className='mt-2'
            checked={!!watch('isPublic')}
            onChange={(e) => setValue('isPublic', e.target.checked)}
          />
          <p>{errors.isPublic && <span className='text-red-500 text-xs'>{errors.isPublic.message}</span>}</p>
          <div className='flex justify-end'>
            <CustomButton
              label='Lưu bài giảng'
              icon={<Upload className='h-4 w-4 ml-1' />}
              className='bg-primary text-white hover:bg-primary/90 rounded-2xl px-6'
              type='submit'
            />
          </div>
        </div>
      </form>
    </div>
  )
}

export default AddVideoForm
