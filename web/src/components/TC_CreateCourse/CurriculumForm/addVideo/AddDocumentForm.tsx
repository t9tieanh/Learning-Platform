/* eslint-disable prettier/prettier */
import CustomInput from '@/components/common/Input'
import { Label } from '@/components/ui/label'
import CustomButton from '@/components/common/Button'
import { Upload, FileText as DocumentIcon, MousePointer2 } from 'lucide-react'
import CustomTextarea from '@/components/common/Textarea'
import CustomCheckbox from '@/components/common/CustomCheckbox'
import { useEffect, useRef, useState } from 'react'
import { MdCancel } from 'react-icons/md'
import { CreationLessonFormValues, CreationLessonSchema } from '@/utils/create-course/curriculum'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { HandleAddLesson } from '@/components/TC_CreateCourse/CurriculumForm/index'

const AddDocumentForm = ({
  chapterId,
  handleAddLesson,
  setOpen
}: {
  chapterId: string
  handleAddLesson: HandleAddLesson
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CreationLessonFormValues>({
    resolver: yupResolver(CreationLessonSchema) as any
  })

  const handleSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log('Selected file:', file)
      const url = URL.createObjectURL(file)
      setFileSrc(url)
      setSelectedFile(file)
    }
  }

  const handleCancel = () => {
    if (fileSrc) URL.revokeObjectURL(fileSrc)
    setFileSrc(null)
    setSelectedFile(null)
    const inp = document.getElementById('doc-file') as HTMLInputElement | null
    if (inp) inp.value = ''
  }

  const [fileSrc, setFileSrc] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  // cleanup object URL when component unmounts or src changes
  useEffect(() => {
    return () => {
      if (fileSrc) {
        URL.revokeObjectURL(fileSrc)
      }
    }
  }, [fileSrc])

  return (
    <div className='add-document-form'>
      <form className='flex items-stretch space-x-4 h-96' onSubmit={handleSubmit(handleAddLesson(selectedFile as File, chapterId, setOpen, 'learning/lessons/article'))}>
        <div className='file-upload flex flex-col justify-center items-center gap-3 p-4 border-2 border-blue-600 h-full flex-1 rounded-2xl'>
          {fileSrc ? (
            <iframe
              ref={iframeRef}
              src={fileSrc}
              title='PDF preview'
              className='w-full h-full max-h-[80%] rounded-lg bg-white border'
            />
          ) : (
            <>
              <div className='mx-auto p-3 border-2 border-blue-600 rounded-full'>
                <DocumentIcon className='h-10 w-10 text-blue-600' />
              </div>
              <Label htmlFor='doc-file' className='font-medium'>
                Chọn tài liệu (PDF) để upload
              </Label>
              <p className='text-xs text-gray-500'>Định dạng được hỗ trợ: PDF. Kích thước tối đa: 50MB.</p>
              <CustomButton
                label='Chọn file'
                icon={<Upload className='h-4 w-4 ml-1' />}
                className='bg-blue-600 text-white hover:bg-blue-700 rounded-2xl'
                onClick={() => {
                  document.getElementById('doc-file')?.click()
                }}
                type='button'
              />
            </>
          )}

          <CustomInput type='file' id='doc-file' accept='application/pdf' className='hidden' onChange={handleSelectFile} />
          {selectedFile && (
            <div className='flex justify-between items-center gap-3 mt-2 w-full px-3'>
              <div className='text-xs text-gray-600'>
                <div>{selectedFile.name}</div>
                <div>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</div>
              </div>
              <div className='flex items-center gap-2'>
                <CustomButton
                  label='Chọn khác'
                  onClick={() => document.getElementById('doc-file')?.click()}
                  className='bg-white text-black border rounded-2xl'
                  icon={<MousePointer2 className='h-4 w-4 ml-1' />}
                  type='button'
                />
                <CustomButton
                  label='Hủy'
                  onClick={handleCancel}
                  className='bg-red-600 text-white rounded-2xl'
                  icon={<MdCancel className='h-4 w-4 ml-1' />}
                  type='button'
                />
              </div>
            </div>
          )}
        </div>

        <div className='px-4 h-full flex flex-col gap-2'>
          <CustomInput
            placeholder='Nhập tiêu đề tài liệu'
            className='w-full'
            label='Tiêu đề tài liệu'
            id='doc-title'
            {...register('title')}
          />
          <p>{errors.title && <span className='text-red-500 text-xs'>{errors.title.message}</span>}</p>
          <CustomTextarea
            placeholder='Nhập mô tả tài liệu'
            className='h-full'
            id='doc-description'
            {...register('content')}
          />
          <p>{errors.content && <span className='text-red-500 text-xs'>{errors.content.message}</span>}</p>
          <CustomCheckbox
            id='free-preview'
            label='Đặt tài liệu này làm bài giảng xem trước miễn phí'
            className='mt-2'
            checked={!!watch('isPublic')}
            onChange={(e) => setValue('isPublic', e.target.checked)}
          />
          <p>{errors.isPublic && <span className='text-red-500 text-xs'>{errors.isPublic.message}</span>}</p>
          <CustomButton
            label='Lưu & Upload'
            icon={<Upload className='h-4 w-4 ml-1' />}
            className='bg-primary text-white hover:bg-primary/90 rounded-2xl mt-2'
            type='submit'
          />
        </div>
      </form>
    </div>
  )
}

export default AddDocumentForm
