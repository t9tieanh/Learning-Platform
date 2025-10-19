/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Props as CommonProps } from '@/utils/common/reactHookFormProps'
import CustomButton from '@/components/common/Button'
import useLoading from '@/hooks/useLoading.hook'
import { ChangeEvent, useRef } from 'react'
import { toast } from 'sonner'
import courseService from '@/services/course/course.service'

interface MediaInfomationProps {
  formProps: CommonProps
  id: string
}

const MediaInfomation = ({ formProps, id }: MediaInfomationProps) => {
  const { loading, startLoading, stopLoading } = useLoading()
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

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

      await uploadImage()
    }
  }

  const handleVideoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
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
    }
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
      <Card className='border border-blue-200 shadow-md bg-blue-50'>
        <CardHeader>
          <CardTitle className='text-lg font-semibold text-blue-900'>Hình ảnh khóa học</CardTitle>
          <p className='text-sm text-blue-700'>Tải hình ảnh khóa học tại đây.</p>
        </CardHeader>
        <CardContent>
          <div
            className='border-2 border-dashed border-blue-300 rounded-xl p-10 text-center 
                   hover:border-blue-500 hover:bg-blue-100/50 transition-colors cursor-pointer'
            onClick={triggerImageUpload}
          >
            <ImageIcon className='h-10 w-10 mx-auto mb-4 text-blue-400' />
            <h3 className='font-medium text-blue-900 mb-1'>Tải ảnh khóa học</h3>
            <p className='text-xs text-blue-600 mb-4'>750x422 pixels. JPG, JPEG hoặc PNG.</p>

            <CustomButton
              className='bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow'
              label={'Chọn ảnh'}
              icon={<Upload className='h-4 w-4 mr-2' />}
              isLoader={loading}
              onClick={triggerImageUpload}
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
      <Card className='border border-blue-200 shadow-md bg-blue-50'>
        <CardHeader>
          <CardTitle className='text-lg font-semibold text-blue-900'>Video giới thiệu</CardTitle>
          <p className='text-sm text-blue-700'>Học viên có thể xem trước khóa học qua video giới thiệu.</p>
        </CardHeader>
        <CardContent>
          <div
            className='border-2 border-dashed border-blue-300 rounded-xl p-10 text-center 
                   hover:border-blue-500 hover:bg-blue-100/50 transition-colors cursor-pointer'
            onClick={triggerVideoUpload}
          >
            <Upload className='h-10 w-10 mx-auto mb-4 text-blue-400' />
            <h3 className='font-medium text-blue-900 mb-1'>Tải video giới thiệu</h3>
            <p className='text-xs text-blue-600 mb-4'>Tối đa 2 phút. Độ phân giải 1920x1080.</p>

            <Button className='bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow' onClick={triggerVideoUpload}>
              {'Chọn video'}
            </Button>

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
