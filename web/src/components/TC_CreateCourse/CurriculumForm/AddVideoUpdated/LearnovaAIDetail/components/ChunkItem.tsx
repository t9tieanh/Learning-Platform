import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    PlayCircle,
    Pencil,
    RefreshCw,
    BookOpen,
    Brain,
    ChevronRight,
    Sparkles,
    Loader,
    Settings,
    Crown
} from 'lucide-react'
import { LessonChunk, Quiz } from '@/types/ai'
import CustomButton from '@/components/common/Button'
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import LearnovaQuizBuilder from './QuizBuilder'
import SummaryEditor from './SummaryEditor'
import DistributionPicker from './DistributionPicker'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useVipUpgrade } from '@/contexts/VipUpgradeContext'
import { useAuthStore } from '@/stores/useAuth.stores'
import { cn } from '@/lib/utils'
import HighGlossBackground from '@/components/common/HighGlossBackground'
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
    lessonTitle?: string
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
    lessonTitle
}) => {
    const [chunkQuizzes, setChunkQuizzes] = useState<Quiz[]>(chunk.quizzes || [])
    const [isQuizVisible, setIsQuizVisible] = useState(false)
    const [isBulkGenerating, setIsBulkGenerating] = useState(false)
    const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false)
    const [isPickerOpen, setIsPickerOpen] = useState(false)
    const { openVipDialog } = useVipUpgrade()

    const { data: authData } = useAuthStore()
    const isVip = authData?.isVip || false

    const handleSaveQuizzes = (updatedQuizzes: Quiz[]) => {
        setChunkQuizzes(updatedQuizzes)
    }

    const mapQuizzes = useCallback((quizzes: any[]): Quiz[] => {
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
    }, [])

    const fetchQuizzes = useCallback(async () => {
        try {
            setIsLoadingQuizzes(true)
            const response = await quizService.getChunkQuizzes(chunk.id)
            if (response.code === 200 && response.result) {
                setChunkQuizzes(mapQuizzes(response.result))
            }
        } catch (error) {
            console.error('Error fetching quizzes:', error)
            toast.error('Không thể lấy danh sách bài tập')
        } finally {
            setIsLoadingQuizzes(false)
        }
    }, [chunk.id, mapQuizzes])

    useEffect(() => {
        if (isQuizVisible) {
            fetchQuizzes()
        }
    }, [isQuizVisible, fetchQuizzes])

    const handleGenerateBatch = async (distribution: QuizBatchDistributionItem[], userPrompt?: string) => {
        if (isBulkGenerating) return

        try {
            setIsBulkGenerating(true)
            setIsPickerOpen(false)
            const count = distribution.reduce((sum, item) => sum + item.count, 0)
            toast.loading(`Learnova AI đang tạo ${count} câu hỏi ôn tập cho bài học "${lessonTitle || '...'}"`, {
                description: 'Vui lòng chờ trong giây lát...'
            })

            const response = await quizService.generateBatchQuizzes(chunk.id, { count, distribution, userPrompt })

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
            className={cn(
                'border-0 rounded-xl overflow-hidden',
                'shadow-[0_8px_28px_-14px_rgba(30,58,138,0.22)]'
            )}
        >
            <HighGlossBackground className='rounded-xl overflow-hidden'>
                <AccordionTrigger
                    className={cn(
                        'px-3 py-3 md:px-4 md:py-4 hover:no-underline group rounded-none w-full',
                        'bg-transparent hover:bg-white/10 data-[state=open]:border-b data-[state=open]:border-white/15',
                        '[&>svg]:shrink-0 [&>svg]:text-white [&>svg]:mt-0.5'
                    )}
                >
                    <div className='flex items-start justify-between w-full pr-2'>
                        <div className='flex items-start gap-3 md:gap-4 min-w-0 flex-1'>
                            <div
                                className={cn(
                                    'w-9 h-9 md:w-10 md:h-10 shrink-0 mt-0.5 rounded-2xl flex items-center justify-center',
                                    'bg-white/15 text-white font-bold text-[13px] md:text-[14px] tabular-nums leading-none',
                                    'border border-white/25 shadow-sm ring-1 ring-white/15',
                                    'group-hover:scale-[1.02] transition-transform'
                                )}
                            >
                                {idx + 1}
                            </div>
                            <div className='text-left min-w-0 flex-1'>
                                <h4 className='text-[12px] md:text-[13px] font-semibold text-white tracking-tight leading-snug group-hover:text-white transition-colors [overflow-wrap:anywhere]'>
                                    {chunk.title || `Phân đoạn ${idx + 1}`}
                                </h4>
                                <div className='mt-1 flex items-center flex-wrap gap-x-2 gap-y-1 text-[11px] text-blue-100/90 font-medium'>
                                    <span
                                        className='inline-flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer group/time text-blue-50 hover:text-white'
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleSeek(chunk.startTime)
                                        }}
                                    >
                                        <PlayCircle className='w-3.5 h-3.5 shrink-0 text-white/90 group-hover/time:scale-110 transition-transform' />{' '}
                                        <span className='tabular-nums'>{chunk.startTime}</span>
                                    </span>
                                    <span className='text-white/35 select-none' aria-hidden>
                                        ·
                                    </span>
                                    <span className='tabular-nums text-blue-100/85'>
                                        {chunk.sentenceCount} Câu phát biểu
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </AccordionTrigger>

                <AccordionContent className='px-3 md:px-4 pt-2 md:pt-3 pb-2 md:pb-3 space-y-6 bg-white'>
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
                            <div className='rounded-2xl bg-slate-50/35 p-6 relative shadow-[inset_0_1px_0_0_rgba(255,255,255,0.85)] ring-1 ring-slate-900/[0.055] border-0 group/summary'>
                                <div className='absolute -top-2.5 -left-2.5 p-1.5 bg-white rounded-xl shadow-md shadow-slate-900/8 ring-1 ring-blue-500/12 border-0'>
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
                        <div className='flex items-center justify-between gap-4 flex-wrap'>
                            <CustomButton
                                type='button'
                                onClick={() => setIsQuizVisible(!isQuizVisible)}
                                variant='ghost'
                                className={cn(
                                    'h-auto flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all border-0 group/quiz-btn bg-white hover:bg-white',
                                    'shadow-[0_1px_3px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/[0.055]',
                                    isQuizVisible
                                        ? 'ring-blue-500/20 shadow-[0_4px_14px_-6px_rgba(37,99,235,0.22)]'
                                        : 'text-gray-500 hover:ring-blue-500/12 hover:shadow-[0_2px_10px_-5px_rgba(37,99,235,0.15)]'
                                )}
                            >
                                <div className={cn(
                                    'p-1.5 rounded-lg transition-colors bg-gray-50',
                                    isQuizVisible ? 'text-blue-600' : 'text-gray-400'
                                )}>
                                    {isLoadingQuizzes ? <Loader className='w-4 h-4 animate-spin' /> : <BookOpen className='w-4 h-4' />}
                                </div>
                                <div className='text-left'>
                                    <p className={cn(
                                        'text-[11.5px] font-bold leading-none transition-colors',
                                        isQuizVisible ? 'text-blue-600' : 'text-gray-600'
                                    )}>Hệ thống câu hỏi ôn tập</p>
                                    <p className='text-[9px] font-medium text-gray-400 mt-1'>
                                        {isLoadingQuizzes ? 'Đang cập nhật...' : isQuizVisible ? 'Đóng trình chỉnh sửa' : `Đã tạo ${chunkQuizzes.length} câu hỏi`}
                                    </p>
                                </div>
                                <ChevronRight className={cn(
                                    'w-4 h-4 ml-4 transition-transform duration-300',
                                    isQuizVisible ? 'rotate-90 text-blue-400' : 'text-gray-300'
                                )} />
                            </CustomButton>

                            <div className='flex items-center gap-2'>
                                <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
                                    <PopoverTrigger asChild>
                                        <div className='relative'>
                                            <CustomButton
                                                type='button'
                                                onClick={(e) => {
                                                    if (!isVip) {
                                                        e.preventDefault()
                                                        e.stopPropagation()
                                                        openVipDialog()
                                                    }
                                                }}
                                                disabled={isBulkGenerating}
                                                label={
                                                    isBulkGenerating
                                                        ? 'Đang tạo...'
                                                        : isVip
                                                            ? 'Gợi ý từ Learnova AI'
                                                            : 'Dành riêng cho VIP'
                                                }
                                                variant={isVip ? 'default' : 'outline'}
                                                icon={
                                                    isBulkGenerating
                                                        ? <Loader className='w-3 h-3 animate-spin' />
                                                        : isVip
                                                            ? <Sparkles className='w-3 h-3 text-yellow-400' />
                                                            : <Crown className='w-3 h-3 text-amber-500' />
                                                }
                                                className={cn(
                                                    'h-8 px-5 text-[10px] font-bold transition-all rounded-lg active:scale-95',
                                                    isVip
                                                        ? isPickerOpen
                                                            ? 'bg-indigo-600 text-white shadow-indigo-100'
                                                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-50'
                                                        : 'border-amber-200 text-amber-600 bg-amber-50/30 hover:bg-amber-50'
                                                )}
                                            />
                                            {isVip && !isBulkGenerating && !isPickerOpen && <div className='absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping' />}
                                        </div>
                                    </PopoverTrigger>
                                    {isVip && (
                                        <PopoverContent className='p-0 bg-transparent border-none shadow-none z-[100]' align='end'>
                                            <DistributionPicker
                                                onGenerate={handleGenerateBatch}
                                            />
                                        </PopoverContent>
                                    )}
                                </Popover>
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
                                        onGenerateAI={handleGenerateBatch}
                                        lessonTitle={lessonTitle}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </AccordionContent>
            </HighGlossBackground>
        </AccordionItem>
    )
}

export default ChunkItem
