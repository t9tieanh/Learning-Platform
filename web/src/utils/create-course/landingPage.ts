import * as yup from 'yup'

export const landingPageSchema = yup.object({
  courseTitle: yup.string().required('Vui lòng nhập tiêu đề').max(60, 'Tối đa 60 ký tự'),
  subtitle: yup.string().required('Vui lòng nhập mô tả ngắn').max(120, 'Tối đa 120 ký tự'),
  description: yup.string().required('Vui lòng nhập mô tả chi tiết'),
  language: yup.string().required('Chọn ngôn ngữ'),
  category: yup.string().required('Chọn danh mục'),
  tags: yup.array().of(yup.string().optional()).optional(),
  learnItems: yup.array().of(yup.string().optional()).optional(),
  requirements: yup.array().of(yup.string().optional()).optional()
})

export type LandingPageFormValues = {
  courseTitle: string
  subtitle: string
  description: string
  language: string
  category: string
  tags: string[] | undefined
  learnItems: string[] | undefined
  requirements: string[] | undefined
}
