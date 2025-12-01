import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import CustomInput from '@/components/common/Input'
import { toast } from 'sonner'
import CustomButton from '@/components/common/Button'
import { FaPaperPlane } from 'react-icons/fa'
import courseService from '@/services/course/course.service'
import { PriceFormValues } from '@/utils/create-course/price'
import useLoading from '@/hooks/useLoading.hook'

const PriceInput = ({
  currency,
  setCurrency,
  label,
  subLabel,
  name,
  register,
  errors,
  setCoursePrice
}: {
  currency: string
  setCurrency: (value: string) => void
  label: string
  subLabel: string
  name: string
  register?: any
  errors?: any
  setCoursePrice: (value: number) => void
}) => {
  return (
    <>
      <div className='title'>
        <Label htmlFor='currency' className='text-blue-900 mb-2'>
          {label}
        </Label>
        <p className='text-sm text-gray-500'>*{subLabel}</p>
      </div>
      <div className='relative'>
        <CustomInput
          id='price'
          type='number'
          step={1}
          min={1}
          max={10000}
          placeholder='Ví dụ: 200 (tương đương 200.000 VNĐ)'
          {...(register && name ? register(name) : {})}
          onChange={(e) => {
            const raw = e.target.value
            if (raw === '') {
              toast.error('Giá không hợp lệ (trống)')
              return
            }
            const value = Number(raw)
            if (isNaN(value)) return
            setCoursePrice(value)
          }}
          className='pl-8 pr-20 h-10 border-blue-300 focus:ring-2 focus:ring-blue-400'
        />
        <span className='absolute left-3 top-1/2 -translate-y-1/2 text-blue-500'>₫</span>
        <span className='absolute right-3 text-sm top-1/2 -translate-y-1/2 text-gray-500 font-medium'>.000 VND</span>
      </div>
    </>
  )
}

const PriceForm = ({
  currency,
  setCurrency,
  register,
  errors,
  setValue,
  courseId,
  handleSubmit
}: {
  currency: string
  setCurrency: (value: string) => void
  register?: any
  errors?: any
  setValue: any
  courseId: string
  handleSubmit: any
}) => {
  const { loading, startLoading, stopLoading } = useLoading()

  // handle update price
  const handleUpdatePrice = async (data: PriceFormValues) => {
    try {
      const originalPrice = Number(data.originalPrice) || 0
      const finalPrice = Number(data.finalPrice) || 0

      startLoading()
      const result = await courseService.updatePrice(courseId, originalPrice, finalPrice)
      if (result && result.code === 200) {
        toast.success(result.message || 'Cập nhật giá khóa học thành công!')
      } else toast.error(result.message || 'Cập nhật giá khóa học thất bại. Vui lòng thử lại.')
    } catch (error) {
      toast.error('Cập nhật giá khóa học thất bại. Vui lòng thử lại.')
    } finally {
      stopLoading()
    }
  }

  return (
    <form onSubmit={handleSubmit(handleUpdatePrice)}>
      <Card className='bg-white shadow-lg'>
        <CardHeader className='bg-blue-200/40 rounded-t-lg'>
          <CardTitle className='text-lg font-medium text-blue-900'>Giá khóa học</CardTitle>
        </CardHeader>

        <CardContent className='space-y-5'>
          <PriceInput
            currency={currency}
            setCurrency={setCurrency}
            label='Giá gốc của khóa học'
            subLabel='*Giá hiển thị ở phần gạch ngang trên trang khóa học'
            name='originalPrice'
            register={register}
            errors={errors}
            setCoursePrice={(price: number) => {
              setValue('originalPrice', price)
            }}
          />
          <PriceInput
            currency={currency}
            setCurrency={setCurrency}
            label='Giá khuyến mãi (Giá thực tế) của khóa học'
            subLabel='*Giá bán ra thực tế của khóa học'
            name='finalPrice'
            register={register}
            errors={errors}
            setCoursePrice={(price: number) => {
              setValue('finalPrice', price)
            }}
          />

          <div className='text-sm text-blue-700'>
            Giá phải nằm trong khoảng 50.000 VNĐ đến 20.000.000 VNĐ (nhập 50 - 20000)
          </div>
          <div className='flex justify-end'>
            <CustomButton label='Lưu thay đổi' icon={<FaPaperPlane />} isLoader={loading} />
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

export default PriceForm
