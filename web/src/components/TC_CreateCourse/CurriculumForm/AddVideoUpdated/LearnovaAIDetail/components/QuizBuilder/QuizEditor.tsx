import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    CheckCircle2,
    Save,
    X,
    Sparkles,
    Brain,
    Crown,
    Loader
} from 'lucide-react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Quiz, QuizChoice } from '@/types/ai'
import CustomButton from '@/components/common/Button'
import CustomInput from '@/components/common/Input'
import MathQuillEditor from '@/components/common/Input/MathQuillEditor'
import DistributionPicker from '../DistributionPicker'
import { useAuthStore } from '@/stores/useAuth.stores'
import { useVipUpgrade } from '@/contexts/VipUpgradeContext'
import quizService, { SingleQuizGenerationRequest } from '@/services/assistant/quiz.service'
import { QuizDifficulty, BloomLevel, QuestionType, QuizBatchDistributionItem } from '@/types/quiz'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface QuizEditorProps {
    chunkId: string
    quiz: Quiz
    index: number
    total: number
    onSave: (quiz: Quiz) => void
    onCancel: () => void
    onPrev: () => void
    onNext: () => void
    lessonTitle?: string
}

const QuizEditor: React.FC<QuizEditorProps> = ({
    chunkId,
    quiz,
    index,
    total,
    onSave,
    onCancel,
    onPrev,
    onNext,
    lessonTitle
}) => {
    const [draft, setDraft] = useState<Quiz>({ ...quiz })
    const [choiceInput, setChoiceInput] = useState('')
    const [isPickerOpen, setIsPickerOpen] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)

    const { data: authData } = useAuthStore()
    const isVip = authData?.isVip || false
    const { openVipDialog } = useVipUpgrade()

    const handleAddChoice = () => {
        if (!choiceInput.trim()) return
        const newChoice: QuizChoice = {
            id: Date.now().toString(),
            text: choiceInput,
            isCorrect: draft.choices.length === 0
        }
        setDraft(prev => ({
            ...prev,
            choices: [...prev.choices, newChoice]
        }))
        setChoiceInput('')
    }

    const handleToggleCorrect = (choiceId: string) => {
        setDraft(prev => ({
            ...prev,
            choices: prev.choices.map(c => (
                c.id === choiceId ? { ...c, isCorrect: !c.isCorrect } : c
            ))
        }))
    }

    const handleDeleteChoice = (choiceId: string) => {
        setDraft(prev => ({
            ...prev,
            choices: prev.choices.filter(c => c.id !== choiceId)
        }))
    }

    const handleUpdateChoiceText = (choiceId: string, text: string) => {
        setDraft(prev => ({
            ...prev,
            choices: prev.choices.map(c => (c.id === choiceId ? { ...c, text } : c))
        }))
    }

    const handleGenerateAI = async () => {
        if (!isVip) {
            openVipDialog()
            return
        }
        setIsPickerOpen(!isPickerOpen)
    }

    const handleExecuteGeneration = async (distribution: QuizBatchDistributionItem[]) => {
        if (!distribution || distribution.length === 0) return

        const toastId = toast.loading(`Learnova AI đang soạn thảo câu hỏi ôn tập cho bài học "${lessonTitle || '...'}"`, {
            description: 'Vui lòng chờ trong giây lát...',
        })
        try {
            setIsGenerating(true)
            setIsPickerOpen(false)

            // Use the first rule of the distribution to define settings for 1 question
            const rule = distribution[0]
            const response = await quizService.generateSingleQuiz(chunkId, {
                difficulty: rule.difficulty,
                bloomLevel: rule.bloomLevel,
                questionType: QuestionType.MULTIPLE_CHOICE,
                numberOfQuestions: 1
            })

            if (response.code === 201 && response.result) {
                const q = response.result
                setDraft(prev => ({
                    ...prev,
                    question: q.question,
                    choices: q.choices.map(c => ({
                        id: c.id,
                        text: c.text,
                        isCorrect: c.isCorrect,
                        feedback: c.feedback
                    })),
                    explanation: q.explanation,
                    difficulty: q.difficulty as QuizDifficulty,
                    bloomLevel: q.bloomLevel as BloomLevel,
                    aiGenerated: true,
                    aiConfidence: q.aiConfidence,
                    isApproved: false // Newly generated AI quizzes start as unapproved
                }))
                toast.success('✓ AI đã gợi ý nội dung mới cho câu hỏi này!', { id: toastId })
            } else {
                toast.error(response.message || 'Lỗi khi tạo câu hỏi', { id: toastId })
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Lỗi khi tạo câu hỏi từ AI', { id: toastId })
        } finally {
            setIsGenerating(false)
        }
    }

    const handleApprove = async () => {
        if (!draft.id) return
        try {
            const response = await quizService.approveQuiz(draft.id)
            if (response.code === 200) {
                setDraft(prev => ({ ...prev, isApproved: true }))
                toast.success('Đã duyệt câu hỏi thành công')
                // Update parent list as well
                onSave({ ...draft, isApproved: true })
            } else {
                toast.error('Lỗi khi duyệt câu hỏi')
            }
        } catch (error) {
            toast.error('Lỗi kết nối máy chủ')
        }
    }

    return (
        <motion.div
            key='edit-view'
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className='flex-1 py-10 bg-gradient-to-br from-blue-50/20 to-indigo-50/20 w-full max-w-4xl mx-auto flex flex-col gap-6 rounded-3xl mt-4 mb-4'
        >
            <div className='w-full max-w-3xl mx-auto px-4 md:px-0 flex flex-col gap-6'>
                {/* Header */}
                <div className='flex items-center justify-between pb-5 border-b border-blue-100/50'>
                    <div className='flex items-center gap-4'>
                        <CustomButton
                            type='button'
                            onClick={onCancel}
                            variant='ghost'
                            size='icon'
                            icon={<ChevronLeft className='w-4.5 h-4.5' />}
                            className='h-8 w-8 text-blue-600 bg-white shadow-sm border border-blue-100 hover:bg-blue-50 rounded-lg'
                        />
                        <div className='h-6 w-px bg-blue-100' />
                        <div>
                            <h4 className='text-[16px] font-bold text-gray-900 tracking-tight'>Câu hỏi {index + 1}</h4>
                            <div className='flex items-center gap-2 mt-0.5'>
                                <Sparkles className='w-3 h-3 text-blue-500' />
                                <p className='text-[10px] text-blue-500 font-medium'>Trình soạn thảo AI</p>
                            </div>
                        </div>
                    </div>

                    <div className='flex items-center gap-2'>
                        <div className='flex items-center bg-white p-1 rounded-xl shadow-sm border border-blue-50 mr-2'>
                            <button
                                onClick={onPrev}
                                disabled={index === 0}
                                className='p-1.5 hover:bg-blue-50/50 text-blue-400 disabled:opacity-30 rounded-lg transition-all'
                            >
                                <ChevronLeft className='w-4 h-4' />
                            </button>
                            <span className='px-3 text-[11px] font-bold text-gray-500'>{index + 1} / {total}</span>
                            <button
                                onClick={onNext}
                                disabled={index === total - 1}
                                className='p-1.5 hover:bg-blue-50/50 text-blue-400 disabled:opacity-30 rounded-lg transition-all'
                            >
                                <ChevronRight className='w-4 h-4' />
                            </button>
                        </div>

                        <div className='relative'>
                            <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
                                <PopoverTrigger asChild>
                                    <CustomButton
                                        type='button'
                                        onClick={(e) => {
                                            if (!isVip) {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                openVipDialog()
                                            }
                                        }}
                                        disabled={isGenerating}
                                        variant='outline'
                                        label={isGenerating ? 'Đang tạo...' : 'Gợi ý bài tập (VIP)'}
                                        icon={isGenerating ? <Loader className='w-3 h-3 animate-spin' /> : <Crown className='w-3 h-3 text-amber-500' />}
                                        className={cn(
                                            'h-7.5 px-3.5 text-[10px] font-bold border-amber-200 text-amber-700 transition-all rounded-lg',
                                            isPickerOpen ? 'bg-amber-100 shadow-inner' : 'bg-amber-50/30 hover:bg-amber-50'
                                        )}
                                    />
                                </PopoverTrigger>
                                {isVip && (
                                    <PopoverContent className='p-0 bg-transparent border-none shadow-none z-[100]' align='end'>
                                        <DistributionPicker
                                            onGenerate={handleExecuteGeneration}
                                        />
                                    </PopoverContent>
                                )}
                            </Popover>
                        </div>

                        <CustomButton
                            type='button'
                            onClick={onCancel}
                            variant='ghost'
                            size='icon'
                            icon={<X className='w-4.5 h-4.5' />}
                            className='h-8 w-8 text-gray-300 hover:text-gray-500 rounded-lg'
                        />
                    </div>
                </div>

                <div className='flex flex-col gap-7'>
                    {/* Question Content */}
                    <div className='flex flex-col gap-2.5'>
                        <label className='text-[11px] font-medium text-gray-500 px-1'>Nội dung đề bài</label>
                        <MathQuillEditor
                            initialHtml={draft.question || ''}
                            onChange={(html) => setDraft({ ...draft, question: html })}
                            className='min-h-[120px] bg-white rounded-2xl shadow-sm text-[14px] overflow-hidden'
                        />
                    </div>

                    {/* Choices */}
                    <div className='flex flex-col gap-2.5'>
                        <div className='flex items-center justify-between px-1'>
                            <label className='text-[11px] font-medium text-gray-500'>Các phương án trả lời</label>
                            <span className='text-[10px] text-gray-300 italic font-medium'>Chọn đáp án đúng nhất</span>
                        </div>
                        <div className='flex flex-col gap-3'>
                            {draft.choices.map((choice, cIdx) => (
                                <div
                                    key={choice.id}
                                    className={cn(
                                        'flex items-center gap-4 p-3.5 rounded-2xl transition-all border outline-none min-h-[52px]',
                                        choice.isCorrect ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' : 'bg-white border-gray-100 text-gray-700'
                                    )}
                                >
                                    <CustomButton
                                        type='button'
                                        onClick={() => handleToggleCorrect(choice.id)}
                                        variant='ghost'
                                        size='icon'
                                        className={cn(
                                            'w-4.5 h-4.5 rounded-full p-0 flex items-center justify-center transition-all min-w-0 border flex-shrink-0',
                                            choice.isCorrect ? 'bg-white border-white text-blue-600' : 'bg-gray-50 border-gray-200'
                                        )}
                                        icon={choice.isCorrect ? <CheckCircle2 className='w-3 h-3' /> : null}
                                    />
                                    <input
                                        value={choice.text}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateChoiceText(choice.id, e.target.value)}
                                        className={cn(
                                            'flex-1 bg-transparent border-none outline-none text-[14px] font-bold h-full',
                                            choice.isCorrect ? 'text-white placeholder:text-blue-100/50 placeholder:font-normal' : 'text-gray-700 placeholder:text-gray-300 placeholder:font-normal'
                                        )}
                                        placeholder={`Lựa chọn ${cIdx + 1}...`}
                                    />
                                    <CustomButton
                                        type='button'
                                        onClick={() => handleDeleteChoice(choice.id)}
                                        variant='ghost'
                                        size='icon'
                                        icon={<X className='w-4 h-4' />}
                                        className='h-7 w-7 p-0 shadow-none rounded-lg transition-all'
                                    />
                                </div>
                            ))}

                            {draft.choices.length < 5 && (
                                <div className='flex items-center gap-4 p-3.5 rounded-2xl border border-dashed border-blue-200 bg-blue-50/30'>
                                    <div className='w-4.5 h-4.5 rounded-full bg-white border border-blue-100 flex-shrink-0' />
                                    <CustomInput
                                        value={choiceInput}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChoiceInput(e.target.value)}
                                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && (e.preventDefault(), handleAddChoice())}
                                        className='flex-1 bg-transparent border-none outline-none text-[13px] text-blue-600 font-bold italic h-full placeholder:text-blue-300/60 placeholder:font-normal'
                                        placeholder='Nhập phương án mới...'
                                    />
                                    <CustomButton
                                        type='button'
                                        onClick={handleAddChoice}
                                        disabled={!choiceInput.trim()}
                                        label='Xác nhận'
                                        variant='ghost'
                                        className='h-7.5 px-4 rounded-lg text-[10.5px] font-bold text-blue-600 hover:bg-blue-600 hover:text-white bg-white border border-blue-100 transition-all shadow-sm'
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Explanation */}
                    <div className='flex flex-col gap-2.5'>
                        <div className='flex items-center gap-2 px-1'>
                            <label className='text-[11px] font-medium text-gray-500'>Giải thích chi tiết kiến thức</label>
                            <Brain className='w-3 h-3 text-gray-300' />
                        </div>
                        <div className='relative'>
                            <MathQuillEditor
                                initialHtml={draft.explanation || ''}
                                onChange={(html) => setDraft({ ...draft, explanation: html })}
                                className='min-h-[120px] bg-white rounded-2xl shadow-sm text-[14px] overflow-hidden'
                            />
                            {draft.aiGenerated && (
                                <div className='absolute bottom-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded-lg border border-blue-100'>
                                    <Sparkles className='w-2.5 h-2.5 text-blue-500' />
                                    {draft.aiConfidence && <span className='text-[7px] text-blue-400 font-medium mt-0.5 leading-none'>{Math.round(draft.aiConfidence * 100)}% độ tin cậy</span>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className='flex items-center justify-end gap-3 pt-8 border-t border-blue-100/50 mt-4'>
                        {draft.aiGenerated && !draft.isApproved && draft.id && (
                            <CustomButton
                                type='button'
                                onClick={handleApprove}
                                label='Duyệt câu hỏi'
                                variant='outline'
                                icon={<CheckCircle2 className='w-3.5 h-3.5' />}
                                className='h-7.5 px-5 text-[10.5px] font-bold border-green-200 text-green-600 bg-green-50/30 hover:bg-green-600 hover:text-white rounded-lg transition-all shadow-sm'
                            />
                        )}
                        <CustomButton
                            type='button'
                            onClick={onCancel}
                            variant='ghost'
                            label='Huỷ thay đổi'
                            className='h-7 px-5 text-[10.5px] font-medium text-gray-400 hover:bg-gray-50 rounded-lg transition-all'
                        />
                        <CustomButton
                            type='button'
                            onClick={() => onSave(draft)}
                            label='Lưu bài tập'
                            variant='default'
                            icon={<Save className='w-3.5 h-3.5' />}
                            className='bg-blue-600 hover:bg-blue-700 h-7.5 text-white rounded-lg px-6 font-medium text-[10.5px] shadow-lg shadow-blue-100 transition-all tracking-tight'
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default QuizEditor
