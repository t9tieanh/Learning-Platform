import * as yup from 'yup'

/** Đơn vị nghìn đồng (5 = 5.000 VNĐ) */
export const MIN_FINAL_PRICE_THOUSANDS = 5
export const MIN_ORIGINAL_PRICE_THOUSANDS = 50
export const MAX_PRICE_THOUSANDS = 20000

export const PriceFormSchema = yup.object({
  originalPrice: yup
    .number()
    .typeError('Vui lòng nhập giá gốc hợp lệ')
    .required('Vui lòng nhập giá gốc')
    .min(MIN_ORIGINAL_PRICE_THOUSANDS, 'Giá gốc tối thiểu 50.000 VNĐ')
    .max(MAX_PRICE_THOUSANDS, 'Giá gốc tối đa 20.000.000 VNĐ')
    .test('greater-than-final', 'Giá gốc phải lớn hơn giá bán ra', function (value) {
      const finalPrice = this.parent.finalPrice
      if (value == null || finalPrice == null || finalPrice === '') return true
      return Number(value) > Number(finalPrice)
    }),
  finalPrice: yup
    .number()
    .typeError('Vui lòng nhập giá bán ra hợp lệ')
    .required('Vui lòng nhập giá bán ra')
    .min(MIN_FINAL_PRICE_THOUSANDS, 'Giá bán ra tối thiểu 5.000 VNĐ')
    .max(MAX_PRICE_THOUSANDS, 'Giá bán ra tối đa 20.000.000 VNĐ')
    .test('less-than-original', 'Giá bán ra phải nhỏ hơn giá gốc', function (value) {
      const originalPrice = this.parent.originalPrice
      if (value == null || originalPrice == null || originalPrice === '') return true
      return Number(value) < Number(originalPrice)
    })
})

export type PriceFormValues = {
  originalPrice: number
  finalPrice: number
}
