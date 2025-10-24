import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import CustomInput from '@/components/common/Input'
import { toast } from 'sonner'
import CustomButton from '@/components/common/Button'
import { FaPaperPlane } from 'react-icons/fa'

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
      <div className='flex items-center'>
        <div className='mr-4 w-1/3 flex-1'>
          <select
            id='currency'
            className=' h-10 w-full rounded-md border border-blue-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400'
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value='VND'>VND - Việt Nam Đồng</option>
          </select>
        </div>
        <div className='relative'>
          <CustomInput
            id='price'
            type='number'
            step={1000}
            min={50000}
            max={20000000}
            {...(register && name ? register(name) : {})}
            onChange={(e) => {
              const raw = e.target.value
              if (raw === '') {
                toast.error('Giá không không hợp lệ (trống)')
                return
              }
              const v = Number(raw)
              if (isNaN(v)) return
              const min = 50000,
                max = 20000000
              setCoursePrice(Math.max(min, Math.min(max, v)))
            }}
            // onBlur={() => {
            //   const min = 50000,
            //     max = 20000000
            //   setCoursePrice((prev: number) => {
            //     if (isNaN(prev)) return min
            //     return Math.max(min, Math.min(max, prev))
            //   })
            // }}
            className='pl-8 h-10 border-blue-300 focus:ring-2 focus:ring-blue-400'
          />
          <span className='absolute left-3 top-1/2 -translate-y-1/2 text-blue-500'>₫</span>
        </div>
      </div>
    </>
  )
}

const PriceForm = ({
  currency,
  setCurrency,
  register,
  errors,
  setValue
}: {
  currency: string
  setCurrency: (value: string) => void
  register?: any
  errors?: any
  setValue: any
}) => {
  return (
    <form>
      <Card className='border border-blue-200 shadow-sm bg-blue-50'>
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
            label='Giá khuyến mãi của khóa học'
            subLabel='*Giá bán ra thực tế của khóa học'
            name='finalPrice'
            register={register}
            errors={errors}
            setCoursePrice={(price: number) => {
              setValue('finalPrice', price)
            }}
          />

          <div className='text-sm text-blue-700'>Giá phải nằm trong khoảng 50.000 VNĐ đến 20.000.000 VNĐ</div>
          <div className='flex justify-end'>
            <CustomButton label='Lưu thay đổi' icon={<FaPaperPlane />} className='' />
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

export default PriceForm
