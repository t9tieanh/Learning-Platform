import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import CustomInput from '@/components/common/Input'
import { toast } from 'sonner'
import CustomButton from '@/components/common/Button'
import { FaPaperPlane } from 'react-icons/fa'
import courseService from '@/services/course/course.service'
import {
  MAX_PRICE_THOUSANDS,
  MIN_FINAL_PRICE_THOUSANDS,
  MIN_ORIGINAL_PRICE_THOUSANDS,
  PriceFormValues
} from '@/utils/create-course/price'
import useLoading from '@/hooks/useLoading.hook'
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormTrigger } from 'react-hook-form'

const PriceInput = ({
  currency,
  setCurrency,
  label,
  subLabel,
  name,
  register,
  errorMessage,
  min,
  setCoursePrice
}: {
  currency: string
  setCurrency: (value: string) => void
  label: string
  subLabel: string
  name: keyof PriceFormValues
  register: UseFormRegister<PriceFormValues>
  errorMessage?: string
  min: number
  setCoursePrice: (value: number) => void
}) => {
  const { onChange, onBlur, ref, name: fieldName } = register(name)

  return (
    <div className='space-y-1.5'>
      <div className='flex flex-col gap-1.5'>
        <Label htmlFor={fieldName} className='text-[11px] font-bold text-gray-400 uppercase tracking-wider'>
          {label}
        </Label>
        <p className='text-[10px] font-medium text-gray-300'>{subLabel}</p>
      </div>
      <div className='relative'>
        <CustomInput
          id={fieldName}
          name={fieldName}
          ref={ref}
          type='number'
          step={1}
          min={min}
          max={MAX_PRICE_THOUSANDS}
          placeholder='Ví dụ: 200'
          onBlur={onBlur}
          onChange={(e) => {
            onChange(e)
            const raw = e.target.value
            if (raw === '') return
            const value = Number(raw)
            if (Number.isNaN(value)) return
            setCoursePrice(value)
          }}
          className={`pl-8 pr-24 h-11 text-[13.5px] font-bold bg-gray-50/20 focus:bg-white transition-all rounded-2xl placeholder:text-gray-300 ${
            errorMessage ? 'border-red-300 focus-visible:ring-red-200' : 'border-gray-100'
          }`}
        />
        <span className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold'>₫</span>
        <span className='absolute right-3.5 px-2 py-1 bg-gray-100/50 rounded-lg text-[10px] top-1/2 -translate-y-1/2 text-gray-400 font-black uppercase tracking-tighter'>.000 VND</span>
      </div>
      {errorMessage ? <p className='text-[11px] font-medium text-red-500'>{errorMessage}</p> : null}
    </div>
  )
}

const PriceForm = ({
  currency,
  setCurrency,
  register,
  errors,
  setValue,
  trigger,
  courseId,
  handleSubmit,
  onPriceUpdated
}: {
  currency: string
  setCurrency: (value: string) => void
  register: UseFormRegister<PriceFormValues>
  errors: FieldErrors<PriceFormValues>
  setValue: UseFormSetValue<PriceFormValues>
  trigger: UseFormTrigger<PriceFormValues>
  courseId: string
  handleSubmit: ReturnType<typeof import('react-hook-form').useForm<PriceFormValues>>['handleSubmit']
  onPriceUpdated?: () => void | Promise<void>
}) => {
  const revalidatePrices = () => {
    void trigger(['originalPrice', 'finalPrice'])
  }
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
        await onPriceUpdated?.()
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
            min={MIN_ORIGINAL_PRICE_THOUSANDS}
            register={register}
            errorMessage={errors.originalPrice?.message}
            setCoursePrice={(price: number) => {
              setValue('originalPrice', price, { shouldValidate: true, shouldDirty: true })
              revalidatePrices()
            }}
          />
          <PriceInput
            currency={currency}
            setCurrency={setCurrency}
            label='Giá thực tế bán ra'
            subLabel='Mức giá cuối cùng học viên sẽ thanh toán'
            name='finalPrice'
            min={MIN_FINAL_PRICE_THOUSANDS}
            register={register}
            errorMessage={errors.finalPrice?.message}
            setCoursePrice={(price: number) => {
              setValue('finalPrice', price, { shouldValidate: true, shouldDirty: true })
              revalidatePrices()
            }}
          />

          <div className='p-4 bg-blue-50/30 rounded-2xl border border-blue-50/80 text-[11px] font-medium text-blue-600 leading-relaxed'>
            * Hệ thống nhận đơn vị nghìn đồng. Giá bán ra: 5 - 20,000 (5.000đ - 20.000.000đ). Giá gốc tối thiểu
            50.000đ và phải lớn hơn giá bán ra.
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
