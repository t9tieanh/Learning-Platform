import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/utils/common/formatPrice'

const formatPercent = (rate: number) =>
  new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(rate * 100)

const PreviewPrice = ({
  coursePriceVnd,
  yourIncomeVnd,
  platformFeeRate
}: {
  coursePriceVnd: number
  yourIncomeVnd: number
  platformFeeRate: number
}) => {
  const instructorRate = 1 - platformFeeRate

  return (
    <div>
      <Card className='border-2 border-white ring-1 ring-gray-100 shadow-sm bg-white rounded-[32px] overflow-hidden'>
        <CardHeader className='pb-4 border-b border-gray-50/50'>
          <CardTitle className='text-[15px] font-bold text-gray-900 flex items-center gap-2.5'>
            <div className='p-2 bg-blue-50/50 rounded-xl text-blue-600 border border-blue-50'>
              <TrendingUp className='h-4 w-4' />
            </div>
            <div className='flex flex-col'>
              <span>Phân tích thu nhập</span>
              <p className='text-[11px] font-medium text-gray-400 mt-0.5'>Ước tính doanh thu cho mỗi lượt bán</p>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className='space-y-4 pt-6'>
          <div className='space-y-2.5'>
            <div className='flex justify-between items-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100 transition-all hover:bg-white hover:border-blue-100 group'>
              <span className='text-[13px] font-bold text-gray-400 uppercase tracking-tight'>Mức giá niêm yết</span>
              <span className='text-[15px] font-black text-gray-900'>{formatCurrency(coursePriceVnd)}</span>
            </div>
            <div className='flex justify-between items-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100'>
              <span className='text-[13px] font-bold text-gray-400 uppercase tracking-tight'>Chiết khấu nền tảng</span>
              <span className='text-[13px] font-bold text-red-400'>- {formatPercent(platformFeeRate)}%</span>
            </div>
          </div>

          <div className='flex justify-between items-center p-5 bg-emerald-50/50 rounded-[24px] border border-emerald-100/50 shadow-sm shadow-emerald-100/20'>
            <span className='text-[13px] font-black text-emerald-700 uppercase tracking-widest'>Bạn thực nhận</span>
            <span className='text-[17px] font-black text-emerald-600'>{formatCurrency(yourIncomeVnd)}</span>
          </div>

          <div className='pt-5 border-t border-gray-50'>
            <h4 className='text-[11px] font-black text-gray-900 uppercase tracking-widest mb-4'>Cơ chế chia sẻ doanh thu</h4>
            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <span className='text-[13px] font-medium text-gray-400'>Tỷ lệ giảng viên</span>
                <span className='text-[13px] font-black text-gray-700 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100'>
                  {formatPercent(instructorRate)}%
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-[13px] font-medium text-gray-400'>Tỷ lệ Learnova</span>
                <span className='text-[13px] font-black text-gray-700 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100'>
                  {formatPercent(platformFeeRate)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PreviewPrice
