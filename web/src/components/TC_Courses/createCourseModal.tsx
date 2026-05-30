import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { CreateCourseFormValues, CreateCourseSchema } from '@/utils/create-course/createCourse'
import CustomInput from '../common/Input'
import CustomButton from '../common/Button'
import { Sparkles, Zap, GraduationCap, ArrowRight } from 'lucide-react'
import CustomCombobox from '../common/Combobox'
import useCategory from '@/hooks/useCategory.hook'
import courseService from '@/services/course/course.service'
import useLoading from '@/hooks/useLoading.hook'
import { toast } from 'sonner'
import bgInspiration from '@/assets/images/cover-create-course-form.jpg'
import { cn } from '@/lib/utils'
import type { Course } from '@/components/TC_Courses/CourseTypes'

const createFlowSteps = ['Thông tin', 'Giới thiệu', 'Giáo trình', 'Định giá'] as const

type CreateCourseModalProps = {
  onCourseCreated?: (course: Course) => void
}

const CreateCourseModal: React.FC<CreateCourseModalProps> = ({ onCourseCreated }) => {
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
        const id = String(response.result.id)
        const created: Course = {
          id,
          title: data.courseTitle,
          shortDescription: data.subtitle,
          longDescription: null,
          thumbnailUrl: null,
          language: null,
          originalPrice: null,
          finalPrice: null,
          status: 'DRAFT',
          instructorId: null,
          chapterIds: null,
          enrollmentIds: null,
          tagNames: null,
          categoryName: null,
          progressStep: null,
          outcomes: null,
          requirements: null,
          image: undefined,
          tags: undefined,
          duration: undefined,
          students: undefined,
          createdAt: new Date().toLocaleDateString()
        }
        if (onCourseCreated) {
          onCourseCreated(created)
        } else {
          navigator(`/teacher/course/${id}`)
        }
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
    <div className='relative flex h-full w-full flex-col overflow-hidden bg-white md:h-[780px] md:flex-row'>
      <div className='group relative hidden h-full w-1/2 flex-col overflow-hidden bg-slate-100 p-10 md:flex'>
        <img
          src={bgInspiration}
          className='absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105'
          alt=''
        />
        <div className='absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/20 to-slate-900/10' />

        <div className='relative z-10 flex h-full min-h-0 flex-col justify-between'>
          <div className='w-fit rounded-2xl border border-white/30 bg-white/15 p-3.5 shadow-lg backdrop-blur-xl'>
            <GraduationCap className='h-5 w-5 text-white' aria-hidden />
          </div>

          <div className='max-w-md space-y-2 rounded-2xl border border-white/25 bg-white/10 px-4 py-3 shadow-lg backdrop-blur-xl'>
            <p className='text-[10px] font-semibold uppercase tracking-[0.2em] text-white/65'>Lộ trình tiếp theo</p>
            <div className='flex flex-wrap items-center gap-x-1 gap-y-1'>
              {createFlowSteps.map((label, i) => (
                <React.Fragment key={label}>
                  {i > 0 ? (
                    <span className='select-none px-0.5 text-[10px] text-white/35' aria-hidden>
                      ·
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      'text-[10px] font-semibold uppercase tracking-wide',
                      i === 0 ? 'text-cyan-300' : 'text-white/55'
                    )}
                  >
                    {label}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className='flex h-full flex-1 flex-col justify-between overflow-y-auto bg-white p-7 md:p-12'>
        <div className='space-y-8'>
          <div className='space-y-2'>
            <div className='mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-blue-700'>
              <Zap className='h-3 w-3' />
              <span className='text-[10px] font-semibold tracking-[0.14em]'>Bắt đầu ngay</span>
            </div>
            <h3 className='text-2xl font-semibold tracking-tight text-slate-900 md:text-[1.9rem]'>Thông tin khóa học</h3>
            <p className='text-sm text-slate-500'>Hãy khởi đầu hành trình giảng dạy của bạn</p>
          </div>

          <form className='space-y-5'>
            <div className='space-y-2'>
              <label className='text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500'>Tiêu đề khóa học</label>
              <CustomInput
                placeholder='Vd: Mastering React with AI'
                {...register('courseTitle')}
                className='h-12 rounded-xl border-slate-200 bg-white text-sm font-medium text-slate-700 transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
              />
              {errors.courseTitle && <p className='text-[11px] font-medium text-rose-500'>{errors.courseTitle.message}</p>}
            </div>

            <div className='space-y-2'>
              <label className='text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500'>Mô tả nổi bật</label>
              <CustomInput
                placeholder='Tóm tắt nội dung hấp dẫn'
                {...register('subtitle')}
                className='h-12 rounded-xl border-slate-200 bg-white text-sm font-medium text-slate-700 transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
              />
              {errors.subtitle && <p className='text-[11px] font-medium text-rose-500'>{errors.subtitle.message}</p>}
            </div>

            <div className='space-y-2'>
              <label className='text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500'>Lĩnh vực giảng dạy</label>
              <Controller
                control={control}
                name='categoryId'
                render={({ field }) => (
                  <CustomCombobox
                    className='h-12 rounded-xl border-slate-200 font-medium focus:border-blue-400'
                    label=''
                    items={categories?.map((category) => ({ value: category.id, label: category.name })) || []}
                    value={field.value || ''}
                    setValue={field.onChange}
                  />
                )}
              />
              {errors.categoryId && <p className='text-[11px] font-medium text-rose-500'>{errors.categoryId.message}</p>}
            </div>
          </form>
        </div>

        <div className='pt-8'>
          <div className='mb-4 flex items-center gap-3 rounded-xl border border-cyan-100 bg-cyan-50/70 p-3.5'>
            <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-600 text-white shadow-md shadow-cyan-500/30'>
              <Sparkles className='h-4 w-4' />
            </div>
            <div>
              <p className='text-xs font-semibold text-slate-900'>Hỗ trợ AI 100%</p>
              <p className='text-[11px] text-slate-500'>Tự động soạn khung chương trình</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CustomButton
              type='submit'
              label='Khởi tạo khóa học'
              className='h-12 w-full rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(37,99,235,0.32)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_35px_rgba(37,99,235,0.4)] active:scale-[0.98]'
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
