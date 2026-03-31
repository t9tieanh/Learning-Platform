import React from 'react'
import { Brain, ScanEye } from 'lucide-react'

interface AnalyticsSidebarProps {
    chunkCount: number
}

const AnalyticsSidebar: React.FC<AnalyticsSidebarProps> = ({ chunkCount }) => {
    return (
        <div className='lg:col-span-4 sticky top-36 space-y-8'>
            <div className='bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2.5rem] p-10 text-white shadow-lg relative overflow-hidden group'>
                <div className='absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity'>
                    <Brain className='w-40 h-40' />
                </div>
                <div className='relative z-10 space-y-6'>
                    <h3 className='text-3xl font-black leading-tight'>Thống kê <br /><span className='text-blue-400'>Phân tích AI</span></h3>
                    <div className='space-y-5 pt-4'>
                        <div className='bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10'>
                            <p className='text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 px-1'>Hiệu quả tóm tắt</p>
                            <div className='flex items-baseline gap-2'>
                                <span className='text-4xl font-black'>98%</span>
                                <span className='text-sm text-gray-400 font-bold'>Độ chính xác</span>
                            </div>
                        </div>
                        <div className='bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10'>
                            <p className='text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 px-1'>Trích xuất kiến thức</p>
                            <div className='flex items-baseline gap-2'>
                                <span className='text-4xl font-black'>{chunkCount}</span>
                                <span className='text-sm text-gray-400 font-bold'>Đoạn video</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Visual Tip */}
            <div className='bg-amber-50 border border-amber-100 rounded-3xl p-6 flex gap-4 shadow-sm'>
                <div className='p-2 bg-white rounded-xl shadow-sm border border-amber-100 flex-shrink-0 self-start'>
                    <ScanEye className='w-5 h-5 text-amber-600' />
                </div>
                <p className='text-xs text-amber-800 leading-relaxed font-bold italic'>
                    "Hệ thống tự động biên soạn câu hỏi dựa trên ngữ nghĩa của bài giảng. Hãy đảm bảo các câu hỏi này mang tính gợi mở để học viên tối ưu hóa việc ghi nhớ."
                </p>
            </div>
        </div>
    )
}

export default AnalyticsSidebar
