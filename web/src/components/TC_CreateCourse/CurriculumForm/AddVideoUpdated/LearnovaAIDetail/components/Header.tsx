import React from 'react'
import { ArrowLeft, CheckCheck } from 'lucide-react'
import learnovaLogo from '@/assets/images/logo1.png'
import HighGlossBackground from '@/components/common/HighGlossBackground'
import CustomButton from '@/components/common/Button'

interface HeaderProps {
    onBack: () => void
}

const Header: React.FC<HeaderProps> = ({ onBack }) => {
    return (
        <HighGlossBackground className='-mx-2 md:mx-0 rounded-2xl shadow-md border-b border-blue-400/20'>
            <div className='px-6 py-3 flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                    <CustomButton
                        onClick={onBack}
                        variant='outline'
                        className='h-9 w-9 p-0 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-blue-100 hover:text-white border-white/20 backdrop-blur-sm'
                        icon={<ArrowLeft className='w-4 h-4' />}
                    />
                    <div>
                        <div className='flex items-center gap-2'>
                            <h2 className='text-base font-bold text-white leading-none tracking-tight'>
                                Phân tích nội dung
                            </h2>
                            <img src={learnovaLogo} alt='Logo' className='h-3.5 w-auto object-contain' />
                        </div>
                        <p className='text-[10px] text-blue-100/60 font-bold uppercase tracking-widest mt-0.5 leading-none'>
                            Trình soạn thảo bài học AI
                        </p>
                    </div>
                </div>
            </div>
        </HighGlossBackground>
    )
}

export default Header
