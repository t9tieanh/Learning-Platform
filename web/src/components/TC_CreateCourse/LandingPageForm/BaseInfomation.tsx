import { Controller } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import DynamicListInput from '../common/DynamicListInput'
import { Props as CommonProps } from '@/utils/common/reactHookFormProps'
import { BookOpen, FileText, Info } from 'lucide-react'

const BaseInfomation = ({ register, control, errors, setValue, getValues }: CommonProps) => {
  return (
    <>
      <Card className='border border-blue-200 shadow-sm bg-blue-50'>
        <CardHeader className='bg-blue-200/40 rounded-t-lg'>
          <CardTitle className='text-lg font-medium text-blue-900 flex items-center gap-2'>
            <BookOpen className='w-5 h-5 text-blue-700' />
            Thông tin khóa học
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-5'>
          <div>
            <Label htmlFor='title' className='text-blue-900'>
              Tiêu đề khóa học *
            </Label>
            <Input
              id='title'
              {...register('courseTitle')}
              placeholder='Nhập tiêu đề khóa học'
              className='mt-2 border-blue-300 focus:ring-blue-300'
            />
            <div className='text-xs text-blue-700 mt-1'>{getValues('courseTitle')?.length || 0}/60 ký tự</div>
            {errors.courseTitle && <p className='text-red-500 text-xs'>{errors.courseTitle.message}</p>}
          </div>

          <div>
            <Label htmlFor='subtitle' className='text-blue-900'>
              Mô tả ngắn khóa học *
            </Label>
            <Textarea
              id='subtitle'
              {...register('subtitle')}
              placeholder='Nhập phụ đề khóa học'
              className='mt-2 border-blue-300 focus:ring-blue-300'
              rows={3}
            />
            <div className='text-xs text-blue-700 mt-1'>{getValues('subtitle')?.length || 0}/120 ký tự</div>
            {errors.subtitle && <p className='text-red-500 text-xs'>{errors.subtitle.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card className='border border-blue-200 shadow-sm bg-blue-50'>
        <CardHeader className='bg-blue-200/40 rounded-t-lg'>
          <CardTitle className='text-lg font-medium text-blue-900 flex items-center gap-2'>
            <FileText className='w-5 h-5 text-blue-700' />
            Mô tả chi tiết khóa học
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id='description'
            {...register('description')}
            placeholder='Nhập mô tả khóa học'
            className='mt-2 border-blue-300 focus:ring-blue-300 min-h-32'
            rows={8}
          />
          {errors.description && <p className='text-red-500 text-xs'>{errors.description.message}</p>}
        </CardContent>
      </Card>

      <Card className='border border-blue-200 shadow-sm bg-blue-50'>
        <CardHeader className='bg-blue-200/40 rounded-t-lg'>
          <CardTitle className='text-lg font-medium text-blue-900 flex items-center gap-2'>
            <Info className='w-5 h-5 text-blue-700' />
            Thông tin cơ bản
          </CardTitle>
        </CardHeader>
        <CardContent className='grid md:grid-cols-2 gap-6'>
          <div>
            <Label className='text-blue-900'>Ngôn ngữ *</Label>
            <Controller
              control={control}
              name='language'
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className='mt-2 border-blue-300 focus:ring-blue-300'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='bg-blue-50'>
                    <SelectItem value='english'>Tiếng Anh</SelectItem>
                    <SelectItem value='spanish'>Tiếng Tây Ban Nha</SelectItem>
                    <SelectItem value='french'>Tiếng Pháp</SelectItem>
                    <SelectItem value='german'>Tiếng Đức</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.language && <p className='text-red-500 text-xs'>{errors.language.message}</p>}
          </div>

          <div>
            <Label className='text-blue-900'>Danh mục *</Label>
            <Controller
              control={control}
              name='category'
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className='mt-2 border-blue-300 focus:ring-blue-300'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='bg-blue-50'>
                    <SelectItem value='development'>Phát triển</SelectItem>
                    <SelectItem value='business'>Kinh doanh</SelectItem>
                    <SelectItem value='design'>Thiết kế</SelectItem>
                    <SelectItem value='marketing'>Marketing</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && <p className='text-red-500 text-xs'>{errors.category.message}</p>}
          </div>
        </CardContent>
      </Card>

      <DynamicListInput
        title='Bạn sẽ học được gì từ khóa học này?'
        placeholder='Nhập nội dung bạn sẽ học'
        items={getValues('learnItems') || []}
        onChange={(items) => setValue('learnItems', items)}
        icon={<BookOpen className='h-5 w-5 text-blue-700' />}
      />

      <DynamicListInput
        title='Yêu cầu trước của khóa học này?'
        placeholder='Nhập yêu cầu trước'
        items={getValues('requirements') || []}
        onChange={(items) => setValue('requirements', items)}
        icon={<Info className='h-5 w-5 text-blue-700' />}
      />
    </>
  )
}

export default BaseInfomation
