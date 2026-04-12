import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { CreateCourseFormValues, CreateCourseSchema } from '@/utils/create-course/createCourse'
import CustomInput from '../common/Input'
import CustomButton from '../common/Button'
import { Send, BookOpen, Sparkles, Users, BarChart3, Zap, GraduationCap, ArrowRight } from 'lucide-react'
import CustomCombobox from '../common/Combobox'
import useCategory from '@/hooks/useCategory.hook'
import courseService from '@/services/course/course.service'
import useLoading from '@/hooks/useLoading.hook'
import { toast } from 'sonner'
import learnovaLogo from '@/assets/images/logo1.png'
import bgInspiration from '@/assets/images/cover-create-course-form.jpg'

const courseFeatures = [
  {
    icon: <BookOpen className='w-3 h-3' />,
    title: 'Quản lý nội dung',
    description: 'Tổ chức video, tài liệu và bài tập'
  },
  {
    icon: <Sparkles className='w-3 h-3' />,
    title: 'AI phân tích tự động',
    description: 'Tạo tóm tắt và gợi ý tiêu đề'
  },
  {
    icon: <Users className='w-3 h-3' />,
    title: 'Tương tác học viên',
    description: 'Bài tập, câu hỏi, trực tiếp'
  },
  {
    icon: <BarChart3 className='w-3 h-3' />,
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
    <div className='flex flex-col md:flex-row w-full h-full md:h-[780px] overflow-hidden bg-white relative'>
      {/* Left Pane - Inspiration & Features */}
      <div className='hidden md:flex w-1/2 relative bg-gray-100 overflow-hidden flex-col p-10 justify-between h-full group'>
        {/* Background Image & Decor */}
        <img
          src={bgInspiration}
          className='absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105'
          alt='Inspiration'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent' />

        {/* Top Logo - Keeping it minimal */}
        <div className='relative z-10'>
          <div className='bg-white/90 backdrop-blur-md w-fit p-2.5 rounded-xl shadow-lg shadow-black/5'>
            <img src={learnovaLogo} alt='Learnova' className='h-5 w-auto' />
          </div>
        </div>

        {/* Bottom Floating Console */}
        <div className='relative z-10 space-y-6'>
          <div className='p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl'>
            <div className='mb-8'>
              <h2 className='text-3xl lg:text-4xl font-black text-white leading-[1.1] tracking-tight mb-3'>
                Kiến tạo <br />
                Tri thức mới
              </h2>
              <p className='text-white/80 font-bold text-[13px] leading-relaxed'>
                Xây dựng bài giảng chuyên nghiệp và tiếp cận hàng ngàn học viên.
              </p>
            </div>

            {/* Compact Feature Grid */}
            <div className='grid grid-cols-2 gap-3 pb-2'>
              {courseFeatures.map((feature, index) => (
                <div key={index} className='flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/5'>
                  <div className='w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20'>
                    {feature.icon}
                  </div>
                  <span className='text-white font-bold text-[11px] leading-none tracking-tight'>{feature.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - The Form */}
      <div className='flex-1 p-8 md:p-14 flex flex-col justify-between overflow-y-auto h-full bg-white'>
        <div className='space-y-10'>
          <div className='space-y-2'>
            <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 mb-2'>
              <Zap className='w-2.5 h-2.5 fill-blue-600' />
              <span className='text-[9px] font-bold uppercase tracking-[0.2em]'>Bắt đầu ngay</span>
            </div>
            <h3 className='text-2xl md:text-3xl font-black text-gray-900 tracking-tight'>Thông tin khóa học</h3>
            <p className='text-gray-400 text-xs font-semibold'>Hãy khởi đầu hành trình giảng dạy của bạn</p>
          </div>

          <form className='space-y-6'>
            <div className='space-y-2'>
              <label className='text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]'>Tiêu đề khóa học</label>
              <CustomInput
                placeholder='Vd: Mastering React with AI'
                {...register('courseTitle')}
                className='h-12 rounded-xl border-gray-100 focus:border-blue-500 focus:ring-0 text-[13px] font-semibold transition-all'
              />
              {errors.courseTitle && (
                <p className='text-red-500 text-[10px] mt-1 font-bold'>{errors.courseTitle.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <label className='text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]'>Mô tả nổi bật</label>
              <CustomInput
                placeholder='Tóm tắt nội dung hấp dẫn'
                {...register('subtitle')}
                className='h-12 rounded-xl border-gray-100 focus:border-blue-500 focus:ring-0 text-[13px] font-semibold transition-all'
              />
              {errors.subtitle && (
                <p className='text-red-500 text-[10px] mt-1 font-bold'>{errors.subtitle.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <label className='text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]'>Lĩnh vực giảng dạy</label>
              <Controller
                control={control}
                name='categoryId'
                render={({ field }) => (
                  <CustomCombobox
                    className='h-12 rounded-xl border-gray-100 focus:border-blue-500 font-semibold'
                    label=''
                    items={categories?.map((category) => ({ value: category.id, label: category.name })) || []}
                    value={field.value || ''}
                    setValue={field.onChange}
                  />
                )}
              />
              {errors.categoryId && (
                <p className='text-red-500 text-[10px] mt-1 font-bold'>{errors.categoryId.message}</p>
              )}
            </div>
          </form>
        </div>

        <div className='pt-10 flex flex-col gap-4'>
          <div className='p-3.5 rounded-xl border border-blue-100 bg-blue-50/30 flex items-center gap-4 mb-2'>
            <div className='w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20'>
              <Sparkles className='w-4 h-4 text-white' />
            </div>
            <div>
              <p className='text-[11px] font-black text-gray-900 leading-none mb-1'>Hỗ trợ AI 100%</p>
              <p className='text-[10px] font-bold text-gray-500 leading-none'>Tự động soạn khung chương trình</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CustomButton
              type='submit'
              label='Khởi tạo khóa học'
              className='w-full h-14 bg-blue-600 hover:bg-black text-white rounded-xl text-[14px] font-black shadow-xl shadow-blue-100 transition-all hover:-translate-y-1 active:scale-[0.98]'
              icon={<ArrowRight className='h-4 w-4' />}
              isLoader={loading}
            />
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateCourseModal
