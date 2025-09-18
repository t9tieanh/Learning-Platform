/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Users, CheckCircle } from 'lucide-react'

const PricingForm = () => {
  const [coursePrice, setCoursePrice] = useState('59.99')
  const [currency, setCurrency] = useState('USD')

  const suggestedPrices = [
    { price: 480000, tier: 'Cơ bản', description: 'Phù hợp cho khóa học ngắn' },
    { price: 1_200_000, tier: 'Tiêu chuẩn', description: 'Mức giá phổ biến nhất' },
    { price: 2_400_000, tier: 'Nâng cao', description: 'Dành cho khóa học toàn diện' },
    { price: 4_800_000, tier: 'Chuyên nghiệp', description: 'Cho nội dung cấp chuyên gia' }
  ]

  const calculateEarnings = (price: string) => {
    const numPrice = parseFloat(price)
    if (isNaN(numPrice)) return { instructor: '0.00', udemy: '0.00' }

    const instructorShare = numPrice * 0.63
    const udemyShare = numPrice * 0.37

    return {
      instructor: instructorShare.toFixed(2),
      udemy: udemyShare.toFixed(2)
    }
  }

  const earnings = calculateEarnings(coursePrice)

  return (
    <div className='max-w-6xl space-y-8'>
      <div className='bg-blue-950 text-white rounded-xl shadow-lg p-6'>
        <h1 className='text-2xl font-semibold mb-3 text-blue-300'>Đặt giá khóa học</h1>
        <p className='text-blue-100 text-base leading-relaxed'>
          Đặt giá cho khóa học của bạn hoặc làm cho nó miễn phí. Bạn có thể thay đổi giá bất kỳ lúc nào, nhưng lưu ý
          rằng sau khi xuất bản khóa học, bạn không thể đổi từ trả phí sang miễn phí. Vui lòng chọn loại tiền tệ và mức
          giá cho khóa học.
        </p>
      </div>

      <div className='grid lg:grid-cols-2 gap-8'>
        <div className='space-y-6'>
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
                    <option value='EUR'>VND - Việt Nam Đồng</option>
                    <option value='USD'>USD - Đô la Mỹ</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor='price' className='text-blue-900 mb-2'>
                    Giá
                  </Label>
                  <div className='relative mt-2'>
                    <Input
                      id='price'
                      type='number'
                      step='0.01'
                      min='0'
                      max='200'
                      value={coursePrice}
                      onChange={(e) => setCoursePrice(e.target.value)}
                      className='pl-8 h-10 border-blue-300 focus:ring-2 focus:ring-blue-400'
                    />
                    <span className='absolute left-3 top-1/2 -translate-y-1/2 text-blue-500'>$</span>
                  </div>
                </div>
              </div>

              <div className='text-sm text-blue-700'>Giá phải nằm trong khoảng $9.99 đến $199.99</div>
            </CardContent>
          </Card>

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
                    coursePrice === item.price ? 'border-blue-500 bg-blue-100' : 'border-blue-200 hover:border-blue-400'
                  }`}
                  onClick={() => setCoursePrice(item.price)}
                >
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='flex items-center space-x-2'>
                        <span className='text-base font-semibold text-blue-900'>{item.price} VND</span>
                        <Badge variant='outline' className='text-xs border-green-700 text-green-700'>
                          {item.tier}
                        </Badge>
                      </div>
                      <p className='text-sm text-blue-700 mt-1'>{item.description}</p>
                    </div>
                    {coursePrice === item.price && <CheckCircle className='h-5 w-5 text-green-600' />}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Xem trước thu nhập */}
        <div className='space-y-6'>
          <Card className='border border-blue-200 shadow-sm bg-blue-50'>
            <CardHeader className='bg-blue-200/40 rounded-t-lg'>
              <CardTitle className='text-lg font-medium text-blue-900 flex items-center space-x-2'>
                <TrendingUp className='h-5 w-5 text-blue-600' />
                <span>Phân tích thu nhập</span>
              </CardTitle>
              <p className='text-sm text-blue-700'>Ước tính thu nhập cho mỗi lượt bán</p>
            </CardHeader>

            <CardContent className='space-y-4'>
              <div className='space-y-3'>
                <div className='flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200'>
                  <span className='text-base text-green-900'>Thu nhập của bạn</span>
                  <span className='text-base font-semibold text-green-700'>{earnings.instructor.toLocaleString()} VNĐ</span>
                </div>

                <div className='flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200'>
                  <span className='text-base text-yellow-600'>Phí nền tảng</span>
                  <span className='text-base font-semibold text-yellow-600'>{earnings.udemy.toLocaleString()} VNĐ</span>
                </div>

                <div className='flex justify-between items-center p-3 bg-blue-200/30 rounded-lg border border-blue-300'>
                  <span className='text-base text-blue-900'>Học viên trả</span>
                  <span className='text-base font-semibold text-blue-800'>{coursePrice.toLocaleString()} VNĐ</span>
                </div>
              </div>

              <div className='pt-4 border-t border-blue-200'>
                <h4 className='text-lg font-bold mb-2 text-blue-900'>Chi tiết chia sẻ doanh thu</h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-blue-700'>Giảng viên nhận</span>
                    <span className='font-medium text-blue-900'>63%</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-blue-700'>Phí nền tảng</span>
                    <span className='font-medium text-blue-900'>37%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='border border-blue-200 shadow-sm bg-blue-50'>
            <CardHeader className='bg-blue-200/40 rounded-t-lg'>
              <CardTitle className='text-lg font-medium text-blue-900'>Mẹo chiến lược định giá</CardTitle>
            </CardHeader>

            <CardContent className='space-y-4'>
              <div className='space-y-3'>
                <div className='flex items-start space-x-3'>
                  <CheckCircle className='h-5 w-5 text-green-600 mt-0.5' />
                  <div>
                    <h4 className='font-medium text-sm text-blue-900'>Nghiên cứu đối thủ</h4>
                    <p className='text-xs text-blue-700'>Xem các khóa học tương tự để tìm mức giá hợp lý</p>
                  </div>
                </div>

                <div className='flex items-start space-x-3'>
                  <CheckCircle className='h-5 w-5 text-green-600 mt-0.5' />
                  <div>
                    <h4 className='font-medium text-sm text-blue-900'>Bắt đầu với khuyến mãi</h4>
                    <p className='text-xs text-blue-700'>Dùng giảm giá để thu hút học viên và đánh giá ban đầu</p>
                  </div>
                </div>

                <div className='flex items-start space-x-3'>
                  <CheckCircle className='h-5 w-5 text-green-600 mt-0.5' />
                  <div>
                    <h4 className='font-medium text-sm text-blue-900'>Thử nhiều mức giá</h4>
                    <p className='text-xs text-blue-700'>Bạn có thể điều chỉnh giá sau khi ra mắt dựa trên hiệu quả</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Nút hành động */}
      <div className='flex justify-between pt-6 border-t'>
        <Button variant='outline'>Quay lại</Button>
        <div className='space-x-3'>
          <Button variant='outline'>Lưu bản nháp</Button>
          <Button className='bg-primary hover:bg-primary/90'>Tiếp tục</Button>
        </div>
      </div>
    </div>
  )
}

export default PricingForm
