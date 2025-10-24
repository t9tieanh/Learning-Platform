import * as yup from 'yup'

export const PriceFormSchema = yup.object({
  originalPrice: yup
    .number()
    .required('Vui lòng nhập giá gốc')
    .min(50000, 'Giá gốc tối thiểu 50.000 VNĐ')
    .max(20000000, 'Giá gốc tối đa 20.000.000 VNĐ'),
  finalPrice: yup
    .number()
    .required('Vui lòng nhập giá khuyến mãi')
    .min(50000, 'Giá khuyến mãi tối thiểu 50.000 VNĐ')
    .max(20000000, 'Giá khuyến mãi tối đa 20.000.000 VNĐ')
})

export type PriceFormValues = {
  originalPrice: number
  finalPrice: number
}
