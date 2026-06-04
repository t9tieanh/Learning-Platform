import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import TitleComponent from '@/components/TC_CreateCourse/common/Title'
import PreviewComponent from './Preview'
import BaseInfomation from './BaseInfomation'
import MediaInfomation from './MediaInfomation'
import SeoTagInfomation from './SeoTagInfomation'
import { Info, Video, Tag } from 'lucide-react'
import { landingPageSchema, LandingPageFormValues } from '@/utils/create-course/landingPage'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import tagsService from '@/services/course/tags.service'

const LandingPageForm = ({
  id,
  courseInfo,
  onIntroVideoUpdated
}: {
  id: string
  onIntroVideoUpdated?: (url: string) => void
  courseInfo: {
    courseTitle: string
    subtitle: string
    description: string
    language: string
    learnItems: string[]
    category: string
    requirements: string[]
    thumbnailUrl: string
    introductoryVideo: string
  }
}) => {
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors }
  } = useForm<LandingPageFormValues>({
    resolver: yupResolver(landingPageSchema) as any,
    defaultValues: {} // optional empty, we'll reset when courseInfo arrives
  })

  const navigator = useNavigate()

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!id) return

      try {
        // fetch course info và tags song song
        const tagsResponse = await tagsService.getAllByCourseId(id)

        // Set tags
        if (tagsResponse && tagsResponse.code === 200 && tagsResponse.result) {
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

  // khi courseInfo từ parent thay đổi -> reset form
  useEffect(() => {
    if (!courseInfo) return
    reset({
      courseTitle: courseInfo.courseTitle,
      subtitle: courseInfo.subtitle,
      description: courseInfo.description,
      language: courseInfo.language,
      learnItems: courseInfo.learnItems,
      category: courseInfo.category,
      requirements: courseInfo.requirements,
      thumbnailUrl: courseInfo.thumbnailUrl,
      introductoryVideo: courseInfo.introductoryVideo
    })
  }, [courseInfo, reset])

  // Watch form values
  const formValues = watch()

  return (
    <div className='max-w-7xl w-full mx-auto space-y-12 px-4 sm:px-6 md:px-8 py-10 md:py-12 rounded-[48px] bg-[#f8fafc] border-2 border-white shadow-sm'>
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
            <TabsList className='grid h-auto w-full grid-cols-3 bg-blue-400 rounded-2xl p-1 shadow-sm'>
              <TabsTrigger
                value='basic'
                className='rounded-xl px-4 py-2.5 text-[11px] font-bold text-secondary-foreground/60 transition-all duration-300 
      hover:text-secondary-foreground focus:outline-none 
      data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-100 flex items-center justify-center gap-2'
              >
                <Info className='h-3.5 w-3.5' />
                Thông tin cơ bản
              </TabsTrigger>

              <TabsTrigger
                value='media'
                className='rounded-xl px-4 py-2.5 text-[11px] font-bold text-secondary-foreground/60 transition-all duration-300 
      hover:text-secondary-foreground focus:outline-none 
      data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-100 flex items-center justify-center gap-2'
              >
                <Video className='h-3.5 w-3.5' />
                Hình ảnh & Video
              </TabsTrigger>

              <TabsTrigger
                value='seo'
                className='rounded-xl px-4 py-2.5 text-[11px] font-bold text-secondary-foreground/60 transition-all duration-300 
      hover:text-secondary-foreground focus:outline-none 
      data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-100 flex items-center justify-center gap-2'
              >
                <Tag className='h-3.5 w-3.5' />
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
                  handleSubmit,
                  watch
                }}
                id={id}
                onIntroVideoUpdated={onIntroVideoUpdated}
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
    </div>
  )
}

export default LandingPageForm
