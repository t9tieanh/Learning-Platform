import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight, Zap, Target } from 'lucide-react'
import CustomDialog from '@/components/common/Dialog'
import CustomButton from '@/components/common/Button'
import promotionImg from '@/assets/images/cover-create-course.jpg'
import logo from '@/assets/images/logo1.png'

import { useAuthStore } from '@/stores/useAuth.stores'

interface CourseCreationPromotionProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const CourseCreationPromotion: React.FC<CourseCreationPromotionProps> = ({ open, onOpenChange }) => {
    const navigate = useNavigate()
    const { data } = useAuthStore()
    const isLoggedIn = !!data

    const handleAction = () => {
        onOpenChange(false)
        if (isLoggedIn) {
            navigate('/teacher/course?openCreate=true')
        } else {
            navigate('/auth')
        }
    }

    return (
        <CustomDialog
            open={open}
            setOpen={onOpenChange}
            title='Quảng cáo tạo khóa học'
            hideHeader
            noPadding
            size='xl'
            className='w-[95vw] max-w-4xl p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-[2.5rem] gap-0 border-none'
            contentClassName='my-0 w-full'
        >
            <div className='flex flex-col md:flex-row h-auto md:h-[560px] max-h-[90vh] overflow-y-auto md:overflow-hidden'>
                {/* Left Side: Visual Image */}
                <div className='w-full md:w-[42%] h-[240px] md:h-full relative overflow-hidden group shrink-0'>
                    <img
                        src={promotionImg}
                        alt='Become an Instructor'
                        className='w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-blue-900/60 via-transparent to-transparent' />

                    <div className='absolute bottom-6 left-6 right-6 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[1.5rem] shadow-2xl'>
                        <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/40 shrink-0'>
                                <Sparkles className='w-5 h-5 text-white' />
                            </div>
                            <div className='flex flex-col'>
                                <span className='text-white font-black text-[13px] tracking-tight'>Biên soạn bài giảng</span>
                                <span className='text-blue-100/60 text-[9px] font-bold uppercase tracking-widest'>Thiết kế nội dung tinh gọn</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Content Form */}
                <div className='flex-1 p-8 md:p-14 flex flex-col justify-center relative bg-white'>
                    <div className='absolute top-0 right-0 w-64 h-64 bg-blue-50/30 rounded-bl-full -z-10 blur-3xl' />

                    <div className='flex flex-col gap-6 md:gap-8'>
                        <div className='flex flex-col gap-4 md:gap-5'>
                            <div className='inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-blue-50/80 text-blue-600 border border-blue-100 w-fit'>
                                <Zap className='w-3 h-3 fill-blue-600' />
                                <span className='text-[9px] font-black uppercase tracking-[0.2em]'>Giảng viên tương lai</span>
                            </div>

                            <div className='space-y-3'>
                                <h2 className='text-2xl md:text-[38px] font-black text-gray-900 leading-[1.15] tracking-tight'>
                                    Biến Kiến Thức Thành <br />
                                    <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700'>
                                        Khóa Học Triệu View
                                    </span>
                                </h2>
                                <p className='text-gray-400 text-sm md:text-[14px] leading-relaxed font-semibold max-w-sm'>
                                    Sử dụng trợ lý AI chuyên nghiệp của Learnova để tối ưu hóa lộ trình dạy học chỉ trong vài phút.
                                </p>

                                <div className='pt-2 opacity-60'>
                                    <img src={logo} className='h-4 w-auto object-contain' alt='Learnova Logo' />
                                </div>
                            </div>
                        </div>

                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <div className='flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50/50 border border-gray-100/80 hover:bg-white hover:border-blue-100 hover:shadow-sm transition-all duration-300 group'>
                                <div className='w-9 h-9 rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-sm border border-gray-50 group-hover:bg-blue-600 group-hover:text-white transition-colors'>
                                    <Target className='w-4 h-4' />
                                </div>
                                <span className='text-[11px] font-black text-gray-800 tracking-tight'>Lên kế hoạch</span>
                            </div>
                            <div className='flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50/50 border border-gray-100/80 hover:bg-white hover:border-indigo-100 hover:shadow-sm transition-all duration-300 group'>
                                <div className='w-9 h-9 rounded-lg bg-white flex items-center justify-center text-indigo-600 shadow-sm border border-gray-50 group-hover:bg-indigo-600 group-hover:text-white transition-colors'>
                                    <Sparkles className='w-4 h-4' />
                                </div>
                                <span className='text-[11px] font-black text-gray-800 tracking-tight'>Sáng tạo content</span>
                            </div>
                        </div>

                        <div className='pt-2'>
                            <CustomButton
                                onClick={handleAction}
                                label={isLoggedIn ? 'Bắt đầu tạo khóa học ngay' : 'Đăng nhập để bắt đầu'}
                                icon={<ArrowRight className='w-4.5 h-4.5' />}
                                className='w-full h-14 md:h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[14px] md:text-[15px] font-black shadow-xl shadow-blue-100 transition-all hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3'
                            />
                        </div>
                    </div>
                </div>
            </div>
        </CustomDialog>
    )
}

export default CourseCreationPromotion
