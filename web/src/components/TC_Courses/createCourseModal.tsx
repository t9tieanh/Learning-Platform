import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { CreateCourseFormValues, CreateCourseSchema } from '@/utils/create-course/createCourse'
import CustomInput from '../common/Input'
import CustomButton from '../common/Button'
import { Send, BookOpen, Sparkles, Users, BarChart3, Zap, GraduationCap } from 'lucide-react'
import CustomCombobox from '../common/Combobox'
import useCategory from '@/hooks/useCategory.hook'
import courseService from '@/services/course/course.service'
import useLoading from '@/hooks/useLoading.hook'
import { toast } from 'sonner'
import learnovaLogo from '@/assets/images/logo1.png'

const courseFeatures = [
  {
    icon: <BookOpen className='w-4 h-4' />,
    title: 'Quản lý nội dung',
    description: 'Tổ chức video, tài liệu và bài tập'
  },
  {
    icon: <Sparkles className='w-4 h-4' />,
    title: 'AI phân tích tự động',
    description: 'Tạo tóm tắt và gợi ý tiêu đề'
  },
  {
    icon: <Users className='w-4 h-4' />,
    title: 'Tương tác học viên',
    description: 'Bài tập, câu hỏi, trực tiếp'
  },
  {
    icon: <BarChart3 className='w-4 h-4' />,
    title: 'Thống kê chi tiết',
    description: 'Theo dõi tiến độ học viên'
  }
]

const CreateCourseModal: React.FC = () => {
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
    <div className='flex flex-col md:flex-row w-full h-auto md:h-auto min-h-[480px] max-h-[85vh] overflow-y-auto md:overflow-hidden'>
      {/* Left Pane - Features & Benefits */}
      <div className='flex-1 p-6 sm:p-8 md:p-10 flex flex-col justify-center bg-gradient-to-br from-indigo-50/60 to-blue-50/40'>
        {/* Logo */}
        <div className='flex items-center gap-2 mb-6'>
          <img src={learnovaLogo} alt='Learnova' className='h-6 md:h-7 w-auto object-contain' />
        </div>

        {/* Title */}
        <h2 className='text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight mb-2 tracking-tight'>
          Bắt đầu tạo{' '}
          <span className='text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600'>khóa học</span>
        </h2>

        {/* Subtitle */}
        <p className='text-indigo-700 font-semibold text-base md:text-lg mb-6 flex items-center gap-2'>
          <GraduationCap className='w-5 h-5' /> Trao kiến thức cho học viên
        </p>

        {/* Features List */}
        <ul className='space-y-3 md:space-y-4'>
          {courseFeatures.map((feature, index) => (
            <li key={index} className='flex gap-3 md:gap-4'>
              <div className='flex-shrink-0 mt-0.5'>
                <div className='w-6 h-6 rounded-md bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-sm'>
                  {feature.icon}
                </div>
              </div>
              <div className='flex-1'>
                <h4 className='text-gray-900 font-semibold text-sm md:text-[15px] leading-snug'>{feature.title}</h4>
                <p className='text-gray-600 text-xs md:text-sm leading-snug mt-0.5'>{feature.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Right Pane - Form */}
      <div className='w-full md:w-[380px] bg-white p-6 sm:p-8 md:p-10 flex flex-col justify-between shadow-[-10px_0_30px_rgba(0,0,0,0.03)] z-10 relative'>
        {/* Decorative background */}
        <div className='absolute top-0 right-0 w-56 h-56 bg-gradient-to-br from-indigo-100/40 to-blue-100/30 rounded-bl-full -z-10 blur-3xl hidden md:block'></div>

        <div className='space-y-5'>
          {/* Form Header */}
          <div className='space-y-1'>
            <h3 className='text-lg md:text-xl font-bold text-gray-900 leading-tight'>Thông tin khóa học</h3>
            <p className='text-xs md:text-sm text-gray-500'>Điền thông tin cơ bản để bắt đầu</p>
          </div>

          {/* Form Fields */}
          <form className='flex flex-col gap-3.5'>
            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-semibold text-gray-900'>Tiêu đề khóa học</label>
              <CustomInput
                placeholder='Vd: Lập trình React từ cơ bản'
                {...register('courseTitle')}
                className='text-sm'
              />
              {errors.courseTitle && (
                <p className='text-red-500 text-xs mt-1 flex items-center gap-1'>
                  <span className='inline-block w-1 h-1 bg-red-500 rounded-full'></span>
                  {errors.courseTitle.message}
                </p>
              )}
            </div>

            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-semibold text-gray-900'>Mô tả ngắn</label>
              <CustomInput
                placeholder='Nội dung chính của khóa học'
                {...register('subtitle')}
                className='text-sm'
              />
              {errors.subtitle && (
                <p className='text-red-500 text-xs mt-1 flex items-center gap-1'>
                  <span className='inline-block w-1 h-1 bg-red-500 rounded-full'></span>
                  {errors.subtitle.message}
                </p>
              )}
            </div>

            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-semibold text-gray-900'>Danh mục</label>
              <Controller
                control={control}
                name='categoryId'
                render={({ field }) => (
                  <CustomCombobox
                    className='text-sm w-full font-sm'
                    label=''
                    items={categories?.map((category) => ({ value: category.id, label: category.name })) || []}
                    value={field.value || ''}
                    setValue={field.onChange}
                  />
                )}
              />
              {errors.categoryId && (
                <p className='text-red-500 text-xs mt-1 flex items-center gap-1'>
                  <span className='inline-block w-1 h-1 bg-red-500 rounded-full'></span>
                  {errors.categoryId.message}
                </p>
              )}
            </div>
          </form>
        </div>

        {/* CTA Section */}
        <div className='mt-6 pt-5 border-t border-gray-100 space-y-3'>
          {/* Highlight Card */}
          <div className='bg-gradient-to-r from-indigo-600 to-blue-600 p-4 md:p-5 rounded-xl text-white shadow-md shadow-indigo-200/50 relative overflow-hidden'>
            <div className='absolute top-1 right-1 p-2 opacity-10'>
              <Zap className='w-12 h-12' />
            </div>
            <div className='relative z-10'>
              <p className='font-semibold text-sm md:text-base flex items-center gap-2'>
                <Sparkles className='w-4 h-4 flex-shrink-0' />
                Đa sử dụng AI ngay
              </p>
              <p className='text-indigo-100 text-xs md:text-sm mt-1'>Tự động phân tích và chia nhỏ bài học</p>
            </div>
          </div>

          {/* Submit Button */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <CustomButton
              type='submit'
              label='Tạo khóa học ngay'
              className='w-full h-10 md:h-11 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md text-sm transition-all hover:shadow-lg hover:-translate-y-0.5'
              icon={<Send className='h-4 w-4 flex-shrink-0' />}
              isLoader={loading}
            />
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateCourseModal
