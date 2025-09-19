import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Props as CommonProps } from '@/utils/common/reactHookFormProps'

const MediaInfomation = ({ register, control, errors, setValue, getValues }: CommonProps) => {
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
          >
            <ImageIcon className='h-10 w-10 mx-auto mb-4 text-blue-400' />
            <h3 className='font-medium text-blue-900 mb-1'>Tải ảnh khóa học</h3>
            <p className='text-xs text-blue-600 mb-4'>750x422 pixels. JPG, JPEG hoặc PNG.</p>
            <Button className='bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow'>Chọn ảnh</Button>
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
          >
            <Upload className='h-10 w-10 mx-auto mb-4 text-blue-400' />
            <h3 className='font-medium text-blue-900 mb-1'>Tải video giới thiệu</h3>
            <p className='text-xs text-blue-600 mb-4'>Tối đa 2 phút. Độ phân giải 1920x1080.</p>
            <Button className='bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow'>Chọn video</Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default MediaInfomation
