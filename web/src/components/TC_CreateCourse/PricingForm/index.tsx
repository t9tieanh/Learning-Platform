import { useCallback, useEffect, useMemo, useState } from 'react'
import TitleComponent from '@/components/TC_CreateCourse/common/Title'
import PriceForm from '@/components/TC_CreateCourse/PricingForm/PriceForm'
import PreviewPrice from '@/components/TC_CreateCourse/PricingForm/PreviewPrice'
import { PriceFormSchema, PriceFormValues } from '@/utils/create-course/price'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import courseService from '@/services/course/course.service'
import PricingFormSkeleton from './Skeleton/PricingFormSkeleton'
import { Layout } from 'lucide-react'

const DEFAULT_PLATFORM_FEE_RATE = 0.2

const PricingForm = ({ id }: { id: string }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors }
  } = useForm<PriceFormValues>({
    resolver: yupResolver(PriceFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      originalPrice: 100,
      finalPrice: 50
    }
  })
  const [currency, setCurrency] = useState('VND')
  const [platformFeeRate, setPlatformFeeRate] = useState(DEFAULT_PLATFORM_FEE_RATE)
  const [loading, setLoading] = useState(true)

  const finalPriceThousands = watch('finalPrice')

  const getPrice = useCallback(async () => {
    setLoading(true)
    try {
      const response = await courseService.getPrice(id)
      if (response?.code === 200 && response.result) {
        const { originalPrice, finalPrice, platformFee } = response.result
        setValue('originalPrice', originalPrice / 1000)
        setValue('finalPrice', finalPrice / 1000)
        if (typeof platformFee === 'number' && platformFee > 0 && platformFee < 1) {
          setPlatformFeeRate(platformFee)
        }
      }
    } catch (error) {
      console.error('Error fetching price:', error)
    } finally {
      setLoading(false)
    }
  }, [id, setValue])

  useEffect(() => {
    getPrice()
  }, [getPrice])

  const finalPriceVnd = useMemo(() => {
    const value = Number(finalPriceThousands)
    if (!Number.isFinite(value) || value <= 0) return 0
    return value * 1000
  }, [finalPriceThousands])

  const yourIncomeVnd = useMemo(() => {
    return Math.round(finalPriceVnd * (1 - platformFeeRate))
  }, [finalPriceVnd, platformFeeRate])

  if (loading) {
    return <PricingFormSkeleton />
  }

  return (
    <div className='max-w-7xl w-full mx-auto space-y-12 px-4 sm:px-6 md:px-8 py-10 md:py-12 rounded-[48px] bg-[#f8fafc] border-2 border-white shadow-sm'>
      <TitleComponent
        title='Cấu hình giá khóa học'
        icon={<Layout className='h-6 w-6 text-white' />}
        description='Đặt giá cho khóa học của bạn hoặc làm cho nó miễn phí. Bạn có thể thay đổi giá bất kỳ lúc nào để thu hút học viên và tối ưu hóa doanh thu cá nhân.'
      />

      <div className='grid lg:grid-cols-2 gap-8'>
        <div className='space-y-6'>
          <PriceForm
            currency={currency}
            setCurrency={setCurrency}
            register={register}
            errors={errors}
            setValue={setValue}
            trigger={trigger}
            courseId={id}
            handleSubmit={handleSubmit}
            onPriceUpdated={getPrice}
          />
        </div>

        <div className='space-y-6'>
          <PreviewPrice
            coursePriceVnd={finalPriceVnd}
            yourIncomeVnd={yourIncomeVnd}
            platformFeeRate={platformFeeRate}
          />
        </div>
      </div>
    </div>
  )
}

export default PricingForm
