/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, Users, CheckCircle } from 'lucide-react'

const PricingForm = () => {
  const [coursePrice, setCoursePrice] = useState('59.99')
  const [currency, setCurrency] = useState('USD')
  const [freePromoEnabled, setFreePromoEnabled] = useState(false)
  const [discountEnabled, setDiscountEnabled] = useState(false)
  const [discountPrice, setDiscountPrice] = useState('39.99')

  const suggestedPrices = [
    { price: '19.99', tier: 'Cơ bản', description: 'Phù hợp cho khóa học ngắn' },
    { price: '49.99', tier: 'Tiêu chuẩn', description: 'Mức giá phổ biến nhất' },
    { price: '99.99', tier: 'Nâng cao', description: 'Dành cho khóa học toàn diện' },
    { price: '199.99', tier: 'Chuyên nghiệp', description: 'Cho nội dung cấp chuyên gia' }
  ]

  const marketingTools = [
    {
      name: 'Khuyến mãi miễn phí',
      description: 'Cung cấp khóa học miễn phí trong thời gian giới hạn để thu hút đánh giá',
      enabled: freePromoEnabled,
      onToggle: setFreePromoEnabled
    },
    {
      name: 'Giá khuyến mãi',
      description: 'Đặt giá ưu đãi để tăng số lượng học viên',
      enabled: discountEnabled,
      onToggle: setDiscountEnabled
    }
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
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-4'>Định giá</h1>
        <p className='text-muted-foreground text-lg mb-6'>
          Đặt giá cho khóa học của bạn hoặc làm cho nó miễn phí. 
          Bạn có thể thay đổi giá bất kỳ lúc nào, nhưng lưu ý rằng sau khi xuất bản khóa học, 
          bạn không thể đổi từ trả phí sang miễn phí. 
          Vui lòng chọn loại tiền tệ và mức giá cho khóa học.
        </p>
      </div>

      <div className='grid lg:grid-cols-2 gap-8'>
        {/* Thiết lập giá */}
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <DollarSign className='h-5 w-5 text-primary' />
                <span>Giá khóa học</span>
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='currency'>Tiền tệ</Label>
                  <select
                    id='currency'
                    className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value='USD'>USD - Đô la Mỹ</option>
                    <option value='EUR'>EUR - Euro</option>
                    <option value='GBP'>GBP - Bảng Anh</option>
                    <option value='JPY'>JPY - Yên Nhật</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor='price'>Giá</Label>
                  <div className='relative'>
                    <Input
                      id='price'
                      type='number'
                      step='0.01'
                      min='0'
                      max='200'
                      value={coursePrice}
                      onChange={(e) => setCoursePrice(e.target.value)}
                      className='pl-8'
                    />
                    <span className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>$</span>
                  </div>
                </div>
              </div>

              <div className='text-sm text-muted-foreground'>Giá phải nằm trong khoảng $9.99 đến $199.99</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mức giá gợi ý</CardTitle>
              <p className='text-sm text-muted-foreground'>Dựa trên các khóa học tương tự</p>
            </CardHeader>
            <CardContent className='space-y-3'>
              {suggestedPrices.map((item) => (
                <div
                  key={item.price}
                  className={`p-3 rounded-lg border cursor-pointer ${
                    coursePrice === item.price
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                  onClick={() => setCoursePrice(item.price)}
                >
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='flex items-center space-x-2'>
                        <span className='font-medium'>${item.price}</span>
                        <Badge variant='outline' className='text-xs'>
                          {item.tier}
                        </Badge>
                      </div>
                      <p className='text-sm text-muted-foreground mt-1'>{item.description}</p>
                    </div>
                    {coursePrice === item.price && <CheckCircle className='h-5 w-5 text-primary' />}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Marketing & Khuyến mãi</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {marketingTools.map((tool) => (
                <div key={tool.name} className='flex items-center justify-between'>
                  <div className='flex-1'>
                    <h4 className='font-medium'>{tool.name}</h4>
                    <p className='text-sm text-muted-foreground'>{tool.description}</p>
                  </div>
                  <Switch checked={tool.enabled} onCheckedChange={tool.onToggle} />
                </div>
              ))}

              {discountEnabled && (
                <div className='mt-4 p-4 bg-muted/50 rounded-lg border'>
                  <Label htmlFor='discountPrice' className='text-sm font-medium'>
                    Giá khuyến mãi
                  </Label>
                  <div className='flex space-x-2 mt-2'>
                    <Input
                      id='discountPrice'
                      type='number'
                      step='0.01'
                      min='0'
                      value={discountPrice}
                      onChange={(e) => setDiscountPrice(e.target.value)}
                      className='flex-1'
                    />
                    <Button variant='outline' size='sm'>
                      Đặt thời gian
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Xem trước thu nhập */}
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <TrendingUp className='h-5 w-5 text-green-600' />
                <span>Phân tích thu nhập</span>
              </CardTitle>
              <p className='text-sm text-muted-foreground'>Ước tính thu nhập cho mỗi lượt bán</p>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-3'>
                <div className='flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200'>
                  <span className='font-medium text-green-900'>Thu nhập của bạn</span>
                  <span className='text-xl font-bold text-green-700'>${earnings.instructor}</span>
                </div>
                <div className='flex justify-between items-center p-3 bg-muted/50 rounded-lg'>
                  <span className='text-muted-foreground'>Phí nền tảng</span>
                  <span className='font-medium'>${earnings.udemy}</span>
                </div>
                <div className='flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20'>
                  <span className='font-medium text-primary'>Học viên trả</span>
                  <span className='text-xl font-bold text-primary'>${coursePrice}</span>
                </div>
              </div>

              <div className='pt-4 border-t'>
                <h4 className='font-medium mb-2'>Chi tiết chia sẻ doanh thu</h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Giảng viên nhận</span>
                    <span className='font-medium'>63%</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Phí nền tảng</span>
                    <span className='font-medium'>37%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mẹo chiến lược định giá</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-3'>
                <div className='flex items-start space-x-3'>
                  <CheckCircle className='h-5 w-5 text-green-600 mt-0.5' />
                  <div>
                    <h4 className='font-medium text-sm'>Nghiên cứu đối thủ</h4>
                    <p className='text-xs text-muted-foreground'>
                      Xem các khóa học tương tự để tìm mức giá hợp lý
                    </p>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <CheckCircle className='h-5 w-5 text-green-600 mt-0.5' />
                  <div>
                    <h4 className='font-medium text-sm'>Bắt đầu với khuyến mãi</h4>
                    <p className='text-xs text-muted-foreground'>
                      Dùng giảm giá để thu hút học viên và đánh giá ban đầu
                    </p>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <CheckCircle className='h-5 w-5 text-green-600 mt-0.5' />
                  <div>
                    <h4 className='font-medium text-sm'>Thử nhiều mức giá</h4>
                    <p className='text-xs text-muted-foreground'>
                      Bạn có thể điều chỉnh giá sau khi ra mắt dựa trên hiệu quả
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <Users className='h-5 w-5' />
                <span>Thông tin thị trường</span>
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='grid grid-cols-2 gap-4 text-center'>
                <div className='p-3 bg-muted/50 rounded-lg'>
                  <div className='text-lg font-bold'>$49.99</div>
                  <div className='text-xs text-muted-foreground'>Giá trung bình</div>
                </div>
                <div className='p-3 bg-muted/50 rounded-lg'>
                  <div className='text-lg font-bold'>2.4x</div>
                  <div className='text-xs text-muted-foreground'>Biên độ giá</div>
                </div>
              </div>
              <div className='text-xs text-muted-foreground text-center'>Dựa trên dữ liệu danh mục Web Development</div>
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
