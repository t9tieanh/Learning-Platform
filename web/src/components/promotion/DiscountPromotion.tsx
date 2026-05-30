import React, { useEffect, useState } from 'react'
import { ArrowRight, Tag, Percent, Sparkles, Clock } from 'lucide-react'
import CustomDialog from '@/components/common/Dialog'
import CustomButton from '@/components/common/Button'
import discountService from '@/services/sale/discount.service'
import { toast } from 'sonner'
import bannerImg from '@/assets/images/cover-discount.jpg'

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
            <div className='flex flex-col md:flex-row h-auto md:h-[600px] max-h-[90vh] overflow-y-auto md:overflow-hidden'>
                {/* Left Side: Visual Image */}
                <div className='w-full md:w-[45%] h-[220px] md:h-full relative overflow-hidden flex-shrink-0 group'>
                    <img
                        src={bannerImg}
                        className='w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105'
                        alt='Discounts'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />
                    <div className='absolute bottom-6 left-6 right-6'>
                        <div className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white'>
                            <Sparkles className='w-3.5 h-3.5 text-blue-400' />
                            <span className='text-[10px] font-black uppercase tracking-widest'>Ưu đãi giới hạn</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Content Form */}
                <div className='flex-1 p-8 md:p-12 lg:p-14 flex flex-col justify-between relative bg-white'>
                    <div className='space-y-8 md:space-y-10'>
                        <div className='flex flex-col gap-5 transition-all duration-300'>
                            <div className='flex items-center gap-3'>
                                <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100'>
                                    <Tag className='w-3 h-3' />
                                    <span className='text-[9px] md:text-[10px] font-black uppercase tracking-widest'>Đang chọn</span>
                                </div>
                                {selectedDiscount && (
                                    <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-100'>
                                        <Clock className='w-3 h-3' />
                                        <span className='text-[9px] md:text-[10px] font-black uppercase tracking-widest'>Sắp hết hạn</span>
                                    </div>
                                )}
                            </div>

                            {selectedDiscount ? (
                                <div className='space-y-4 animate-in fade-in slide-in-from-left-4 duration-500'>
                                    <h2 className='text-3xl md:text-[40px] lg:text-[44px] font-black text-gray-900 leading-[1.1] tracking-tight'>
                                        Giảm ngay <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600'>
                                            {selectedDiscount.type === 'Percent' ? `${selectedDiscount.value}%` : `${selectedDiscount.value.toLocaleString()}đ`}
                                        </span> <br />
                                        cho bài học đầu
                                    </h2>
                                    <p className='text-gray-400 text-sm md:text-[15px] font-semibold tracking-tight leading-relaxed max-w-sm'>
                                        Khám phá tri thức cùng Learnova với mã ưu đãi <span className='text-blue-600 font-black'>{selectedDiscount.code}</span> áp dụng ngay hôm nay.
                                    </p>
                                </div>
                            ) : (
                                <div className='h-32 flex items-center justify-center bg-gray-50 rounded-3xl animate-pulse'>
                                    <span className='text-gray-300 font-bold'>Đang chuẩn bị ưu đãi...</span>
                                </div>
                            )}
                        </div>

                        {otherDiscounts.length > 0 && (
                            <div className='space-y-4'>
                                <p className='text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] ml-1'>Ưu đãi khả dụng khác</p>
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                    {otherDiscounts.map((d) => (
                                        <div
                                            key={d.id}
                                            onClick={() => setSelectedDiscountId(d.id)}
                                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group shadow-sm active:scale-[0.97] ${selectedDiscountId === d.id
                                                ? 'bg-blue-50 border-blue-200'
                                                : 'bg-white border-gray-100 hover:border-blue-100 hover:bg-blue-50/20'
                                                }`}
                                        >
                                            <div className='flex items-center gap-3'>
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${selectedDiscountId === d.id ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                                                    }`}>
                                                    <Percent className='w-4 h-4' />
                                                </div>
                                                <div className='flex flex-col'>
                                                    <span className='text-[13px] font-black text-gray-800 leading-none'>
                                                        {d.type === 'Percent' ? `${d.value}%` : `${Math.floor(d.value / 1000)}k`}
                                                    </span>
                                                    <span className='text-[10px] font-bold text-blue-500 mt-1 uppercase'>{d.code}</span>
                                                </div>
                                            </div>
                                            <ArrowRight className={`w-3.5 h-3.5 transition-colors ${selectedDiscountId === d.id ? 'text-blue-600' : 'text-gray-300 group-hover:text-blue-600'
                                                }`} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className='pt-8 md:pt-10 flex flex-col gap-4'>
                        {selectedDiscount && (
                            <CustomButton
                                onClick={() => handleCopyCode(selectedDiscount.code)}
                                label={`Nhận mã: ${selectedDiscount.code}`}
                                icon={<ArrowRight className='w-4.5 h-4.5' />}
                                className='w-full h-15 md:h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.25rem] text-[15px] font-black shadow-xl shadow-blue-500/10 transition-all hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3.5'
                            />
                        )}
                    </div>
                </div>
            </div>
        </CustomDialog>
    )
}

export default DiscountPromotion
