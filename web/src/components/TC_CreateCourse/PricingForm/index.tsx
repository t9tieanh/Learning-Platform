import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import TitleComponent from '@/components/TC_CreateCourse/common/Title'
import PriceForm from '@/components/TC_CreateCourse/PricingForm/PriceForm'
import SuggestedPrice from '@/components/TC_CreateCourse/PricingForm/SuggestedPrice'
import Orientation from '@/components/TC_CreateCourse/PricingForm/Orientation'
import PreviewPrice from '@/components/TC_CreateCourse/PricingForm/PreviewPrice'
import { PriceFormSchema, PriceFormValues } from '@/utils/create-course/price'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import courseService from '@/services/course/course.service'
import PricingFormSkeleton from './Skeleton/PricingFormSkeleton'

const PricingForm = ({ id }: { id: string }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors }
  } = useForm<PriceFormValues>({
    resolver: yupResolver(PriceFormSchema),
    defaultValues: {
      originalPrice: 50000,
      finalPrice: 50000
    }
  })
  const [currency, setCurrency] = useState('VND')
  const [yourIncome, setYourIncome] = useState(0)
  const [platformFee, setPlatformFee] = useState(0)
  const [loading, setLoading] = useState(true)

  const suggestedPrices = [
    { price: 480000, tier: 'Cơ bản', description: 'Phù hợp cho khóa học ngắn' },
    { price: 1_200_000, tier: 'Tiêu chuẩn', description: 'Mức giá phổ biến nhất' },
    { price: 2_400_000, tier: 'Nâng cao', description: 'Dành cho khóa học toàn diện' },
    { price: 4_800_000, tier: 'Chuyên nghiệp', description: 'Cho nội dung cấp chuyên gia' }
  ]

  const getPrice = async () => {
    setLoading(true)
    try {
      const response = await courseService.getPrice(id)
      if (response && response.code === 200 && response.result) {
        const { originalPrice, finalPrice, yourIncome, platformFee } = response.result
        setValue('originalPrice', originalPrice / 1000)
        setValue('finalPrice', finalPrice / 1000)
        setYourIncome(yourIncome / 1000)
        setPlatformFee(platformFee / 1000)
      }
    } catch (error) {
      console.log('Error fetching price:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getPrice()
  }, [id])

  if (loading) {
    return <PricingFormSkeleton />
  }

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
            register={register}
            errors={errors}
            setValue={setValue}
            courseId={id}
            handleSubmit={handleSubmit}
          />
        </div>

        <div className='space-y-6'>
          <PreviewPrice coursePrice={getValues('finalPrice')} yourIncome={yourIncome} platformFee={platformFee} />
        </div>
      </div>
    </div>
  )
}

export default PricingForm
