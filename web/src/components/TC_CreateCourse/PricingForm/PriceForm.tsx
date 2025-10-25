import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import CustomInput from '@/components/common/Input'
import { toast } from 'sonner'

const PriceForm = ({
  currency,
  setCurrency,
  coursePrice,
  setCoursePrice
}: {
  currency: string
  setCurrency: (value: string) => void
  coursePrice: number
  setCoursePrice: React.Dispatch<React.SetStateAction<number>>
}) => {
  return (
    <Card className='border border-blue-200 shadow-sm bg-blue-50'>
      <CardHeader className='bg-blue-200/40 rounded-t-lg'>
        <CardTitle className='text-lg font-medium text-blue-900'>Giá khóa học</CardTitle>
      </CardHeader>

      <CardContent className='space-y-5'>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <Label htmlFor='currency' className='text-blue-900 mb-2'>
              Tiền tệ
            </Label>
            <select
              id='currency'
              className='flex h-10 w-full rounded-md border border-blue-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400'
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value='VND'>VND - Việt Nam Đồng</option>
            </select>
          </div>

          <>
            <div className='relative mt-2'>
              <CustomInput
                id='price'
                type='number'
                label='Giá'
                step={1000}
                min={50000}
                max={20000000}
                value={coursePrice}
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
                onBlur={() => {
                  const min = 50000,
                    max = 20000000
                  setCoursePrice((prev: number) => {
                    if (isNaN(prev)) return min
                    return Math.max(min, Math.min(max, prev))
                  })
                }}
                className='pl-8 h-10 border-blue-300 focus:ring-2 focus:ring-blue-400'
              />
              <span className='absolute left-3 top-1/2 -translate-y-1/2 text-blue-500'>₫</span>
            </div>
          </>
        </div>

        <div className='text-sm text-blue-700'>Giá phải nằm trong khoảng 50.000 VNĐ đến 5.000.000 VNĐ</div>
      </CardContent>
    </Card>
  )
}

export default PriceForm
