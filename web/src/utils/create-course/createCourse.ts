import * as yup from 'yup'

export const CreateCourseSchema = yup.object({
  courseTitle: yup.string().required('Vui lòng nhập tiêu đề').max(60, 'Tối đa 60 ký tự'),
  subtitle: yup.string().required('Vui lòng nhập mô tả ngắn').max(120, 'Tối đa 120 ký tự'),
  categoryId: yup.string().required('Chọn danh mục')
})

export type CreateCourseFormValues = {
  courseTitle: string
  subtitle: string
  categoryId: string
}
