/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle } from 'lucide-react'

const SuggestedPrice = ({
  suggestedPrices,
  coursePrice,
  setCoursePrice
}: {
  suggestedPrices: { price: number; tier: string; description: string }[]
  coursePrice: number
  setCoursePrice: (price: number) => void
}) => {
  return (
    <Card className='border border-blue-200 shadow-sm bg-blue-50'>
      <CardHeader className='bg-blue-200/40 rounded-t-lg'>
        <CardTitle className='text-lg font-medium text-blue-900'>Mức giá gợi ý</CardTitle>
        <p className='text-sm text-blue-700'>Dựa trên các khóa học tương tự</p>
      </CardHeader>

      <CardContent className='space-y-3'>
        {suggestedPrices.map((item) => (
          <div
            key={item.price}
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              Number(coursePrice) === item.price
                ? 'border-blue-500 bg-blue-100'
                : 'border-blue-200 hover:border-blue-400'
            }`}
            onClick={() => setCoursePrice(item.price)}
          >
            <div className='flex items-center justify-between'>
              <div>
                <div className='flex items-center space-x-2'>
                  <span className='text-base font-semibold text-blue-900'>{item.price.toLocaleString()} VNĐ</span>
                  <Badge variant='outline' className='text-xs border-green-700 text-green-700'>
                    {item.tier}
                  </Badge>
                </div>
                <p className='text-sm text-blue-700 mt-1'>{item.description}</p>
              </div>
              {Number(coursePrice) === item.price && <CheckCircle className='h-5 w-5 text-green-600' />}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default SuggestedPrice
