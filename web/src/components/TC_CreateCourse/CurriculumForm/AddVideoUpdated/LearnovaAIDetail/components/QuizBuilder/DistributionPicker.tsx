import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Sparkles } from 'lucide-react'
import { QuizDifficulty, BloomLevel } from '@/types/quiz'
import { cn } from '@/lib/utils'

export const QUIZ_DISTRIBUTION_PRESETS = [
    {
        name: 'Cân bằng',
        description: 'Dễ - Trung bình - Trung bình',
        value: 'balanced',
        distribution: [
            { difficulty: QuizDifficulty.EASY, bloomLevel: BloomLevel.REMEMBER, count: 1 },
            { difficulty: QuizDifficulty.MEDIUM, bloomLevel: BloomLevel.UNDERSTAND, count: 1 },
            { difficulty: QuizDifficulty.MEDIUM, bloomLevel: BloomLevel.APPLY, count: 1 }
        ]
    },
    {
        name: 'Nâng cao',
        description: 'Trung bình - Khó - Khó',
        value: 'advanced',
        distribution: [
            { difficulty: QuizDifficulty.MEDIUM, bloomLevel: BloomLevel.APPLY, count: 1 },
            { difficulty: QuizDifficulty.HARD, bloomLevel: BloomLevel.ANALYZE, count: 1 },
            { difficulty: QuizDifficulty.HARD, bloomLevel: BloomLevel.EVALUATE, count: 1 }
        ]
    },
    {
        name: 'Cơ bản',
        description: 'Dễ - Dễ - Trung bình',
        value: 'basic',
        distribution: [
            { difficulty: QuizDifficulty.EASY, bloomLevel: BloomLevel.REMEMBER, count: 1 },
            { difficulty: QuizDifficulty.EASY, bloomLevel: BloomLevel.UNDERSTAND, count: 1 },
            { difficulty: QuizDifficulty.MEDIUM, bloomLevel: BloomLevel.UNDERSTAND, count: 1 }
        ]
    },
    {
        name: 'Sáng tạo',
        description: 'Phân tích - Đánh giá - Sáng tạo',
        value: 'creative',
        distribution: [
            { difficulty: QuizDifficulty.MEDIUM, bloomLevel: BloomLevel.ANALYZE, count: 1 },
            { difficulty: QuizDifficulty.HARD, bloomLevel: BloomLevel.EVALUATE, count: 1 },
            { difficulty: QuizDifficulty.HARD, bloomLevel: BloomLevel.CREATE, count: 1 }
        ]
    }
]

interface DistributionPickerProps {
    selectedPreset: string
    onSelect: (value: string) => void
    onGenerate: () => void
}

const DistributionPicker: React.FC<DistributionPickerProps> = ({
    selectedPreset,
    onSelect,
    onGenerate
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className='absolute top-20 right-8 w-80 bg-white/95 backdrop-blur-md rounded-3xl border border-blue-100 shadow-2xl p-6 z-50 overflow-hidden'
        >
            <div className='absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none' />

            <div className='flex items-center gap-2 mb-6'>
                <div className='p-2 bg-blue-50 rounded-xl text-blue-600'>
                    <Sparkles className='w-4 h-4' />
                </div>
                <div>
                    <h4 className='text-[14px] font-bold text-gray-900'>Cấu hình AI gợi ý</h4>
                    <p className='text-[10px] text-gray-400 font-medium'>Chọn phân bổ độ khó theo Bloom</p>
                </div>
            </div>

            <div className='space-y-3 mb-6'>
                {QUIZ_DISTRIBUTION_PRESETS.map((preset) => (
                    <button
                        key={preset.value}
                        onClick={() => onSelect(preset.value)}
                        className={cn(
                            'w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left outline-none group',
                            selectedPreset === preset.value
                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100'
                                : 'bg-gray-50/50 border-gray-100 text-gray-700 hover:bg-white hover:border-blue-200 hover:shadow-sm'
                        )}
                    >
                        <div className='flex items-center gap-3'>
                            <div className={cn(
                                'w-3 h-3 rounded-full border-2 transition-all',
                                selectedPreset === preset.value ? 'bg-white border-white' : 'border-gray-200 group-hover:border-blue-300'
                            )} />
                            <div>
                                <p className='text-[11px] font-bold'>{preset.name}</p>
                                <p className={cn(
                                    'text-[9px] mt-0.5',
                                    selectedPreset === preset.value ? 'text-blue-100' : 'text-gray-400 font-medium'
                                )}>
                                    {preset.description}
                                </p>
                            </div>
                        </div>
                        {selectedPreset === preset.value && <CheckCircle2 className='w-4 h-4' />}
                    </button>
                ))}
            </div>

            <button
                onClick={onGenerate}
                className='w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[12px] font-bold shadow-xl shadow-blue-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2'
            >
                <Sparkles className='w-3.5 h-3.5' />
                Thực hiện gợi ý ngay
            </button>
        </motion.div>
    )
}

export default DistributionPicker
