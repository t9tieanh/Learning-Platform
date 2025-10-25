import { useState } from 'react'
import { Button } from '@/components/ui/button'
import TitleComponent from '@/components/TC_CreateCourse/common/Title'
import PriceForm from '@/components/TC_CreateCourse/PricingForm/PriceForm'
import SuggestedPrice from '@/components/TC_CreateCourse/PricingForm/SuggestedPrice'
import Orientation from '@/components/TC_CreateCourse/PricingForm/Orientation'
import PreviewPrice from '@/components/TC_CreateCourse/PricingForm/PreviewPrice'

const PricingForm = () => {
  const [coursePrice, setCoursePrice] = useState<number>(480000)
  const [currency, setCurrency] = useState('VND')

  const suggestedPrices = [
    { price: 480000, tier: 'Cơ bản', description: 'Phù hợp cho khóa học ngắn' },
    { price: 1_200_000, tier: 'Tiêu chuẩn', description: 'Mức giá phổ biến nhất' },
    { price: 2_400_000, tier: 'Nâng cao', description: 'Dành cho khóa học toàn diện' },
    { price: 4_800_000, tier: 'Chuyên nghiệp', description: 'Cho nội dung cấp chuyên gia' }
  ]

  const calculateEarnings = (price: number) => {
    if (isNaN(price)) return { instructor: '0.00', udemy: '0.00' }

    const instructorShare = price * 0.63
    const udemyShare = price * 0.37

    return {
      instructor: instructorShare.toFixed(2),
      udemy: udemyShare.toFixed(2)
    }
  }

  const earnings = calculateEarnings(coursePrice)

  return (
    <div className='max-w-6xl space-y-8 mx-auto'>
      <TitleComponent
        title='Đặt giá khóa học'
        description='Đặt giá cho khóa học của bạn hoặc làm cho nó miễn phí. Bạn có thể thay đổi giá bất kỳ lúc nào, nhưng lưu ý
          rằng sau khi xuất bản khóa học, bạn không thể đổi từ trả phí sang miễn phí. Vui lòng chọn loại tiền tệ và mức
          giá cho khóa học.'
      />

      <div className='grid lg:grid-cols-2 gap-8'>
        <div className='space-y-6'>
          <PriceForm
            currency={currency}
            setCurrency={setCurrency}
            coursePrice={coursePrice}
            setCoursePrice={setCoursePrice}
          />
          <SuggestedPrice suggestedPrices={suggestedPrices} coursePrice={coursePrice} setCoursePrice={setCoursePrice} />
        </div>

        <div className='space-y-6'>
          <PreviewPrice earnings={earnings} coursePrice={coursePrice} />
          <Orientation />
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
