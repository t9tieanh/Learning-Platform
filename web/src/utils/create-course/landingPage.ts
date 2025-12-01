import * as yup from 'yup'

export const landingPageSchema = yup.object({
  courseTitle: yup.string().required('Vui lòng nhập tiêu đề').max(60, 'Tối đa 60 ký tự'),
  category: yup.string().required('Chọn danh mục'),
  tags: yup
    .array()
    .of(
      yup.object({
        id: yup.string().required(),
        name: yup.string().required(),
        imageUrl: yup.string().url().required()
      })
    )
    .optional(),
  learnItems: yup.array().of(yup.string().optional()).optional(),
  requirements: yup.array().of(yup.string().optional()).optional()
})

export type LandingPageFormValues = {
  courseTitle: string
  subtitle: string
  description: string
  language: string
  category: string
  categoryId: string | undefined
  thumbnailUrl: string | undefined
  tags: { id: string; name: string; imageUrl: string }[] | undefined
  learnItems: string[] | undefined
  requirements: string[] | undefined
  introductoryVideo: string | undefined
}
