import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus,
    Trash2,
    CheckCircle2,
    BookOpen,
    Sparkles,
    Save,
    X,
    ChevronLeft,
    ChevronRight,
    Crown
} from 'lucide-react'
import { Quiz, QuizChoice } from '@/types/ai'
import CustomButton from '@/components/common/Button'
import CustomTextarea from '@/components/common/Textarea'
import { cn } from '@/lib/utils'

interface LearnovaQuizBuilderProps {
    chunkId: string
    initialQuizzes?: Quiz[]
    onSave: (quizzes: Quiz[]) => void
}

const LearnovaQuizBuilder: React.FC<LearnovaQuizBuilderProps> = ({
    chunkId,
    initialQuizzes = [],
    onSave
}) => {
    const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes)
    const [activeIndex, setActiveIndex] = useState<number>(0)
    const [isEditing, setIsEditing] = useState(false)
    const [draftQuiz, setDraftQuiz] = useState<Quiz>({
        question: '',
        choices: [],
        explanation: ''
    })
    const [newChoiceInput, setNewChoiceInput] = useState('')

    useEffect(() => {
        setQuizzes(initialQuizzes)
        setActiveIndex(0)
        setIsEditing(false)
    }, [chunkId, initialQuizzes])

    const handleSelectQuestion = (index: number) => {
        setActiveIndex(index)
        setDraftQuiz({ ...quizzes[index] })
        setIsEditing(true)
    }

    const handleAddNewQuestion = () => {
        const newQuiz: Quiz = {
            id: Date.now().toString(),
            question: '',
            choices: [],
            explanation: ''
        }
        setDraftQuiz(newQuiz)
        setActiveIndex(quizzes.length)
        setIsEditing(true)
    }

    const handleAddChoice = () => {
        if (!newChoiceInput.trim()) return
        const newChoice: QuizChoice = {
            id: Date.now().toString(),
            text: newChoiceInput,
            isCorrect: draftQuiz.choices.length === 0
        }
        setDraftQuiz(prev => ({
            ...prev,
            choices: [...prev.choices, newChoice]
        }))
        setNewChoiceInput('')
    }

    const handleToggleCorrect = (choiceId: string) => {
        setDraftQuiz(prev => ({
            ...prev,
            choices: prev.choices.map(c => ({
                ...c,
                isCorrect: c.id === choiceId
            }))
        }))
    }

    const handleRemoveChoice = (choiceId: string) => {
        setDraftQuiz(prev => ({
            ...prev,
            choices: prev.choices.filter(c => c.id !== choiceId)
        }))
    }

    const handleUpdateChoiceText = (choiceId: string, text: string) => {
        setDraftQuiz(prev => ({
            ...prev,
            choices: prev.choices.map(c => (c.id === choiceId ? { ...c, text } : c))
        }))
    }

    const handleSaveCurrentQuiz = () => {
        if (!draftQuiz.question.trim()) return

        let updatedQuizzes = [...quizzes]
        if (activeIndex < quizzes.length) {
            updatedQuizzes[activeIndex] = draftQuiz
        } else {
            updatedQuizzes = [...updatedQuizzes, draftQuiz]
        }

        setQuizzes(updatedQuizzes)
        onSave(updatedQuizzes)
        setIsEditing(false)
    }

    const handleDeleteQuiz = (index: number, e: React.MouseEvent) => {
        e.stopPropagation()
        const updatedQuizzes = quizzes.filter((_, i) => i !== index)
        setQuizzes(updatedQuizzes)
        onSave(updatedQuizzes)
        if (activeIndex === index) {
            setIsEditing(false)
        } else if (activeIndex > index) {
            setActiveIndex(prev => prev - 1)
        }
    }

    return (
        <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[460px] flex flex-col relative'>
            <AnimatePresence mode='wait'>
                {!isEditing ? (
                    <motion.div
                        key='list-view'
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className='p-8 flex flex-col gap-8 w-full max-w-5xl mx-auto'
                    >
                        <div className='flex items-center justify-between'>
                            <div className='space-y-1.5'>
                                <h3 className='text-[18px] font-extrabold text-gray-900 tracking-tight'>Câu hỏi ôn tập</h3>
                                <div className='flex items-center gap-2'>
                                    <div className='w-1 h-3 bg-blue-600 rounded-full' />
                                    <p className='text-[11px] text-gray-400 font-medium'>Kiểm tra kiến thức từng phân đoạn bài học</p>
                                </div>
                            </div>
                            <div className='flex gap-2.5'>
                                <CustomButton
                                    type='button'
                                    label='Gợi ý từ AI'
                                    variant='outline'
                                    icon={<Sparkles className='w-3.5 h-3.5' />}
                                    className='h-7 px-3.5 text-[10px] font-medium border-gray-100 text-blue-600 bg-gray-50/50 hover:bg-white rounded-lg'
                                />
                                <CustomButton
                                    type='button'
                                    onClick={handleAddNewQuestion}
                                    variant='default'
                                    label='Thêm câu hỏi'
                                    icon={<Plus className='w-3.5 h-3.5' />}
                                    className='h-7 px-4 text-[10px] font-medium bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md shadow-blue-100'
                                />
                            </div>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                            {quizzes.length > 0 ? (
                                quizzes.map((q, idx) => (
                                    <div
                                        key={q.id || idx}
                                        onClick={() => handleSelectQuestion(idx)}
                                        className='group flex flex-col p-6 rounded-2xl border border-gray-100 bg-gray-50/20 hover:bg-white hover:border-blue-200 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden'
                                    >
                                        <div className='flex items-center justify-between mb-4'>
                                            <span className='w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-md shadow-blue-100'>
                                                {idx + 1}
                                            </span>
                                            <CustomButton
                                                type='button'
                                                onClick={(e) => handleDeleteQuiz(idx, e)}
                                                variant='ghost'
                                                size='icon'
                                                icon={<Trash2 className='w-3.5 h-3.5' />}
                                                className='h-6.5 w-6.5 text-gray-300 hover:text-red-500 hover:bg-red-50'
                                            />
                                        </div>
                                        <p className='text-[14px] font-bold text-gray-800 line-clamp-2 min-h-[44px] leading-relaxed'>
                                            {q.question || 'Nội dung câu hỏi đang để trống...'}
                                        </p>
                                        <div className='mt-5 flex items-center justify-between pt-4 border-t border-gray-100/50'>
                                            <span className='text-[10px] text-gray-400 font-medium'>{q.choices.length} đáp án</span>
                                            <div className='flex items-center gap-1.5 text-blue-600 font-medium text-[10.5px] group-hover:translate-x-1 transition-transform'>
                                                Chi tiết <ChevronRight className='w-3.5 h-3.5' />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className='col-span-full py-20 flex flex-col items-center justify-center text-center bg-gray-50/20 border border-dashed border-gray-200 rounded-3xl'>
                                    <div className='w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-300 shadow-sm border border-gray-100 mb-5 text-xl'>
                                        <BookOpen />
                                    </div>
                                    <h4 className='text-[16px] font-bold text-gray-700'>Chưa có bài tập nào</h4>
                                    <p className='text-[13px] text-gray-400 mt-2 max-w-[300px] leading-relaxed font-medium'>Tạo hệ thống câu hỏi trắc nghiệm ngay để giúp học viên kiểm soát kiến thức tốt hơn.</p>
                                    <CustomButton
                                        type='button'
                                        onClick={handleAddNewQuestion}
                                        variant='outline'
                                        label='Tạo bài tập ngay'
                                        className='mt-7 h-8 text-[10.5px] font-medium border-gray-200 px-6 rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all'
                                    />
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key='edit-view'
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className='flex-1 py-10 bg-gradient-to-br from-blue-50/20 to-indigo-50/20 w-full max-w-4xl mx-auto flex flex-col gap-6 rounded-3xl mt-4 mb-4'
                    >
                        <div className='w-full max-w-3xl mx-auto px-4 md:px-0 flex flex-col gap-6'>
                            <div className='flex items-center justify-between pb-5 border-b border-blue-100/50'>
                                <div className='flex items-center gap-4'>
                                    <CustomButton
                                        type='button'
                                        onClick={() => setIsEditing(false)}
                                        variant='ghost'
                                        size='icon'
                                        icon={<ChevronLeft className='w-4.5 h-4.5' />}
                                        className='h-8 w-8 text-blue-600 bg-white shadow-sm border border-blue-100 hover:bg-blue-50 rounded-lg'
                                    />
                                    <div className='h-6 w-px bg-blue-100' />
                                    <div>
                                        <h4 className='text-[16px] font-bold text-gray-900 tracking-tight'>Câu hỏi {activeIndex + 1}</h4>
                                        <div className='flex items-center gap-2 mt-0.5'>
                                            <Sparkles className='w-3 h-3 text-blue-500' />
                                            <p className='text-[10px] text-blue-500 font-medium tracking-wide'>Trình soạn thảo AI</p>
                                        </div>
                                    </div>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <CustomButton
                                        type='button'
                                        variant='outline'
                                        label='Gợi ý bài tập (VIP)'
                                        icon={<Crown className='w-3 h-3 text-amber-500' />}
                                        className='h-7.5 px-3.5 text-[10px] font-bold border-amber-200 text-amber-700 bg-amber-50/30 hover:bg-amber-50 rounded-lg transition-all'
                                    />
                                    <CustomButton
                                        type='button'
                                        onClick={() => setIsEditing(false)}
                                        variant='ghost'
                                        size='icon'
                                        icon={<X className='w-4.5 h-4.5' />}
                                        className='h-8 w-8 text-gray-300 hover:text-gray-500 rounded-lg'
                                    />
                                </div>
                            </div>

                            <div className='flex flex-col gap-7'>
                                <div className='flex flex-col gap-2.5'>
                                    <label className='text-[11px] font-medium text-gray-400 px-1'>Nội dung đề bài</label>
                                    <CustomTextarea
                                        value={draftQuiz.question}
                                        onChange={(e) => setDraftQuiz(prev => ({ ...prev, question: e.target.value }))}
                                        className='text-[14px] font-bold text-gray-800 bg-white border-gray-100 focus:border-blue-200 h-28 rounded-2xl placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-300 shadow-sm leading-relaxed'
                                        placeholder='Nhập câu hỏi tại đây...'
                                        displayLabel=''
                                    />
                                </div>

                                <div className='flex flex-col gap-2.5'>
                                    <div className='flex items-center justify-between px-1'>
                                        <label className='text-[11px] font-medium text-gray-400'>Các phương án trả lời</label>
                                        <span className='text-[10px] text-gray-300 italic font-medium'>Chọn đáp án đúng nhất</span>
                                    </div>
                                    <div className='flex flex-col gap-3'>
                                        {draftQuiz.choices.map((choice, cIdx) => (
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
                                                    onChange={(e) => handleUpdateChoiceText(choice.id, e.target.value)}
                                                    className={cn(
                                                        'flex-1 bg-transparent border-none outline-none text-[14px] font-bold h-full',
                                                        choice.isCorrect ? 'text-white placeholder:text-blue-100/50 placeholder:font-normal' : 'text-gray-700 placeholder:text-gray-300 placeholder:font-normal'
                                                    )}
                                                    placeholder={`Lựa chọn ${cIdx + 1}...`}
                                                />
                                                <CustomButton
                                                    type='button'
                                                    onClick={() => handleRemoveChoice(choice.id)}
                                                    variant='ghost'
                                                    size='icon'
                                                    icon={<X className='w-4 h-4' />}
                                                    className='h-7 w-7 p-0 shadow-none rounded-lg transition-all'
                                                />
                                            </div>
                                        ))}
                                        <div className='flex items-center gap-4 p-3.5 rounded-2xl border border-dashed border-blue-200 bg-blue-50/30'>
                                            <div className='w-4.5 h-4.5 rounded-full bg-white border border-blue-100 flex-shrink-0' />
                                            <input
                                                value={newChoiceInput}
                                                onChange={(e) => setNewChoiceInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChoice())}
                                                className='flex-1 bg-transparent border-none outline-none text-[13px] text-blue-600 font-bold italic h-full placeholder:text-blue-300/60 placeholder:font-normal'
                                                placeholder='Nhập phương án mới...'
                                            />
                                            <CustomButton
                                                type='button'
                                                onClick={handleAddChoice}
                                                disabled={!newChoiceInput.trim()}
                                                label='Xác nhận'
                                                variant='ghost'
                                                className='h-7.5 px-4 rounded-lg text-[10.5px] font-bold text-blue-600 hover:bg-blue-600 hover:text-white bg-white border border-blue-100 transition-all shadow-sm'
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className='flex flex-col gap-2.5'>
                                    <label className='text-[11px] font-medium text-gray-400 px-1'>Giải thích chi tiết kiến thức</label>
                                    <CustomTextarea
                                        value={draftQuiz.explanation}
                                        onChange={(e) => setDraftQuiz(prev => ({ ...prev, explanation: e.target.value }))}
                                        className='bg-white border-gray-100 text-[14px] font-bold text-gray-700/80 rounded-2xl h-24 transition-all italic placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-300 shadow-sm leading-relaxed'
                                        placeholder='Giải thích lý do phương án này là đúng...'
                                        displayLabel=''
                                    />
                                </div>

                                <div className='flex items-center justify-end gap-3 pt-8 border-t border-blue-100/50 mt-4'>
                                    <CustomButton
                                        type='button'
                                        onClick={() => setIsEditing(false)}
                                        variant='ghost'
                                        label='Huỷ thay đổi'
                                        className='h-7 px-5 text-[10.5px] font-medium text-gray-400 hover:bg-gray-50 rounded-lg transition-all'
                                    />
                                    <CustomButton
                                        type='button'
                                        onClick={handleSaveCurrentQuiz}
                                        label='Lưu bài tập'
                                        variant='default'
                                        icon={<Save className='w-3.5 h-3.5' />}
                                        className='bg-blue-600 hover:bg-blue-700 h-7.5 text-white rounded-lg px-6 font-medium text-[10.5px] shadow-lg shadow-blue-100 transition-all tracking-tight'
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default LearnovaQuizBuilder
