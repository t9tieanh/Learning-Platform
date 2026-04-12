import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    PlayCircle,
    Pencil,
    RefreshCw,
    BookOpen,
    Brain,
    ChevronRight,
    Sparkles,
    Loader
} from 'lucide-react'
import { LessonChunk, Quiz } from '@/types/ai'
import CustomButton from '@/components/common/Button'
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import LearnovaQuizBuilder from './QuizBuilder'
import SummaryEditor from './SummaryEditor'
import { cn } from '@/lib/utils'
import quizService from '@/services/assistant/quiz.service'
import { QuizDifficulty, BloomLevel, QuizBatchDistributionItem } from '@/types/quiz'
import { toast } from 'sonner'

interface ChunkItemProps {
    chunk: LessonChunk
    idx: number
    handleSeek: (startTime: string | null) => void
    editingSummaryId: string | null
    draftSummary: string
    setDraftSummary: (val: string) => void
    isSavingSummary: boolean
    handleStartEdit: (chunk: LessonChunk) => void
    handleCancelEdit: () => void
    handleSave: (chunkId: string) => void
}

const ChunkItem: React.FC<ChunkItemProps> = ({
    chunk,
    idx,
    handleSeek,
    editingSummaryId,
    draftSummary,
    setDraftSummary,
    isSavingSummary,
    handleStartEdit,
    handleCancelEdit,
    handleSave,
}) => {
    const [chunkQuizzes, setChunkQuizzes] = useState<Quiz[]>(chunk.quizzes || [])
    const [isQuizVisible, setIsQuizVisible] = useState(false)
    const [isBulkGenerating, setIsBulkGenerating] = useState(false)

    const handleSaveQuizzes = (updatedQuizzes: Quiz[]) => {
        setChunkQuizzes(updatedQuizzes)
    }

    const mapQuizzes = (quizzes: any[]): Quiz[] => {
        return quizzes.map(q => ({
            id: q.id,
            question: q.question,
            choices: q.choices.map((c: any) => ({
                id: c.id,
                text: c.text,
                isCorrect: c.isCorrect,
                feedback: c.feedback
            })),
            explanation: q.explanation,
            difficulty: q.difficulty as QuizDifficulty,
            bloomLevel: q.bloomLevel as BloomLevel,
            aiGenerated: q.aiGenerated ?? true,
            aiConfidence: q.aiConfidence,
            isApproved: q.isApproved ?? false
        }))
    }

    const handleBulkGenerateQuizzes = async () => {
        if (isBulkGenerating) return

        try {
            setIsBulkGenerating(true)
            toast.loading('Đang tạo 3 câu hỏi từ AI...')

            const response = await quizService.generateBatchQuizzes(chunk.id, {
                count: 3,
                distribution: [
                    { difficulty: QuizDifficulty.EASY, bloomLevel: BloomLevel.REMEMBER, count: 1 },
                    { difficulty: QuizDifficulty.MEDIUM, bloomLevel: BloomLevel.UNDERSTAND, count: 1 },
                    { difficulty: QuizDifficulty.MEDIUM, bloomLevel: BloomLevel.APPLY, count: 1 }
                ]
            })

            if (response.code === 201 && response.result?.quizzes) {
                const generatedQuizzes = mapQuizzes(response.result.quizzes)
                const mergedQuizzes = [...chunkQuizzes, ...generatedQuizzes]
                setChunkQuizzes(mergedQuizzes)
                setIsQuizVisible(true)
                toast.dismiss()
                toast.success(`✓ Đã tạo thành công 3 câu hỏi! Tổng cộng: ${mergedQuizzes.length} câu`)
            } else {
                toast.dismiss()
                toast.error(response.message || 'Lỗi khi tạo câu hỏi')
            }
        } catch (error) {
            toast.dismiss()
            toast.error(error instanceof Error ? error.message : 'Lỗi khi tạo câu hỏi')
        } finally {
            setIsBulkGenerating(false)
        }
    }

    const handleGenerateWithDistribution = async (distribution: QuizBatchDistributionItem[]) => {
        if (isBulkGenerating) return

        try {
            setIsBulkGenerating(true)
            const count = distribution.reduce((sum, item) => sum + item.count, 0)
            toast.loading(`Đang tạo ${count} câu hỏi từ AI...`)

            const response = await quizService.generateBatchQuizzes(chunk.id, { count, distribution })

            if (response.code === 201 && response.result?.quizzes) {
                const generatedQuizzes = mapQuizzes(response.result.quizzes)
                const mergedQuizzes = [...chunkQuizzes, ...generatedQuizzes]
                setChunkQuizzes(mergedQuizzes)
                setIsQuizVisible(true)
                toast.dismiss()
                toast.success(`✓ Đã tạo thành công ${count} câu hỏi! Tổng cộng: ${mergedQuizzes.length} câu`)
            } else {
                toast.dismiss()
                toast.error(response.message || 'Lỗi khi tạo câu hỏi')
            }
        } catch (error) {
            toast.dismiss()
            toast.error(error instanceof Error ? error.message : 'Lỗi khi tạo câu hỏi')
        } finally {
            setIsBulkGenerating(false)
        }
    }

    return (
        <AccordionItem
            value={chunk.id}
            className='border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 mb-6'
        >
            <AccordionTrigger className='px-6 py-5 hover:no-underline group'>
                <div className='flex items-center justify-between w-full pr-6'>
                    <div className='flex items-center gap-4'>
                        <div className='w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-extrabold shadow-sm border border-blue-100 group-hover:scale-105 transition-transform'>
                            {idx + 1}
                        </div>
                        <div className='text-left space-y-1'>
                            <h4 className='text-[16px] font-extrabold text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors'>
                                {chunk.title || `Phân đoạn ${idx + 1}`}
                            </h4>
                            <div className='flex items-center gap-3 text-[11px] text-gray-400 font-bold uppercase tracking-widest'>
                                <span className='flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-lg'>
                                    <PlayCircle className='w-3.5 h-3.5 text-blue-500' /> {chunk.startTime}
                                </span>
                                <span className='w-1 h-1 bg-gray-200 rounded-full' />
                                <span>{chunk.sentenceCount} Câu phát biểu</span>
                            </div>
                        </div>
                    </div>
                </div>
            </AccordionTrigger>

            <AccordionContent className='p-6 pt-2 space-y-6 border-t border-gray-50 bg-gray-50/10'>
                {/* Summary Section */}
                <div className='space-y-4'>
                    <div className='flex items-center justify-between px-1'>
                        <div className='flex items-center gap-2'>
                            <div className='w-1 h-3.5 bg-blue-600 rounded-full' />
                            <label className='text-[11px] font-medium text-gray-400'>
                                Tóm tắt kiến thức
                            </label>
                        </div>
                        {editingSummaryId !== chunk.id && (
                            <CustomButton
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleStartEdit(chunk)
                                }}
                                variant='ghost'
                                size='sm'
                                icon={<Pencil className='w-3 h-3' />}
                                label='Chỉnh sửa'
                                className='h-7 text-[10px] font-bold text-blue-500 hover:bg-white hover:shadow-sm px-2 rounded-lg transition-all border border-transparent hover:border-blue-100'
                            />
                        )}
                    </div>

                    {editingSummaryId === chunk.id ? (
                        <SummaryEditor
                            value={draftSummary}
                            isSaving={isSavingSummary}
                            onChange={setDraftSummary}
                            onSave={() => handleSave(chunk.id)}
                            onCancel={handleCancelEdit}
                        />
                    ) : (
                        <div className='bg-white border border-gray-100 p-6 rounded-2xl relative shadow-sm group/summary'>
                            <div className='absolute -top-2.5 -left-2.5 p-1.5 bg-white rounded-xl border border-blue-100 shadow-sm'>
                                <Brain className='w-3.5 h-3.5 text-blue-600' />
                            </div>
                            <p className='text-gray-700 text-[14px] leading-relaxed font-normal italic opacity-90'>
                                {chunk.summary || 'Chưa có tóm tắt nội dung cho phân đoạn này...'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Quiz Header & Actions */}
                <div className='pt-2'>
                    <div className='flex items-center justify-between gap-4'>
                        <CustomButton
                            type='button'
                            onClick={() => setIsQuizVisible(!isQuizVisible)}
                            variant='ghost'
                            className={cn(
                                'h-auto flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all border group/quiz-btn bg-white hover:bg-white',
                                isQuizVisible
                                    ? 'border-blue-200 shadow-sm'
                                    : 'border-gray-100 text-gray-500 hover:border-blue-100 hover:shadow-sm'
                            )}
                        >
                            <div className={cn(
                                'p-1.5 rounded-lg transition-colors bg-gray-50',
                                isQuizVisible ? 'text-blue-600' : 'text-gray-400'
                            )}>
                                <BookOpen className='w-4 h-4' />
                            </div>
                            <div className='text-left'>
                                <p className={cn(
                                    'text-[11.5px] font-bold leading-none transition-colors',
                                    isQuizVisible ? 'text-blue-600' : 'text-gray-600'
                                )}>Hệ thống câu hỏi ôn tập</p>
                                <p className='text-[9px] font-medium text-gray-400 mt-1'>
                                    {isQuizVisible ? 'Đóng trình chỉnh sửa' : `Đã tạo ${chunkQuizzes.length} câu hỏi`}
                                </p>
                            </div>
                            <ChevronRight className={cn(
                                'w-4 h-4 ml-4 transition-transform duration-300',
                                isQuizVisible ? 'rotate-90 text-blue-400' : 'text-gray-300'
                            )} />
                        </CustomButton>

                        <div className='flex items-center gap-2'>
                            <div className='relative'>
                                <CustomButton
                                    type='button'
                                    onClick={handleBulkGenerateQuizzes}
                                    disabled={isBulkGenerating}
                                    variant='outline'
                                    label='Gợi ý 3 câu hỏi (AI)'
                                    icon={isBulkGenerating ? <Loader className='w-3 h-3 animate-spin' /> : <Sparkles className='w-3 h-3 text-blue-500' />}
                                    className='h-8 px-4 text-[10px] font-bold border-blue-100 text-blue-600 bg-blue-50/30 hover:bg-blue-50 rounded-lg transition-all active:scale-95'
                                />
                                <div className='absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse' />
                            </div>
                        </div>
                    </div>

                    <AnimatePresence>
                        {isQuizVisible && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className='mt-6 overflow-hidden'
                            >
                                <LearnovaQuizBuilder
                                    chunkId={chunk.id}
                                    initialQuizzes={chunkQuizzes}
                                    onSave={handleSaveQuizzes}
                                    onGenerateAI={handleGenerateWithDistribution}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </AccordionContent>
        </AccordionItem>
    )
}

export default ChunkItem
