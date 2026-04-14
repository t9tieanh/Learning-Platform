import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Crown, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { useVipUpgrade } from '@/contexts/VipUpgradeContext'
import learnovaLogo from '@/assets/images/logo1.png'
import CustomButton from '../common/Button'
import vipPackageService from '@/services/sale/vip-package.service'
import { VipPackage } from '@/types/vip-package.type'

export const PremiumLockedState: React.FC = () => {
    const { openVipDialog } = useVipUpgrade()
    const [vipPkg, setVipPkg] = useState<VipPackage | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchPackage = async () => {
            try {
                const res = await vipPackageService.getVipPackageByDuration(1)
                if (res && res.result) {
                    setVipPkg(res.result)
                }
            } catch (error) {
                console.error('Failed to fetch VIP package', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchPackage()
    }, [])

    return (
        <div className='h-full flex flex-col items-center justify-center p-8 relative overflow-hidden bg-gradient-to-br from-white via-amber-50/20 to-yellow-50/30'>
            {/* Decorative background effects */}
            <div className='absolute top-[-20%] right-[-10%] w-80 h-80 bg-yellow-200/20 rounded-full blur-[100px]' />
            <div className='absolute bottom-[-20%] left-[-10%] w-80 h-80 bg-amber-200/20 rounded-full blur-[100px]' />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className='relative z-10 flex flex-col items-center space-y-6 max-w-[340px] text-center'
            >
                {/* Visual Identity Section */}
                <div className='relative'>
                    <div className='w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center p-4 shadow-2xl border border-white/60 backdrop-blur-xl relative z-10'>
                        <img src={learnovaLogo} alt="Learnova" className='w-full h-full object-contain filter grayscale opacity-40 mix-blend-multiply' />
                    </div>
                    {/* Glowing ring animation */}
                    <div className='absolute inset-0 bg-yellow-400/20 rounded-[2.5rem] blur-xl animate-pulse -z-0' />

                    <div className='absolute -bottom-2 -right-2 w-11 h-11 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-[0_8px_20px_rgba(234,179,8,0.3)] border-2 border-white z-20'>
                        <Lock className='w-5 h-5 text-white' />
                    </div>
                </div>

                {/* Content Section */}
                <div className='space-y-2'>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400/10 to-amber-400/10 border border-yellow-400/20 shadow-sm mb-2'
                    >
                        <Crown className='w-4 h-4 text-yellow-600' />
                        <span className='text-[11px] font-extrabold text-yellow-700 uppercase tracking-widest'>Đặc quyền VIP</span>
                    </motion.div>

                    <div className='space-y-3'>
                        <h3 className='text-2xl font-black bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900 bg-clip-text text-transparent leading-tight tracking-tight'>
                            Trợ lý AI Thông minh
                        </h3>
                        <p className='!text-sm text-gray-500 leading-relaxed font-medium px-4'>
                            Nâng tầm trải nghiệm học tập với trí tuệ nhân tạo chuyên sâu. Phân tích video, giải đáp thắc mắc và tóm tắt bài giảng trong chớp mắt.
                        </p>
                    </div>
                </div>

                {/* CTA Section */}
                <div className='w-full space-y-3 pt-2'>
                    <div className='flex justify-center'>
                        <CustomButton
                            onClick={openVipDialog}
                            label="Nâng cấp VIP ngay"
                            icon={isLoading ? <Loader2 className='w-3.5 h-3.5 animate-spin' /> : <ArrowRight className='w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform' />}
                            className='h-11 px-8 bg-gradient-to-r from-yellow-50 to-amber-100 hover:from-yellow-100 hover:to-amber-200 text-yellow-800 font-bold text-[13px] rounded-xl shadow-sm border border-yellow-200/60 hover:scale-[1.02] active:scale-[0.98] transition-all group'
                        />
                    </div>
                    <div className='flex flex-col space-y-1'>
                        <p className='text-[11px] text-amber-700/80 font-bold'>
                            {isLoading ? 'Đang cập nhật giá...' : `Chỉ với ${vipPkg?.price?.toLocaleString('vi-VN')}₫ cho ${vipPkg?.duration_months} tháng`}
                        </p>
                        <p className='text-[9px] text-gray-400 font-medium uppercase tracking-[0.05em]'>
                            Hợp lý hơn một ly trà sữa cho cả tháng kiến thức
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
