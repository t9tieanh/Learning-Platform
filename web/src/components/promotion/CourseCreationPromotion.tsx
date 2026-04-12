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
            <div className='flex flex-col md:flex-row h-auto md:h-[540px] max-h-[90vh] overflow-hidden'>
                <div className='w-full md:w-[45%] h-[240px] md:h-full relative overflow-hidden group'>
                    <img
                        src={promotionImg}
                        alt='Become an Instructor'
                        className='w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105'
                    />
                    <div className='absolute top-6 left-6 px-3 py-2 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 z-10'>
                        <img src={logo} className='h-5 w-auto object-contain' alt='Learnova Logo' />
                    </div>
                    <div className='absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-transparent' />

                    <div className='absolute bottom-8 left-8 right-8 p-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-2xl'>
                        <div className='flex items-center gap-4'>
                            <div className='w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/40'>
                                <Sparkles className='w-6 h-6 text-white' />
                            </div>
                            <div className='flex flex-col gap-0.5'>
                                <span className='text-white font-extrabold text-[15px] tracking-tight'>AI Powered Tools</span>
                                <span className='text-blue-100/60 text-[10px] font-bold uppercase tracking-widest'>Smart Content Builder</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='flex-1 p-10 md:p-16 flex flex-col justify-center relative bg-white'>
                    <div className='absolute top-0 right-0 w-64 h-64 bg-blue-50/30 rounded-bl-full -z-10 blur-3xl' />

                    <div className='flex flex-col gap-9'>
                        <div className='flex flex-col gap-5'>
                            <div className='inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-50/80 text-blue-600 border border-blue-100 w-fit'>
                                <Zap className='w-3.5 h-3.5 fill-blue-600' />
                                <span className='text-[10px] font-black uppercase tracking-[0.2em]'>Giảng viên tương lai</span>
                            </div>

                            <div className='space-y-3'>
                                <h2 className='text-3xl md:text-[40px] font-black text-gray-900 leading-[1.1] tracking-tight'>
                                    Biến Kiến Thức Thành <br />
                                    <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700'>
                                        Khóa Học Triệu View
                                    </span>
                                </h2>
                                <p className='text-gray-400 text-sm md:text-[15px] leading-relaxed font-semibold max-w-sm'>
                                    Sử dụng trợ lý AI chuyên nghiệp của Learnova để tối ưu hóa lộ trình dạy học chỉ trong vài phút.
                                </p>
                            </div>
                        </div>

                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                            <div className='flex items-center gap-4 p-4 rounded-[1.25rem] bg-gray-50/50 border border-gray-100/80 hover:bg-white hover:border-blue-100 hover:shadow-sm transition-all duration-300'>
                                <div className='w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm border border-gray-50'>
                                    <Target className='w-5 h-5' />
                                </div>
                                <span className='text-[12px] font-bold text-gray-800 tracking-tight leading-none'>Lên kế hoạch</span>
                            </div>
                            <div className='flex items-center gap-4 p-4 rounded-[1.25rem] bg-gray-50/50 border border-gray-100/80 hover:bg-white hover:border-indigo-100 hover:shadow-sm transition-all duration-300'>
                                <div className='w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm border border-gray-50'>
                                    <Sparkles className='w-5 h-5' />
                                </div>
                                <span className='text-[12px] font-bold text-gray-800 tracking-tight leading-none'>Sáng tạo content</span>
                            </div>
                        </div>

                        <div className='flex flex-col gap-5 pt-4'>
                            <CustomButton
                                onClick={handleAction}
                                label={isLoggedIn ? 'Bắt đầu tạo khóa học ngay' : 'Đăng nhập để bắt đầu'}
                                icon={<ArrowRight className='w-4.5 h-4.5' />}
                                className='w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.25rem] text-[15px] font-black shadow-2xl shadow-blue-200 transition-all hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3.5'
                            />
                        </div>
                    </div>
                </div>
            </div>
        </CustomDialog>
    )
}

export default CourseCreationPromotion
