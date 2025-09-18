import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, X, Target, Users, Award } from 'lucide-react'
import { Textarea } from '../ui/textarea'

type DynamicFieldListProps = {
  label: string
  description?: string
  icon: React.ReactNode
  values: string[]
  setValues: (v: string[]) => void
  placeholder: string
  maxItems?: number
}

const DynamicFieldList = ({
  label,
  description,
  icon,
  values,
  setValues,
  placeholder,
  maxItems = 15
}: DynamicFieldListProps) => {
  const addField = () => {
    if (values.length < maxItems) setValues([...values, ''])
  }
  const removeField = (index: number) => {
    setValues(values.filter((_, i) => i !== index))
  }
  const updateField = (index: number, value: string) => {
    const updated = [...values]
    updated[index] = value
    setValues(updated)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.36, ease: 'easeOut' } }}
    >
      <Card>
        <CardHeader className='bg-gradient-to-r from-indigo-50 to-sky-50 rounded-t-2xl'>
          <CardTitle className='flex items-center space-x-2'>
            {icon}
            <span>{label}</span>
          </CardTitle>
          {description && <p className='text-sm text-muted-foreground'>{description}</p>}
        </CardHeader>
        <CardContent className='space-y-4'>
          {values.map((value, index) => (
            <div key={index} className='flex items-center space-x-2'>
              <Input
                placeholder={placeholder}
                value={value}
                onChange={(e) => updateField(index, e.target.value)}
                className='flex-1 rounded-xl'
              />
              {values.length > 1 && (
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => removeField(index)}
                  className='text-muted-foreground hover:text-destructive hover:border-2 hover:border-gray-500 hover:bg-white transition'
                >
                  <X className='h-4 w-4' />
                </Button>
              )}
            </div>
          ))}
          <Button
            variant='outline'
            onClick={addField}
            className='w-full flex items-center justify-center hover:bg-primary-hover'
            disabled={values.length >= maxItems}
          >
            <Plus className='h-4 w-4 mr-2' />
            Thêm mục mới
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const CourseGoalsForm = () => {
  const [learningObjectives, setLearningObjectives] = useState([''])
  const [prerequisites, setPrerequisites] = useState([''])
  const [targetAudience, setTargetAudience] = useState([''])
  const [courseTitle, setCourseTitle] = useState('')
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [shortDescription, setShortDescription] = useState('')

  const handleUploadCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(URL.createObjectURL(e.target.files[0]))
    }
  }

  return (
    <div className='max-w-5xl mx-auto space-y-8 p-4 sm:p-6'>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.4 } }} className='mb-6'>
        <h1 className='text-3xl font-bold mb-2'>Thông tin cơ bản của khóa học</h1>
        <p className='text-muted-foreground text-lg leading-relaxed'>
          Những mô tả sau sẽ hiển thị công khai trên <span className='underline'>Trang giới thiệu khoá học</span> và
          giúp học viên quyết định liệu khoá học của bạn có phù hợp với họ.
        </p>
      </motion.div>

      {/* Course Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.36, ease: 'easeOut' } }}
      >
        <Card>
          <CardHeader className='bg-gradient-to-r from-indigo-50 to-sky-50 rounded-t-2xl'>
            <CardTitle className='flex items-center space-x-2'>
              <Users className='h-5 w-5 text-primary' />
              <span>Thông tin khóa học</span>
            </CardTitle>
            <p className='text-sm text-muted-foreground'>
              Cung cấp tiêu đề, ảnh bìa và mô tả ngắn gọn để giúp học viên hiểu rõ khóa học của bạn.
            </p>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <label htmlFor='courseTitle' className='text-sm font-medium text-muted-foreground'>
                  Tiêu đề khóa học
                </label>
                <Input
                  id='courseTitle'
                  placeholder='Ví dụ: Khóa học Lập trình Python cho người mới bắt đầu'
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className='rounded-xl'
                />
              </div>

              <div className='space-y-2'>
                <label htmlFor='coverImage' className='text-sm font-medium text-muted-foreground'>
                  Ảnh bìa
                </label>
                <Input id='coverImage' type='file' accept='image/*' onChange={handleUploadCover} />
                {coverImage && (
                  <img
                    src={coverImage}
                    alt='Ảnh bìa khóa học'
                    className='w-full h-40 object-cover rounded-xl shadow-sm mt-2'
                  />
                )}
              </div>
            </div>

            <div className='space-y-2'>
              <label htmlFor='shortDescription' className='text-sm font-medium text-muted-foreground'>
                Mô tả ngắn
              </label>
              <Textarea
                id='shortDescription'
                placeholder='Viết một đoạn ngắn mô tả nội dung chính và lợi ích của khóa học...'
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className='rounded-xl min-h-[120px]'
              />
            </div>

            <Button className='w-full rounded-2xl shadow-md hover:scale-[1.02] transition-transform duration-200'>
              Lưu thông tin
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Learning Objectives */}
      <DynamicFieldList
        label='Học viên sẽ học được gì trong khoá học của bạn?'
        description='Bạn cần nhập ít nhất 4 mục tiêu mà học viên có thể đạt được.'
        icon={<Target className='h-5 w-5 text-primary' />}
        values={learningObjectives}
        setValues={setLearningObjectives}
        placeholder='Ví dụ: Xác định vai trò và trách nhiệm của một quản lý dự án'
      />

      {/* Prerequisites */}
      <DynamicFieldList
        label='Những yêu cầu hoặc kiến thức nền tảng trước khi tham gia khoá học?'
        description='Liệt kê kỹ năng, kinh nghiệm, công cụ hoặc thiết bị cần có trước khi tham gia khoá học.'
        icon={<Award className='h-5 w-5 text-primary' />}
        values={prerequisites}
        setValues={setPrerequisites}
        placeholder='Ví dụ: Không cần kinh nghiệm lập trình. Bạn sẽ học mọi thứ từ đầu.'
      />

      {/* Target Audience */}
      <DynamicFieldList
        label='Đối tượng học viên mục tiêu'
        description='Mô tả nhóm học viên mà khóa học hướng đến.'
        icon={<Users className='h-5 w-5 text-primary' />}
        values={targetAudience}
        setValues={setTargetAudience}
        placeholder='Ví dụ: Sinh viên, nhân viên văn phòng, người mới bắt đầu...'
      />

      {/* Action Buttons */}
      <div className='flex flex-col md:flex-row justify-between items-center pt-6 border-t gap-3'>
        <Button variant='outline' className='w-full md:w-auto'>
          Quay lại
        </Button>
        <div className='flex flex-1 md:flex-none justify-end gap-3 w-full md:w-auto'>
          <Button variant='outline' className='flex-1 md:flex-none'>
            Lưu nháp
          </Button>
          <Button className='bg-primary hover:bg-primary/90 flex-1 md:flex-none'>Tiếp tục</Button>
        </div>
      </div>
    </div>
  )
}

export default CourseGoalsForm
