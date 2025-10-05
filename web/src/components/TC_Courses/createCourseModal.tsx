import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { CreateCourseFormValues, CreateCourseSchema } from '@/utils/create-course/createCourse'
import CustomInput from '../common/Input'
import CustomButton from '../common/Button'
import { Send } from 'lucide-react'
import CustomCombobox from '../common/Combobox'
import useCategory from '@/hooks/useCategory.hook'
import courseService from '@/services/course/course.service'
import useLoading from '@/hooks/useLoading.hook'
import { toast } from 'react-toastify'

const CreateCourseModal = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<CreateCourseFormValues>({
    resolver: yupResolver(CreateCourseSchema)
  })
  const navigator = useNavigate()
  const categories = useCategory()
  const { loading, startLoading, stopLoading } = useLoading()

  const onSubmit = async (data: CreateCourseFormValues) => {
    try {
      startLoading()
      // Call API to create course
      const response = await courseService.createCourse({
        title: data.courseTitle,
        shortDescription: data.subtitle,
        categoryIds: data.categoryId
      })

      if (response?.code === 200 && response?.result?.id) {
        toast.success('Tạo khóa học thành công !')
        navigator(`/teacher/course/${response?.result?.id}`)
      } else {
        console.error('Failed to create course:', response?.message)
        toast.error(response?.message || 'Tạo khóa học thất bại !')
      }
    } catch (error) {
      console.error('Failed to create course:', error)
    } finally {
      stopLoading()
    }
  }

  return (
    <div className='create-course-modal'>
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
        <div className='flex flex-col gap-1'>
          <CustomInput label='Tiêu đề khóa học' placeholder='Nhập tiêu đề khóa học' {...register('courseTitle')} />
          {errors.courseTitle && <p className='text-red-500 text-xs'>{errors.courseTitle.message}</p>}
        </div>
        <div className='flex flex-col gap-1'>
          <CustomInput label='Mô tả ngắn' placeholder='Nhập mô tả ngắn' {...register('subtitle')} />
          {errors.subtitle && <p className='text-red-500 text-xs'>{errors.subtitle.message}</p>}
        </div>
        <div>
          <Controller
            control={control}
            name='categoryId'
            render={({ field }) => (
              <CustomCombobox
                displayLabel='Chọn danh mục'
                className='hover:bg-white hover:text-gray-200 text-gray-500 w-full'
                label='Danh mục'
                items={categories?.map((category) => ({ value: category.id, label: category.name })) || []}
                value={field.value || ''}
                setValue={field.onChange}
              />
            )}
          />
          {errors.categoryId && <p className='text-red-500 text-xs'>{errors.categoryId.message}</p>}
        </div>
        <CustomButton
          type='submit'
          label='Tạo khóa học'
          className='mt-4 w-full'
          icon={<Send className='h-5 w-5' />}
          isLoader={loading}
        />
      </form>
    </div>
  )
}

export default CreateCourseModal
