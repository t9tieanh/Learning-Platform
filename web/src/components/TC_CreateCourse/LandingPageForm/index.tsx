import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import TitleComponent from '@/components/TC_CreateCourse/common/Title'
import PreviewComponent from './Preview'
import BaseInfomation from './BaseInfomation'
import MediaInfomation from './MediaInfomation'
import SeoTagInfomation from './SeoTagInfomation'
import { Info, Video, Tag, Send } from 'lucide-react'
import { landingPageSchema, LandingPageFormValues } from '@/utils/create-course/landingPage'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import CustomButton from '@/components/common/Button'
import { useEffect } from 'react'
import courseService from '@/services/course/course.service'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import tagsService from '@/services/course/tags.service'

const LandingPageForm: React.FC<{ id: string }> = ({ id }: { id: string }) => {
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors }
  } = useForm<LandingPageFormValues>({
    resolver: yupResolver(landingPageSchema) as any
  })

  const navigator = useNavigate()

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!id) return

      try {
        // Fetch course info và tags song song
        const [courseResponse, tagsResponse] = await Promise.all([
          courseService.getCourseInfo(id),
          tagsService.getAllByCourseId(id)
        ])

        // Set course info
        if (courseResponse.code === 200 && courseResponse.result) {
          const course = courseResponse.result

          setValue('courseTitle', course.title || '')
          setValue('subtitle', course.shortDescription || '')
          setValue('description', course.longDescription || '')
          setValue('language', course.language || '')
          setValue('learnItems', course.outcomes || [])
          setValue('category', course.category || '') // Đây là giá trị từ API
          setValue('requirements', course.requirements || [])
          setValue('thumbnailUrl', course.thumbnailUrl || '')
        } else {
          console.log('Failed to fetch course info')
          navigator('/teacher')
          toast.error(courseResponse.message || 'Không tìm thấy khóa học')
          return
        }

        // Set tags
        if (tagsResponse && tagsResponse.code === 200 && tagsResponse.result) {
          // console.log('🏷️ Setting tags:', tagsResponse.result)
          setValue('tags', tagsResponse.result)
        }
      } catch (error) {
        console.log('Error fetching course data:', error)
        navigator('/teacher')
        toast.error('Không tìm thấy khóa học')
      }
    }

    fetchCourseData()
  }, [id, setValue, navigator])
  // Watch form values
  const formValues = watch()

  return (
    <div className='max-w-6xl mx-auto space-y-10 px-4'>
      <TitleComponent
        title='Trang giới thiệu khóa học'
        icon={<Info className='h-6 w-6 text-primary' />}
        description='Trang giới thiệu khóa học rất quan trọng để bạn thành công trên Udemy. Nếu làm tốt, nó cũng giúp bạn tăng khả
          năng hiển thị trên các công cụ tìm kiếm như Google. Khi hoàn thành phần này, hãy nghĩ đến việc tạo một trang
          giới thiệu hấp dẫn cho thấy lý do tại sao học viên nên đăng ký khóa học của bạn.'
      />

      <div className='grid lg:grid-cols-2 gap-10'>
        {/* Form Section */}
        <div className='space-y-8'>
          <Tabs defaultValue='basic' className='space-y-6'>
            <TabsList className='grid h-auto w-full grid-cols-3 bg-blue-200 rounded-xl p-1'>
              <TabsTrigger
                value='basic'
                className='rounded-lg px-3 py-2 text-sm font-medium text-blue-900 transition-all duration-200 
      hover:bg-blue-300 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400
      data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md'
              >
                <Info className='h-6 w-6' />
                Thông tin cơ bản
              </TabsTrigger>

              <TabsTrigger
                value='media'
                className='rounded-lg px-3 py-2 text-sm font-medium text-blue-900 transition-all duration-200 
      hover:bg-blue-300 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400
      data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md'
              >
                <Video className='h-6 w-6' />
                Hình ảnh & Video
              </TabsTrigger>

              <TabsTrigger
                value='seo'
                className='rounded-lg px-3 py-2 text-sm font-medium text-blue-900 transition-all duration-200 
      hover:bg-blue-300 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400
      data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md'
              >
                <Tag className='h-6 w-6' />
                SEO & Thẻ
              </TabsTrigger>
            </TabsList>

            <TabsContent value='basic' className='space-y-6'>
              <BaseInfomation
                register={register}
                control={control}
                errors={errors}
                setValue={setValue}
                getValues={getValues}
                handleSubmit={handleSubmit}
                watch={watch}
                id={id}
              />
            </TabsContent>

            <TabsContent value='media' className='space-y-6'>
              <MediaInfomation
                formProps={{
                  register,
                  control,
                  errors,
                  setValue,
                  getValues,
                  handleSubmit
                }}
                id={id}
              />
            </TabsContent>

            <TabsContent value='seo' className='space-y-6'>
              <SeoTagInfomation
                formProps={{
                  register,
                  control,
                  errors,
                  setValue,
                  getValues,
                  handleSubmit
                }}
                id={id}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Section */}
        <div className='space-y-8'>
          <PreviewComponent {...formValues} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex justify-end pt-6 border-t border-border/60'>
        <div className='space-x-3'>
          <CustomButton className='bg-primary/90 hover:bg-primary' label='Tiếp tục' icon={<Send className='mr-2' />} />
        </div>
      </div>
    </div>
  )
}

export default LandingPageForm
