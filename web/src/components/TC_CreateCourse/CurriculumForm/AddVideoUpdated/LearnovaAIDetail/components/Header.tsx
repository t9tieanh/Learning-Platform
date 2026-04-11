import React from 'react'
import { ArrowLeft, CheckCheck } from 'lucide-react'
import learnovaLogo from '@/assets/images/logo1.png'
import CustomButton from '@/components/common/Button'

interface HeaderProps {
    onBack: () => void
}

const Header: React.FC<HeaderProps> = ({ onBack }) => {
    return (
        <div className=' -mx-2 md:mx-0 px-6 py-3.5 bg-white border-b border-gray-100 flex items-center justify-between rounded-b-2xl shadow-sm'>
            <div className='flex items-center gap-4'>
                <CustomButton
                    onClick={onBack}
                    variant='outline'
                    className='h-9 w-9 p-0 bg-white hover:bg-gray-50 rounded-lg transition-all text-gray-400 hover:text-blue-600 border-gray-200'
                    icon={<ArrowLeft className='w-4 h-4' />}
                />
                <div>
                    <div className='flex items-center gap-2'>
                        <h2 className='text-base font-bold text-gray-900 leading-none'>
                            Phân tích nội dung
                        </h2>
                        <img src={learnovaLogo} alt='Logo' className='h-3.5 w-auto object-contain brightness-0' />
                    </div>
                    <p className='text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5 leading-none'>
                        Trình soạn thảo bài học AI
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Header
