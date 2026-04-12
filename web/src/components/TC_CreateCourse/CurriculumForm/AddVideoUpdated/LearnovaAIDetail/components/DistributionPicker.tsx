import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    CheckCircle2,
    Sparkles,
    Plus,
    Trash2,
    LayoutGrid,
    SlidersHorizontal
} from 'lucide-react'
import { QuizDifficulty, BloomLevel, QuizBatchDistributionItem } from '@/types/quiz'
import { cn } from '@/lib/utils'
import CustomButton from '@/components/common/Button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from "@/components/ui/scroll-area"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

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
    onGenerate: (distribution: QuizBatchDistributionItem[]) => void
    mode?: 'single' | 'batch'
}

const DistributionPicker: React.FC<DistributionPickerProps> = ({
    onGenerate,
    mode = 'batch'
}) => {
    const [activeTab, setActiveTab] = useState('preset')
    const [selectedPresetValue, setSelectedPresetValue] = useState('balanced')
    const [customRules, setCustomRules] = useState<QuizBatchDistributionItem[]>([
        { difficulty: QuizDifficulty.MEDIUM, bloomLevel: BloomLevel.UNDERSTAND, count: 1 }
    ])

    const handleAddRule = () => {
        if (customRules.length >= 10) return
        setCustomRules([...customRules, { difficulty: QuizDifficulty.MEDIUM, bloomLevel: BloomLevel.UNDERSTAND, count: 1 }])
    }

    const handleRemoveRule = (index: number) => {
        if (customRules.length <= 1) return
        setCustomRules(customRules.filter((_, i) => i !== index))
    }

    const handleUpdateRule = (index: number, updates: Partial<QuizBatchDistributionItem>) => {
        setCustomRules(customRules.map((rule, i) => i === index ? { ...rule, ...updates } : rule))
    }

    const handleExecute = () => {
        if (activeTab === 'preset') {
            const preset = QUIZ_DISTRIBUTION_PRESETS.find(p => p.value === selectedPresetValue)
            if (preset) {
                onGenerate(preset.distribution)
            }
        } else {
            onGenerate(customRules)
        }
    }

    const totalCount = activeTab === 'preset'
        ? QUIZ_DISTRIBUTION_PRESETS.find(p => p.value === selectedPresetValue)?.distribution.reduce((acc, d) => acc + d.count, 0) || 0
        : customRules.reduce((acc, r) => acc + r.count, 0)

    const difficultyLabels = {
        [QuizDifficulty.EASY]: 'Dễ',
        [QuizDifficulty.MEDIUM]: 'T.Bình',
        [QuizDifficulty.HARD]: 'Khó'
    }

    const bloomLabels = {
        [BloomLevel.REMEMBER]: 'Nhớ',
        [BloomLevel.UNDERSTAND]: 'Hiểu',
        [BloomLevel.APPLY]: 'V.Dụng',
        [BloomLevel.ANALYZE]: 'P.Tích',
        [BloomLevel.EVALUATE]: 'Đ.Giá',
        [BloomLevel.CREATE]: 'S.Tạo'
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className='w-[420px] bg-white/95 backdrop-blur-md rounded-3xl border border-blue-100 shadow-2xl p-6 z-50 overflow-hidden flex flex-col gap-5'
        >
            <div className='absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none' />

            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <div className='p-2 bg-blue-50 rounded-xl text-blue-600 shadow-sm'>
                        <Sparkles className='w-4 h-4' />
                    </div>
                    <div>
                        <h4 className='text-[14px] font-bold text-gray-900'>Cấu hình AI gợi ý</h4>
                        <p className='text-[10px] text-gray-400 font-medium'>Phân bổ độ khó & Bloom</p>
                    </div>
                </div>
                <div className='bg-blue-50 px-2 py-1 rounded-lg border border-blue-100'>
                    <span className='text-[10px] font-bold text-blue-600'>{totalCount} câu hỏi</span>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
                <TabsList className='grid w-full grid-cols-2 p-1 bg-gray-50/50 border border-gray-100 rounded-xl h-10'>
                    <TabsTrigger
                        value='preset'
                        className='flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 text-[11px] font-bold'
                    >
                        <LayoutGrid className='w-3.5 h-3.5' /> Gợi ý nhanh
                    </TabsTrigger>
                    <TabsTrigger
                        value='custom'
                        className='flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 text-[11px] font-bold'
                    >
                        <SlidersHorizontal className='w-3.5 h-3.5' /> Tùy chỉnh
                    </TabsTrigger>
                </TabsList>

                <TabsContent value='preset' className='mt-4 space-y-2.5'>
                    <div className='grid grid-cols-1 gap-2.5'>
                        {QUIZ_DISTRIBUTION_PRESETS.map((preset) => (
                            <CustomButton
                                key={preset.value}
                                onClick={() => setSelectedPresetValue(preset.value)}
                                variant='ghost'
                                className={cn(
                                    'w-full h-auto flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left outline-none group',
                                    selectedPresetValue === preset.value
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100'
                                        : 'bg-white border-gray-100 text-gray-700 hover:border-blue-200 hover:bg-blue-50/30'
                                )}
                            >
                                <div className='flex items-center gap-3'>
                                    <div className={cn(
                                        'w-3.5 h-3.5 rounded-full border-2 transition-all flex items-center justify-center shrink-0',
                                        selectedPresetValue === preset.value ? 'bg-white border-white' : 'border-gray-200 group-hover:border-blue-300'
                                    )}>
                                        {selectedPresetValue === preset.value && <div className='w-1.5 h-1.5 rounded-full bg-blue-600' />}
                                    </div>
                                    <div>
                                        <p className='text-[11.5px] font-bold tracking-tight'>{preset.name}</p>
                                        <p className={cn(
                                            'text-[9px] mt-0.5 opacity-80',
                                            selectedPresetValue === preset.value ? 'text-white/80' : 'text-gray-400 font-medium'
                                        )}>
                                            {preset.description}
                                        </p>
                                    </div>
                                </div>
                                {selectedPresetValue === preset.value && <CheckCircle2 className='w-4 h-4' />}
                            </CustomButton>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value='custom' className='mt-4 space-y-4'>
                    <ScrollArea className='h-[320px] pr-3'>
                        <div className='flex flex-col gap-4'>
                            {customRules.map((rule, rIdx) => (
                                <div key={rIdx} className='p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex flex-col gap-4 relative group'>
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-1.5'>
                                            <span className='w-4.5 h-4.5 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold'>
                                                {rIdx + 1}
                                            </span>
                                            <span className='text-[10px] font-bold text-gray-500 uppercase tracking-wider'>Cấu hình {rIdx + 1}</span>
                                        </div>
                                        {customRules.length > 1 && (
                                            <button
                                                onClick={() => handleRemoveRule(rIdx)}
                                                className='text-gray-300 hover:text-red-500 transition-colors'
                                            >
                                                <Trash2 className='w-4 h-4' />
                                            </button>
                                        )}
                                    </div>

                                    <div className='flex flex-col gap-4'>
                                        {/* Difficulty Toggle */}
                                        <div className='space-y-1.5'>
                                            <label className='text-[9px] font-bold text-gray-400 uppercase tracking-tight ml-1'>Độ khó bài tập</label>
                                            <ToggleGroup
                                                type='single'
                                                value={rule.difficulty}
                                                onValueChange={(val) => val && handleUpdateRule(rIdx, { difficulty: val as QuizDifficulty })}
                                                className='bg-white p-1 rounded-xl border border-gray-100 shadow-sm w-full grid grid-cols-3 gap-1'
                                            >
                                                {Object.entries(difficultyLabels).map(([value, label]) => (
                                                    <ToggleGroupItem
                                                        key={value}
                                                        value={value}
                                                        className='h-8 text-[10px] font-bold rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all'
                                                    >
                                                        {label}
                                                    </ToggleGroupItem>
                                                ))}
                                            </ToggleGroup>
                                        </div>

                                        {/* Bloom Level Toggle */}
                                        <div className='space-y-1.5'>
                                            <label className='text-[9px] font-bold text-gray-400 uppercase tracking-tight ml-1'>Bloom Level (Nhận thức)</label>
                                            <ToggleGroup
                                                type='single'
                                                value={rule.bloomLevel}
                                                onValueChange={(val) => val && handleUpdateRule(rIdx, { bloomLevel: val as BloomLevel })}
                                                className='bg-white p-1 rounded-xl border border-gray-100 shadow-sm w-full grid grid-cols-3 gap-1'
                                            >
                                                {Object.entries(bloomLabels).map(([value, label]) => (
                                                    <ToggleGroupItem
                                                        key={value}
                                                        value={value}
                                                        className='h-8 text-[10px] font-bold rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all'
                                                    >
                                                        {label}
                                                    </ToggleGroupItem>
                                                ))}
                                            </ToggleGroup>
                                        </div>
                                    </div>

                                    <div className='flex items-center justify-between gap-3 mt-1 pt-3 border-t border-gray-100/50'>
                                        <label className='text-[10px] font-bold text-gray-600'>Số lượng câu hỏi</label>
                                        <div className='flex items-center gap-3 bg-white p-1 rounded-lg border border-gray-100'>
                                            <button
                                                onClick={() => handleUpdateRule(rIdx, { count: Math.max(1, rule.count - 1) })}
                                                className='w-6 h-6 rounded-md bg-gray-50 flex items-center justify-center text-gray-500 hover:text-blue-600 active:scale-95 transition-all text-xs font-bold'
                                            >
                                                -
                                            </button>
                                            <span className='text-[12px] font-extrabold text-blue-600 min-w-[20px] text-center'>{rule.count}</span>
                                            <button
                                                onClick={() => handleUpdateRule(rIdx, { count: Math.min(10, rule.count + 1) })}
                                                className='w-6 h-6 rounded-md bg-gray-50 flex items-center justify-center text-gray-500 hover:text-blue-600 active:scale-95 transition-all text-xs font-bold'
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    <CustomButton
                        type='button'
                        onClick={handleAddRule}
                        variant='ghost'
                        icon={<Plus className='w-3 h-3' />}
                        label='Thêm cấu hình khác'
                        className='w-full h-10 rounded-xl border border-dashed border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/20 text-[10px] font-bold'
                    />
                </TabsContent>
            </Tabs>

            <div className='pt-2 border-t border-gray-50 mt-1'>
                <CustomButton
                    onClick={handleExecute}
                    label="Thực hiện gợi ý ngay"
                    icon={<Sparkles className='w-4 h-4' />}
                    className='w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[12px] font-extrabold shadow-xl shadow-blue-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2.5'
                />
            </div>
        </motion.div>
    )
}

export default DistributionPicker
