import { Button } from '@/components/ui/button'
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

const LandingPageForm = () => {
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
              />
            </TabsContent>

            <TabsContent value='media' className='space-y-6'>
              <MediaInfomation
                register={register}
                control={control}
                errors={errors}
                setValue={setValue}
                getValues={getValues}
              />
            </TabsContent>

            <TabsContent value='seo' className='space-y-6'>
              <SeoTagInfomation
                register={register}
                control={control}
                errors={errors}
                setValue={setValue}
                getValues={getValues}
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
      <div className='flex justify-between pt-6 border-t border-border/60'>
        <Button variant='ghost'>Quay lại</Button>
        <div className='space-x-3'>
          <Button variant='secondary'>Lưu bản nháp</Button>
          <Button className='bg-primary/90 hover:bg-primary'>Tiếp tục</Button>
        </div>
      </div>
    </div>
  )
}

export default LandingPageForm
