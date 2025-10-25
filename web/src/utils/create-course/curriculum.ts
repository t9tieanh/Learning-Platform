import * as yup from 'yup'

export interface Chapter {
  id: string
  title: string
  isOpen: boolean
  description?: string
  position: number
  lessons: Lesson[]
}

export interface Lesson {
  id: string
  title: string
  content: string
  position: number
  isPublic: boolean
  duration?: string
  url?: string
  type: 'video' | 'article'
}

export const UpdateChapterSchema = yup.object({
  title: yup.string().required('Vui lòng nhập tiêu đề').max(60, 'Tối đa 60 ký tự'),
  description: yup.string().required('Vui lòng nhập mô tả ngắn').max(120, 'Tối đa 120 ký tự')
})

export type UpdateChapterFormValues = {
  title: string
  description: string
}

export const CreationLessonSchema = yup.object({
  title: yup.string().required('Vui lòng nhập tiêu đề').max(60, 'Tối đa 60 ký tự'),
  content: yup.string().required('Vui lòng nhập nội dung video').max(120, 'Tối đa 120 ký tự'),
  isPublic: yup.boolean().default(false),
  // duration in seconds (optional)
  duration: yup.number().nullable()
})

export type CreationLessonFormValues = {
  title: string
  content: string
  isPublic: boolean
  duration?: number | null
}
