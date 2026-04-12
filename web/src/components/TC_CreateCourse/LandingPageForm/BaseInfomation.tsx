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
      <Card className='border-2 border-white ring-1 ring-gray-100 shadow-sm bg-white rounded-[32px] overflow-hidden'>
        <CardHeader className='pb-4 border-b border-gray-50'>
          <CardTitle className='text-[15px] font-bold text-gray-900 flex items-center gap-2'>
            <BookOpen className='w-4.5 h-4.5 text-blue-600' />
            Thông tin khóa học
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-5'>
          <div>
            <Label htmlFor='courseTitle' className='text-[11px] font-bold text-gray-400 mb-2 block px-1'>
              Tiêu đề khóa học *
            </Label>
            <Input
              id='courseTitle'
              {...register('courseTitle')}
              placeholder='Nhập tiêu đề khóa học...'
              className='h-10 text-[13px] font-medium border-gray-100 bg-gray-50/20 focus:bg-white transition-all rounded-xl placeholder:text-gray-300'
            />
            <div className='text-[10px] font-bold text-gray-300 mt-2 px-1'>{courseTitleLength}/60 ký tự</div>
            {errors.courseTitle && <p className='text-red-500 text-[10px] mt-1 px-1'>{errors.courseTitle.message}</p>}
          </div>

          <div>
            <Label htmlFor='subtitle' className='text-[11px] font-bold text-gray-400 mb-2 block px-1'>
              Mô tả ngắn khóa học *
            </Label>
            <Textarea
              id='subtitle'
              {...register('subtitle')}
              placeholder='Nhập phụ đề khóa học...'
              className='text-[13px] font-medium border-gray-100 bg-gray-50/20 focus:bg-white transition-all rounded-xl placeholder:text-gray-300 min-h-[90px]'
              rows={3}
            />
            <div className='text-[10px] font-bold text-gray-300 mt-2 px-1'>{subtitleLength}/120 ký tự</div>
            {errors.subtitle && <p className='text-red-500 text-[10px] mt-1 px-1'>{errors.subtitle.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card className='border-2 border-white ring-1 ring-gray-100 shadow-sm bg-white rounded-[32px] overflow-hidden'>
        <CardHeader className='pb-4 border-b border-gray-50'>
          <CardTitle className='text-[15px] font-bold text-gray-900 flex items-center gap-2'>
            <FileText className='w-4.5 h-4.5 text-blue-600' />
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

      <Card className='border-2 border-white ring-1 ring-gray-100 shadow-sm bg-white rounded-[32px] overflow-hidden'>
        <CardHeader className='pb-4 border-b border-gray-50'>
          <CardTitle className='text-[15px] font-bold text-gray-900 flex items-center gap-2'>
            <Info className='w-4.5 h-4.5 text-blue-600' />
            Thông tin cơ bản
          </CardTitle>
        </CardHeader>
        <CardContent className='grid md:grid-cols-2 gap-6'>
          <div className='space-y-2'>
            <Label className='text-[11px] font-bold text-gray-400 px-1'>Danh mục *</Label>
            <Controller
              control={control}
              name='category'
              render={({ field }) => (
                <Select value={field.value || ''} onValueChange={handleCategoryChange}>
                  <SelectTrigger className='text-[13px] font-medium border-gray-100 bg-gray-50/20 focus:bg-white transition-all rounded-xl h-10'>
                    <SelectValue
                      placeholder={categories && categories.length > 0 ? 'Chọn danh mục' : 'Chưa có danh mục'}
                    />
                  </SelectTrigger>
                  <SelectContent className='bg-white border-gray-100 rounded-xl'>
                    {categories && categories.length > 0 ? (
                      categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name} className='text-[13px]'>
                          {cat.name}
                        </SelectItem>
                      ))
                    ) : (
                      <p className='text-red-500 text-[10px] p-2'>
                        Chưa có danh mục nào.
                      </p>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && <p className='text-red-500 text-[10px] px-1'>{errors.category.message}</p>}
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

      <div className='flex justify-end pt-4 font-bold'>
        <CustomButton
          label='Lưu thông tin'
          className='bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-10 h-8.5 text-[11px] font-bold shadow-lg shadow-blue-100 transition-all active:scale-95'
          icon={<Save className='h-4 w-4 mr-2' />}
          type='submit'
          isLoader={loading}
        />
      </div>
    </form>
  )
}

export default BaseInfomation
