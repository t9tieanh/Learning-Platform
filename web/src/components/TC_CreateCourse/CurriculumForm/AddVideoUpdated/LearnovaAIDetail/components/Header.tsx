import React from 'react'
import { ArrowLeft, CheckCheck } from 'lucide-react'
import learnovaLogo from '@/assets/images/logo1.png'
import CustomButton from '@/components/common/Button'

interface HeaderProps {
    onBack: () => void
}

const Header: React.FC<HeaderProps> = ({ onBack }) => {
    return (
        <div className=' -mx-2 md:mx-0 px-4 py-6 bg-white/70 backdrop-blur-xl border-b border-gray-100 shadow-sm flex items-center justify-between rounded-b-3xl'>
            <div className='flex items-center gap-5'>
                <CustomButton
                    onClick={onBack}
                    variant='outline'
                    className='p-3 bg-white hover:bg-blue-50 rounded-2xl transition-all duration-300 text-gray-500 hover:text-blue-600 shadow-sm border border-gray-100 hover:border-blue-200 group h-auto'
                    icon={<ArrowLeft className='w-5 h-5 group-hover:-translate-x-1 transition-transform' />}
                />
                <div>
                    <div className='flex items-center gap-2 text-blue-600'>
                        <h2 className='text-xl font-black text-gray-900 tracking-tight'>
                            Phân tích chi tiết
                        </h2>
                        <img src={learnovaLogo} alt='Logo' className='h-5 w-auto object-contain' />
                    </div>
                    <p className='text-sm text-gray-500 font-medium mt-1 select-none flex items-center gap-2 uppercase tracking-wide'>
                        Tùy chỉnh nội dung bài học thông minh
                    </p>
                </div>
            </div>
            <CustomButton
                label='Lưu tất cả thay đổi'
                icon={<CheckCheck className='w-5 h-5 mr-2' />}
                className='bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-2xl shadow-lg shadow-blue-200 border-none transition-all hover:scale-105 active:scale-95 px-8 h-12 font-bold'
            />
        </div>
    )
}

export default Header
