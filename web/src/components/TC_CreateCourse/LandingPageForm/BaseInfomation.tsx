import { Controller } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import QuillEditor from '@/components/common/Input/QuillEditor'
import { Label } from '@/components/ui/label'
import DynamicListInput from '../common/DynamicListInput'
import { Props as CommonProps } from '@/utils/common/reactHookFormProps'
import { BookOpen, FileText, Info, Save } from 'lucide-react'
import useCategory from '@/hooks/useCategory.hook'
import CustomButton from '@/components/common/Button'
import { toast } from 'sonner'
import courseService from '@/services/course/course.service'
import useLoading from '@/hooks/useLoading.hook'
import { useCallback, useMemo } from 'react'

interface BaseInfomationProps extends CommonProps {
  id: string
}

const BaseInfomation = ({
  register,
  control,
  errors,
  setValue,
  getValues,
  handleSubmit,
  watch,
  id
}: BaseInfomationProps) => {
  const categories = useCategory()
  const { loading, startLoading, stopLoading } = useLoading()

  const handleCategoryChange = useCallback(
    (value: string) => {
      if (!value) return
      setValue('category', value, { shouldValidate: true, shouldDirty: true })
      setValue('categoryId', categories.find((cat) => cat.name === value)?.id, {
        shouldValidate: true,
        shouldDirty: true
      })
    },
    [setValue, categories]
  )

  // Watch tất cả values một lần
  const watchedValues = watch(['courseTitle', 'subtitle'])

  // Safely get character counts
  const courseTitleLength = useMemo(() => {
    return watchedValues[0]?.length || 0
  }, [watchedValues[0]])

  const subtitleLength = useMemo(() => {
    return watchedValues[1]?.length || 0
  }, [watchedValues[1]])

  const onSubmit = async (data: any) => {
    const courseId = id
    if (!courseId) return

    const request = {
      id: courseId,
      title: data.courseTitle,
      shortDescription: data.subtitle,
      longDescription: data.description,
      outcomes: data.learnItems,
      requirements: data.requirements,
      categoryIds: data.categoryId,
      thumbnailUrl: data.thumbnailUrl
    }

    try {
      startLoading()
      const response = await courseService.createCourse(request)
      if (response && response.code === 200) {
        toast.success('Cập nhật thông tin khóa học thành công')
      } else {
        toast.error('Cập nhật thông tin khóa học thất bại')
      }
    } catch (error) {
      console.log('Error updating course info:', error)
      toast.error('Có lỗi xảy ra khi cập nhật khóa học')
    } finally {
      stopLoading()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <Card className='border border-blue-200 shadow-sm bg-blue-50'>
        <CardHeader className='bg-blue-200/40 rounded-t-lg'>
          <CardTitle className='text-lg font-medium text-blue-900 flex items-center gap-2'>
            <BookOpen className='w-5 h-5 text-blue-700' />
            Thông tin khóa học
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-5'>
          <div>
            <Label htmlFor='courseTitle' className='text-blue-900'>
              Tiêu đề khóa học *
            </Label>
            <Input
              id='courseTitle'
              {...register('courseTitle')}
              placeholder='Nhập tiêu đề khóa học'
              className='mt-2 border-blue-300 focus:ring-blue-300'
            />
            <div className='text-xs text-blue-700 mt-1'>{courseTitleLength}/60 ký tự</div>
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
            <div className='text-xs text-blue-700 mt-1'>{subtitleLength}/120 ký tự</div>
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
          <Controller
            control={control}
            name='description'
            render={({ field }) => (
              <QuillEditor
                initialHtml={field.value || ''}
                onChange={field.onChange}
                className='mt-2 min-h-32 min-h-[32rem]'
              />
            )}
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
            <Label className='text-blue-900'>Danh mục *</Label>
            <Controller
              control={control}
              name='category'
              render={({ field }) => (
                <Select value={field.value || ''} onValueChange={handleCategoryChange}>
                  <SelectTrigger className='mt-2 border-blue-300 focus:ring-blue-300'>
                    <SelectValue
                      placeholder={categories && categories.length > 0 ? 'Chọn danh mục' : 'Chưa có danh mục'}
                    />
                  </SelectTrigger>
                  <SelectContent className='bg-blue-50'>
                    {categories && categories.length > 0 ? (
                      categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))
                    ) : (
                      <p className='text-red-500 text-xs'>
                        Chưa có danh mục nào. Vui lòng thêm danh mục trong trang quản trị.
                      </p>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && <p className='text-red-500 text-xs'>{errors.category.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Controller
        control={control}
        name='learnItems'
        render={({ field }) => (
          <DynamicListInput
            title='Học viên của bạn sẽ học được gì từ khóa học này?'
            placeholder='Nhập nội dung bạn sẽ học'
            items={field.value || []}
            onChange={field.onChange}
            icon={<BookOpen className='h-5 w-5 text-blue-700' />}
            description='Nhập nội dung học viên của bạn sẽ được học (ít nhất 1 mục).'
          />
        )}
      />

      <Controller
        control={control}
        name='requirements'
        render={({ field }) => (
          <DynamicListInput
            title='Yêu cầu trước của khóa học này?'
            placeholder='Nhập yêu cầu trước'
            items={field.value || []}
            onChange={field.onChange}
            icon={<Info className='h-5 w-5 text-blue-700' />}
            description='Nhập nội dung yêu cầu trước của bạn (ít nhất 1 mục).'
          />
        )}
      />

      <CustomButton
        label='Lưu thông tin'
        className='bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow mt-4'
        icon={<Save className='h-5 w-5' />}
        type='submit'
        isLoader={loading}
      />
    </form>
  )
}

export default BaseInfomation
