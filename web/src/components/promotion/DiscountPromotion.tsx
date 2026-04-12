import React, { useEffect, useState } from 'react'
import { Ticket, ArrowRight, Tag, Percent, Sparkles, Clock } from 'lucide-react'
import CustomDialog from '@/components/common/Dialog'
import CustomButton from '@/components/common/Button'
import discountService from '@/services/sale/discount.service'
import { toast } from 'sonner'
import bannerImg from '@/assets/images/cover-discount.jpg'
import logo from '@/assets/images/logo1.png'

interface Discount {
    id: string
    name: string
    code: string
    value: number
    type: 'Percent' | 'Amount'
    endDate: string
}

interface DiscountPromotionProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const DiscountPromotion: React.FC<DiscountPromotionProps> = ({ open, onOpenChange }) => {
    const [discounts, setDiscounts] = useState<Discount[]>([])
    const [selectedDiscountId, setSelectedDiscountId] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            const fetchDiscounts = async () => {
                setLoading(true)
                try {
                    const res = await discountService.getAllValidDiscounts()
                    if (res && res.result && res.result.length > 0) {
                        setDiscounts(res.result)
                        setSelectedDiscountId(res.result[0].id)
                    }
                } catch (error) {
                    console.error('Failed to fetch discounts', error)
                } finally {
                    setLoading(false)
                }
            }
            fetchDiscounts()
        }
    }, [open])

    if (discounts.length === 0 && !loading) return null

    const selectedDiscount = discounts.find(d => d.id === selectedDiscountId) || discounts[0]
    const otherDiscounts = discounts.filter(d => d.id !== selectedDiscountId).slice(0, 4)

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code)
        toast.success(`Đã sao chép mã: ${code}`)
    }

    return (
        <CustomDialog
            open={open}
            setOpen={onOpenChange}
            title='Ưu đãi đặc biệt'
            hideHeader
            noPadding
            size='xl'
            className='w-[95vw] max-w-4xl p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-[2.5rem] border-none'
            contentClassName='my-0 w-full'
        >
            <div className='flex flex-col md:flex-row h-auto md:h-[580px] max-h-[90vh] overflow-hidden'>
                <div className='w-full md:w-1/2 h-[240px] md:h-full relative overflow-hidden flex-shrink-0 group'>
                    <img
                        src={bannerImg}
                        className='w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105'
                        alt='Discounts'
                    />
                    <div className='absolute top-6 left-6 px-3 py-2 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 z-10'>
                        <img src={logo} className='h-5 w-auto object-contain' alt='Learnova Logo' />
                    </div>
                    <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent' />
                </div>

                <div className='flex-1 p-8 md:p-14 flex flex-col justify-between relative bg-white'>
                    <div className='space-y-10'>
                        <div className='flex flex-col gap-6 transition-all duration-300'>
                            <div className='flex items-center gap-3'>
                                <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100'>
                                    <Sparkles className='w-3 h-3' />
                                    <span className='text-[10px] font-bold uppercase tracking-widest'>Đang chọn</span>
                                </div>
                                {selectedDiscount && (
                                    <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-100'>
                                        <Clock className='w-3 h-3' />
                                        <span className='text-[10px] font-bold uppercase tracking-widest'>Hết hạn sớm</span>
                                    </div>
                                )}
                            </div>

                            {selectedDiscount ? (
                                <div className='space-y-4 animate-in fade-in slide-in-from-left-2 duration-300'>
                                    <h2 className='text-3xl md:text-[44px] font-black text-gray-900 leading-[1.1] tracking-tight transition-all'>
                                        Giảm ngay <span className='text-blue-600'>
                                            {selectedDiscount.type === 'Percent' ? `${selectedDiscount.value}%` : `${selectedDiscount.value.toLocaleString()}đ`}
                                        </span> <br />
                                        cho mọi khóa học
                                    </h2>
                                    <p className='text-gray-400 text-[15px] font-semibold tracking-tight'>
                                        Ưu đãi áp dụng khi nhập mã <span className='text-blue-600 font-bold'>{selectedDiscount.code}</span> tại bước thanh toán.
                                    </p>
                                </div>
                            ) : (
                                <div className='h-32 flex items-center justify-center bg-gray-50 rounded-3xl'>
                                    <span className='text-gray-300 font-bold'>Đang tải...</span>
                                </div>
                            )}
                        </div>

                        {otherDiscounts.length > 0 && (
                            <div className='space-y-4'>
                                <p className='text-[11px] font-black text-gray-300 uppercase tracking-[0.2em]'>Các ưu đãi khác</p>
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                    {otherDiscounts.map((d) => (
                                        <div
                                            key={d.id}
                                            onClick={() => setSelectedDiscountId(d.id)}
                                            className='flex items-center justify-between p-4 rounded-[1.25rem] bg-white border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group shadow-sm active:scale-[0.98]'
                                        >
                                            <div className='flex items-center gap-3'>
                                                <div className='w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors'>
                                                    <Tag className='w-4 h-4' />
                                                </div>
                                                <div className='flex flex-col'>
                                                    <span className='text-[13px] font-black text-gray-800 leading-none'>{d.type === 'Percent' ? `${d.value}%` : `${Math.floor(d.value / 1000)}k`}</span>
                                                    <span className='text-[10px] font-bold text-blue-600'>{d.code}</span>
                                                </div>
                                            </div>
                                            <ArrowRight className='w-3.5 h-3.5 text-gray-300 group-hover:text-blue-600 transition-colors' />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className='pt-10 flex flex-col gap-5'>
                        {selectedDiscount && (
                            <CustomButton
                                onClick={() => handleCopyCode(selectedDiscount.code)}
                                label={`Sao chép mã: ${selectedDiscount.code}`}
                                icon={<ArrowRight className='w-4.5 h-4.5' />}
                                className='w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] text-[15px] font-black shadow-xl shadow-blue-100 transition-all hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3.5'
                            />
                        )}
                        <CustomButton
                            variant='ghost'
                            onClick={() => onOpenChange(false)}
                            label='Để sau'
                            className='text-[13px] font-bold text-gray-400 hover:text-blue-600 hover:bg-transparent transition-colors tracking-tight h-auto p-0'
                        />
                    </div>
                </div>
            </div>
        </CustomDialog>
    )
}

export default DiscountPromotion
