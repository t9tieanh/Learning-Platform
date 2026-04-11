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
      <div className='flex flex-col gap-1.5'>
        <Label htmlFor='currency' className='text-[11px] font-bold text-gray-400 uppercase tracking-wider'>
          {label}
        </Label>
        <p className='text-[10px] font-medium text-gray-300'>{subLabel}</p>
      </div>
      <div className='relative'>
        <CustomInput
          id='price'
          type='number'
          step={1}
          min={1}
          max={10000}
          placeholder='Ví dụ: 200'
          {...(register && name ? register(name) : {})}
          onChange={(e) => {
            const raw = e.target.value
            if (raw === '') return
            const value = Number(raw)
            if (isNaN(value)) return
            setCoursePrice(value)
          }}
          className='pl-8 pr-24 h-11 text-[13.5px] font-bold border-gray-100 bg-gray-50/20 focus:bg-white transition-all rounded-2xl placeholder:text-gray-300'
        />
        <span className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold'>₫</span>
        <span className='absolute right-3.5 px-2 py-1 bg-gray-100/50 rounded-lg text-[10px] top-1/2 -translate-y-1/2 text-gray-400 font-black uppercase tracking-tighter'>.000 VND</span>
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
      <Card className='border-2 border-white ring-1 ring-gray-100 shadow-sm bg-white rounded-[32px] overflow-hidden'>
        <CardHeader className='pb-4 border-b border-gray-50/50'>
          <CardTitle className='text-[15px] font-bold text-gray-900'>Giá khóa học</CardTitle>
        </CardHeader>

        <CardContent className='space-y-6 pt-6'>
          <PriceInput
            currency={currency}
            setCurrency={setCurrency}
            label='Giá gốc của khóa học'
            subLabel='Giá hiển thị gạch ngang để thu hút học viên'
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
            label='Giá thực tế bán ra'
            subLabel='Mức giá cuối cùng học viên sẽ thanh toán'
            name='finalPrice'
            register={register}
            errors={errors}
            setCoursePrice={(price: number) => {
              setValue('finalPrice', price)
            }}
          />

          <div className='p-4 bg-blue-50/30 rounded-2xl border border-blue-50/80 text-[11px] font-medium text-blue-600 leading-relaxed'>
            * Hệ thống nhận đơn vị nghìn đồng. Phạm vi cho phép: 50 - 20,000 (tương đương 50.000đ - 20.000.000đ)
          </div>
          <div className='flex justify-end pt-2'>
            <CustomButton
              className='bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-10 h-10 text-[11px] font-bold shadow-lg shadow-blue-100 transition-all active:scale-95'
              label='Cập nhật giá'
              icon={<FaPaperPlane className='h-3 w-3 mr-2' />}
              isLoader={loading}
            />
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

export default PriceForm
