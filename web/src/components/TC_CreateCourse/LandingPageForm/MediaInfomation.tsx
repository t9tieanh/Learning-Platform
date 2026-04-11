/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Image as ImageIcon, Video, CircleX, Send, MousePointer } from 'lucide-react'
import { Props as CommonProps } from '@/utils/common/reactHookFormProps'
import CustomButton from '@/components/common/Button'
import useLoading from '@/hooks/useLoading.hook'
import { ChangeEvent, useRef, useState, useEffect } from 'react'
import { toast } from 'sonner'
import IntroVideoPreviewProgress from './IntroVideoPreviewProgress'
import courseService from '@/services/course/course.service'
import { useUpload } from '@/hooks/useUpload.hook'
import { useAuthStore } from '@/stores/useAuth.stores'

interface MediaInfomationProps {
  formProps: CommonProps
  id: string
}

const MediaInfomation = ({ formProps, id }: MediaInfomationProps) => {
  const { loading, startLoading, stopLoading } = useLoading()
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const { data } = useAuthStore()
  const { upload, progress, message, isUploading } = useUpload({
    accessToken: data?.accessToken as string,
    uri: `learning/instructor/courses/${id}/video-introduction`
  })

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // check type of image
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Chỉ hỗ trợ file JPG, JPEG hoặc PNG')
        return
      }

      // check capacity of image (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB')
        return
      }

      //valid image and upload to backend
      const uploadImage = async () => {
        try {
          startLoading()

          const response = await courseService.updateAvatar(id, file)

          if (response.code === 200 && response.result) {
            // Set the image URL to form value
            formProps.setValue('thumbnailUrl', response.result.imageUrl)
            toast.success('Tải ảnh lên thành công')
          }
        } catch (error) {
          console.error('Error uploading image:', error)
          toast.error('Tải ảnh lên thất bại. Vui lòng thử lại.')
        } finally {
          stopLoading()
        }
      }

      try {
        uploadImage()
      } catch (error) {
        console.error('Error uploading image:', error)
        toast.error('Tải ảnh lên thất bại. Vui lòng thử lại.')
      }
    }
  }

  const handleVideoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // check type of video
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ hỗ trợ file MP4, WebM hoặc OGG')
      return
    }

    // Check capacity of video (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File quá lớn. Vui lòng chọn file nhỏ hơn 50MB')
      return
    }

    // create preview URL and store file locally (no upload yet)
    const url = URL.createObjectURL(file)
    setVideoSrc(url)
    setSelectedVideoFile(file)
  }

  // local state for preview and file
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null)
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null)

  // cleanup object URL when component unmounts or when videoSrc changes
  useEffect(() => {
    return () => {
      if (videoSrc) URL.revokeObjectURL(videoSrc)
    }
  }, [videoSrc])

  // confirm upload video
  const handleConfirmVideo = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!videoSrc || !selectedVideoFile) {
      toast.error('Vui lòng chọn video trước khi xác nhận')
      return
    }

    // FormData cho cả video và lesson metadata
    const formData = new FormData()
    formData.append('file', selectedVideoFile)

    try {
      console.log('Uploading intro video file:', formData)
      await upload(formData, async () => {
        toast.success('Tải video giới thiệu lên thành công')
        handleCancelVideo()
      })
    } catch (error) {
      console.error('Error uploading intro video:', error)
    }
  }

  // cancel upload video
  const handleCancelVideo = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (videoSrc) URL.revokeObjectURL(videoSrc)
    setVideoSrc(null)
    setSelectedVideoFile(null)
    if (videoInputRef.current) videoInputRef.current.value = ''
  }

  const triggerImageUpload = () => {
    imageInputRef.current?.click()
  }

  const triggerVideoUpload = () => {
    videoInputRef.current?.click()
  }

  return (
    <>
      {/* Upload Course Image */}
      <Card className='border-2 border-white ring-1 ring-gray-100 shadow-sm bg-white rounded-[32px] overflow-hidden'>
        <CardHeader className='pb-4 border-b border-gray-50'>
          <CardTitle className='text-[15px] font-bold text-gray-900 flex items-center gap-2'>
            <ImageIcon className='w-4.5 h-4.5 text-blue-600' />
            Hình ảnh khóa học
          </CardTitle>
          <p className='text-[11.5px] font-medium text-gray-400 mt-1'>Tải lên hình ảnh đại diện hấp dẫn cho khóa học của bạn.</p>
        </CardHeader>
        <CardContent>
          <div
            className='border-2 border-dashed border-gray-100 rounded-3xl p-12 text-center 
                   hover:border-blue-200 hover:bg-blue-50/10 transition-all duration-300 cursor-pointer group bg-gray-50/20'
            onClick={triggerImageUpload}
          >
            <ImageIcon className='h-12 w-12 mx-auto mb-4 text-gray-300 group-hover:text-blue-400 transition-colors' />
            <h3 className='text-[13px] font-bold text-gray-700 mb-1.5'>Tải ảnh khóa học lên</h3>
            <p className='text-[10px] font-bold text-gray-300 mb-6'>Kích thước chuẩn 750x422 pixels. Hỗ trợ JPG, JPEG hoặc PNG.</p>

            <CustomButton
              className='bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 h-7.5 text-[10.5px] font-bold shadow-lg shadow-blue-100 transition-all active:scale-95'
              label={'Chọn ảnh từ máy'}
              icon={<Upload className='h-3.5 w-3.5 mr-2' />}
              isLoader={loading}
              onClick={(e) => {
                e.stopPropagation()
                triggerImageUpload()
              }}
            />

            {/* Hidden input */}
            <input
              type='file'
              ref={imageInputRef}
              onChange={handleImageChange}
              accept='image/jpeg,image/jpg,image/png'
              className='hidden'
            />
          </div>
        </CardContent>
      </Card>

      {/* Upload Course Intro Video */}
      <Card className='border-2 border-white ring-1 ring-gray-100 shadow-sm bg-white rounded-[32px] overflow-hidden'>
        <CardHeader className='pb-4 border-b border-gray-50'>
          <CardTitle className='text-[15px] font-bold text-gray-900 flex items-center gap-2'>
            <Video className='w-4.5 h-4.5 text-blue-600' />
            Video giới thiệu
          </CardTitle>
          <p className='text-[11.5px] font-medium text-gray-400 mt-1'>Video giới thiệu giúp học viên hiểu rõ hơn về giá trị mà khóa học mang lại.</p>
        </CardHeader>
        <CardContent>
          <div
            className='border-2 border-dashed border-gray-100 rounded-3xl p-12 text-center 
                   hover:border-blue-200 hover:bg-blue-50/10 transition-all duration-300 cursor-pointer group bg-gray-50/20'
            onClick={triggerVideoUpload}
          >
            {videoSrc ? (
              <div className='flex flex-col items-center'>
                <video
                  ref={videoPreviewRef}
                  src={videoSrc}
                  controls
                  className='w-full max-h-48 mb-3 rounded-md bg-black'
                />
                <div className='flex justify-center items-center gap-3 w-full'>
                  <CustomButton
                    className='bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-7.5 px-6 text-[10.5px] font-bold shadow-lg shadow-blue-100'
                    label={'Xác nhận lưu'}
                    onClick={handleConfirmVideo}
                    icon={<Send className='h-3.5 w-3.5 mr-2' />}
                  />
                  <div className='flex items-center gap-2'>
                    <CustomButton
                      className='bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-100 rounded-xl h-7.5 w-7.5 p-0 flex items-center justify-center'
                      icon={<MousePointer className='h-3.5 w-3.5' />}
                      onClick={(e) => {
                        e.stopPropagation()
                        triggerVideoUpload()
                      }}
                    />
                    <CustomButton
                      className='bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-xl h-7.5 w-7.5 p-0 flex items-center justify-center'
                      onClick={handleCancelVideo}
                      icon={<CircleX className='h-3.5 w-3.5' />}
                    />
                  </div>
                </div>
                {isUploading && <IntroVideoPreviewProgress progress={progress} />}
              </div>
            ) : (
              <>
                <Video className='h-12 w-12 mx-auto mb-4 text-gray-300 group-hover:text-blue-400 transition-colors' />
                <h3 className='text-[13px] font-bold text-gray-700 mb-1.5'>Tải video giới thiệu lên</h3>
                <p className='text-[10px] font-bold text-gray-300 mb-6'>Thời lượng tối đa 2 phút. Độ phân giải chuẩn 1080p.</p>

                <CustomButton
                  className='bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 h-7.5 text-[10.5px] font-bold shadow-lg shadow-blue-100 transition-all active:scale-95'
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation()
                    triggerVideoUpload()
                  }}
                  label={'Chọn video từ máy'}
                  icon={<Video className='h-3.5 w-3.5 mr-2' />}
                />
              </>
            )}

            {/* Hidden input */}
            <input
              type='file'
              ref={videoInputRef}
              onChange={handleVideoChange}
              accept='video/mp4,video/webm,video/ogg'
              className='hidden'
            />
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default MediaInfomation
