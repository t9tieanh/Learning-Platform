import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Sparkles,
    SlidersHorizontal
} from 'lucide-react'
import { QuizDifficulty, BloomLevel, QuizBatchDistributionItem } from '@/types/quiz'
import { cn } from '@/lib/utils'
import CustomButton from '@/components/common/Button'
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface DistributionPickerProps {
    onGenerate: (distribution: QuizBatchDistributionItem[], userPrompt?: string) => void
}

const DistributionPicker: React.FC<DistributionPickerProps> = ({
    onGenerate,
}) => {
    const [rule, setRule] = useState<QuizBatchDistributionItem>({
        difficulty: QuizDifficulty.MEDIUM,
        bloomLevel: BloomLevel.UNDERSTAND,
        count: 1
    })
    const [userPrompt, setUserPrompt] = useState('')

    const handleUpdateRule = (updates: Partial<QuizBatchDistributionItem>) => {
        setRule(prev => ({ ...prev, ...updates }))
    }

    const handleExecute = () => {
        onGenerate([rule], userPrompt)
    }

    const difficultyLabels = {
        [QuizDifficulty.EASY]: 'Dễ',
        [QuizDifficulty.MEDIUM]: 'T.Bình',
        [QuizDifficulty.HARD]: 'Khó'
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className='w-[420px] bg-white/95 backdrop-blur-md rounded-3xl border border-blue-100 shadow-2xl p-6 z-50 overflow-hidden flex flex-col gap-6'
        >
            <div className='absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none' />

            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <div className='p-2 bg-blue-50 rounded-xl text-blue-600 shadow-sm'>
                        <SlidersHorizontal className='w-4 h-4' />
                    </div>
                    <div>
                        <h4 className='text-[14px] font-bold text-gray-900'>Cấu hình AI gợi ý</h4>
                        <p className='text-[10px] text-gray-400 font-medium'>Thiết lập độ khó & số lượng</p>
                    </div>
                </div>
                <div className='bg-blue-50 px-2 py-1 rounded-lg border border-blue-100'>
                    <span className='text-[10px] font-bold text-blue-600'>{rule.count} câu hỏi</span>
                </div>
            </div>

            <div className='space-y-5'>
                <div className='p-5 bg-gray-50/50 rounded-2xl border border-gray-100 flex flex-col gap-5'>
                    <div className='space-y-2'>
                        <label className='text-[10px] font-bold text-gray-400 uppercase tracking-tight ml-1'>Độ khó bài tập</label>
                        <ToggleGroup
                            type='single'
                            value={rule.difficulty}
                            onValueChange={(val) => val && handleUpdateRule({ difficulty: val as QuizDifficulty })}
                            className='bg-white p-1 rounded-xl border border-gray-100 shadow-sm w-full grid grid-cols-3 gap-1'
                        >
                            {Object.entries(difficultyLabels).map(([value, label]) => (
                                <ToggleGroupItem
                                    key={value}
                                    value={value}
                                    className='h-9 text-[11px] font-bold rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all'
                                >
                                    {label}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </div>

                    <div className='flex items-center justify-between gap-3 pt-4 border-t border-gray-100/50'>
                        <label className='text-[11px] font-bold text-gray-600'>Số lượng câu hỏi</label>
                        <div className='flex items-center gap-3 bg-white p-1 rounded-lg border border-gray-100'>
                            <button
                                onClick={() => handleUpdateRule({ count: Math.max(1, rule.count - 1) })}
                                className='w-7 h-7 rounded-md bg-gray-50 flex items-center justify-center text-gray-500 hover:text-blue-600 active:scale-95 transition-all text-sm font-bold'
                            >
                                -
                            </button>
                            <span className='text-[13px] font-extrabold text-blue-600 min-w-[24px] text-center'>{rule.count}</span>
                            <button
                                onClick={() => handleUpdateRule({ count: Math.min(10, rule.count + 1) })}
                                className='w-7 h-7 rounded-md bg-gray-50 flex items-center justify-center text-gray-500 hover:text-blue-600 active:scale-95 transition-all text-sm font-bold'
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>

                <div className='space-y-2'>
                    <div className='flex items-center justify-between px-1'>
                        <label className='text-[10px] font-bold text-gray-400 uppercase tracking-tight'>Ý tưởng của bạn (Tối đa 100 ký tự)</label>
                        <span className={cn('text-[9px] font-bold', userPrompt.length > 90 ? 'text-red-500' : 'text-gray-300')}>
                            {userPrompt.length}/100
                        </span>
                    </div>
                    <textarea
                        value={userPrompt}
                        onChange={(e) => setUserPrompt(e.target.value.slice(0, 100))}
                        placeholder='Ví dụ: Tập trung vào phần tóm tắt, nhấn mạnh về thực hành...'
                        className='w-full h-20 bg-gray-50/50 border border-gray-100 rounded-xl p-3.5 text-[12px] text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-blue-200 focus:bg-white transition-all resize-none shadow-inner'
                    />
                </div>
            </div>

            <div className='pt-2 border-t border-gray-50'>
                <CustomButton
                    onClick={handleExecute}
                    label="Thực hiện gợi ý ngay"
                    icon={<Sparkles className='w-4 h-4' />}
                    className='w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[11px] font-extrabold shadow-xl shadow-blue-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2.5'
                />
            </div>
        </motion.div>
    )
}

export default DistributionPicker
