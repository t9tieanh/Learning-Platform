import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus,
    BookOpen,
    CheckCircle,
    Trash2,
} from 'lucide-react'
import { Quiz } from '@/types/ai'
import { QuizBatchDistributionItem, QuizDifficulty, BloomLevel, QuestionType } from '@/types/quiz'
import CustomButton from '@/components/common/Button'
import QuizCard from './QuizCard'
import QuizEditor from './QuizEditor'
import quizService from '@/services/assistant/quiz.service'
import { toast } from 'sonner'
import { showConfirmToast } from '@/components/common/ShowConfirmToast'

interface LearnovaQuizBuilderProps {
    chunkId: string
    initialQuizzes?: Quiz[]
    onSave: (quizzes: Quiz[]) => void
    onGenerateAI?: (distribution: QuizBatchDistributionItem[]) => void
    lessonTitle?: string
}

const LearnovaQuizBuilder: React.FC<LearnovaQuizBuilderProps> = ({
    chunkId,
    initialQuizzes = [],
    onSave,
    onGenerateAI,
    lessonTitle
}) => {
    const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes)
    const [activeIndex, setActiveIndex] = useState<number>(0)
    const [isEditing, setIsEditing] = useState(false)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [isBulkApproving, setIsBulkApproving] = useState(false)

    useEffect(() => {
        setQuizzes(initialQuizzes)
        setActiveIndex(0)
        setIsEditing(false)
    }, [chunkId, initialQuizzes])

    const handleSelectQuestion = (index: number) => {
        setActiveIndex(index)
        setIsEditing(true)
    }

    const handleAddNewQuestion = () => {
        const newQuiz: Quiz = {
            id: Date.now().toString(),
            question: '',
            choices: [],
            explanation: '',
            type: QuestionType.MULTIPLE_CHOICE,
            difficulty: QuizDifficulty.MEDIUM,
            bloomLevel: BloomLevel.UNDERSTAND,
            aiGenerated: false,
            isApproved: true
        }
        setQuizzes(prev => [...prev, newQuiz])
        setActiveIndex(quizzes.length)
        setIsEditing(true)
    }

    const handleSaveCurrentQuiz = async (updatedQuiz: Quiz) => {
        try {
            const correctCount = updatedQuiz.choices.filter(c => c.isCorrect).length
            const determinedType = correctCount > 1 ? QuestionType.MULTIPLE_CHOICE : QuestionType.TRUE_FALSE

            const quizWithCorrectType = {
                ...updatedQuiz,
                type: determinedType
            }

            const isNew = !updatedQuiz.id || updatedQuiz.id.length < 15

            let response
            if (isNew) {
                const { id: _, ...createPayload } = quizWithCorrectType
                response = await quizService.createManualQuiz(chunkId, createPayload)
            } else {
                if (!updatedQuiz.id) throw new Error('Missing Quiz ID for update')
                response = await quizService.updateQuiz(updatedQuiz.id, quizWithCorrectType as any)
            }

            if (response.code === 200 || response.code === 201) {
                const savedQuiz = {
                    ...updatedQuiz,
                    id: response.result?.id || updatedQuiz.id // Use real ID from DB
                }
                const updatedQuizzes = [...quizzes]
                updatedQuizzes[activeIndex] = savedQuiz
                setQuizzes(updatedQuizzes)
                onSave(updatedQuizzes)
                setIsEditing(false)
                toast.success(isNew ? 'Đã tạo câu hỏi thành công' : 'Đã cập nhật câu hỏi')
            } else {
                toast.error(response.message || 'Lỗi khi lưu câu hỏi')
            }
        } catch (error) {
            console.error('Error saving quiz:', error)
            toast.error('Lỗi kết nối máy chủ')
        }
    }

    const handleDeleteQuiz = async (index: number, e: React.MouseEvent) => {
        e.stopPropagation()
        const targetQuiz = quizzes[index]

        // If it's a temporary quiz not yet saved to DB, just filter it out
        const isNew = !targetQuiz.id || targetQuiz.id.length < 15

        if (!isNew) {
            try {
                if (!targetQuiz.id) throw new Error('Missing Quiz ID for delete')
                const confirmed = await showConfirmToast({
                    title: 'Xóa câu hỏi?',
                    description: 'Hành động này sẽ xóa vĩnh viễn câu hỏi và không thể hoàn tác.',
                    confirmLabel: 'Xóa ngay',
                    cancelLabel: 'Hủy'
                })
                if (!confirmed) return
                const response = await quizService.deleteQuiz(targetQuiz.id)
                if (response.code !== 200) {
                    toast.error('Không thể xóa câu hỏi trên máy chủ')
                    return
                }
            } catch (error) {
                toast.error('Lỗi khi xóa câu hỏi')
                return
            }
        }

        const updatedQuizzes = quizzes.filter((_, i) => i !== index)
        setQuizzes(updatedQuizzes)
        onSave(updatedQuizzes)

        if (activeIndex === index) {
            setIsEditing(false)
        } else if (activeIndex > index) {
            setActiveIndex(prev => prev - 1)
        }

        toast.success('Đã xóa câu hỏi')
    }

    const handleToggleSelect = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const handleBulkApprove = async () => {
        if (selectedIds.length === 0) return
        const confirmed = await showConfirmToast({
            title: `Duyệt ${selectedIds.length} câu hỏi?`,
            description: 'Các câu hỏi này sẽ được công khai và hiển thị cho học viên.',
            confirmLabel: 'Duyệt tất cả',
            cancelLabel: 'Quay lại'
        })
        if (!confirmed) return

        try {
            setIsBulkApproving(true)
            const response = await quizService.bulkApproveQuizzes(selectedIds)
            if (response.code === 200) {
                const updatedQuizzes = quizzes.map(q =>
                    q.id && selectedIds.includes(q.id) ? { ...q, isApproved: true } : q
                )
                setQuizzes(updatedQuizzes)
                onSave(updatedQuizzes)
                setSelectedIds([])
                toast.success(`Đã duyệt thành công ${selectedIds.length} câu hỏi`)
            } else {
                toast.error('Lỗi khi duyệt hàng loạt')
            }
        } catch (error) {
            toast.error('Lỗi kết nối máy chủ')
        } finally {
            setIsBulkApproving(false)
        }
    }

    const [isBulkDeleting, setIsBulkDeleting] = useState(false)
    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return
        const confirmed = await showConfirmToast({
            title: `Xóa vĩnh viễn ${selectedIds.length} mục?`,
            description: 'Bạn đang thực hiện xóa hàng loạt. Hành động này không thể khôi phục.',
            confirmLabel: 'Xóa tất cả',
            cancelLabel: 'Hủy'
        })
        if (!confirmed) return

        try {
            setIsBulkDeleting(true)
            const response = await quizService.bulkDeleteQuizzes(selectedIds)
            if (response.code === 200) {
                const updatedQuizzes = quizzes.filter(q => !q.id || !selectedIds.includes(q.id))
                setQuizzes(updatedQuizzes)
                onSave(updatedQuizzes)
                setSelectedIds([])
                toast.success(`Đã xóa thành công ${selectedIds.length} câu hỏi`)
            } else {
                toast.error('Lỗi khi xóa hàng loạt')
            }
        } catch (error) {
            toast.error('Lỗi kết nối máy chủ')
        } finally {
            setIsBulkDeleting(false)
        }
    }

    return (
        <div className='bg-white rounded-[2rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden min-h-[500px] flex flex-col relative'>
            <AnimatePresence mode='wait'>
                {!isEditing ? (
                    <motion.div
                        key='list-view'
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className='p-10 flex flex-col gap-10 w-full max-w-6xl mx-auto'
                    >
                        {/* Header Section */}
                        <div className='flex items-center justify-between'>
                            <div className='space-y-1.5'>
                                <div className='flex items-center gap-2'>
                                    <h3 className='text-[18px] font-extrabold text-gray-900 tracking-tight'>Câu hỏi ôn tập</h3>
                                    <div className='px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-semibold border border-blue-100'>
                                        {quizzes.length} câu hỏi
                                    </div>
                                    {quizzes.length > 0 && (
                                        <button
                                            type='button'
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                if (selectedIds.length === quizzes.length) {
                                                    setSelectedIds([])
                                                } else {
                                                    setSelectedIds(quizzes.map(q => q.id).filter(Boolean) as string[])
                                                }
                                            }}
                                            className='text-[9px] font-bold text-blue-500 hover:text-blue-700 underline underline-offset-2 ml-2'
                                        >
                                            {selectedIds.length === quizzes.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                                        </button>
                                    )}
                                </div>
                                <div className='flex items-center gap-2'>
                                    <div className='w-1 h-3 bg-blue-600 rounded-full' />
                                    <p className='text-[11px] text-gray-400 font-medium'>Phát triển tư duy từng bài học với Learnova AI</p>
                                </div>
                            </div>

                            <div className='flex gap-2.5'>
                                {selectedIds.length > 0 && (
                                    <>
                                        <CustomButton
                                            type='button'
                                            onClick={handleBulkDelete}
                                            disabled={isBulkDeleting}
                                            variant='outline'
                                            label={isBulkDeleting ? 'Đang xóa...' : `Xóa ${selectedIds.length}`}
                                            icon={<Trash2 className='w-3 h-3' />}
                                            className='h-7 px-4 text-[10px] font-bold border-red-200 text-red-500 bg-red-50/50 hover:bg-red-600 hover:text-white rounded-lg transition-all'
                                        />
                                        <CustomButton
                                            type='button'
                                            onClick={handleBulkApprove}
                                            disabled={isBulkApproving}
                                            variant='default'
                                            label={isBulkApproving ? 'Đang duyệt...' : `Duyệt ${selectedIds.length}`}
                                            icon={<CheckCircle className='w-3 h-3' />}
                                            className='h-7 px-4 text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md shadow-blue-100 transition-all'
                                        />
                                    </>
                                )}
                                <CustomButton
                                    type='button'
                                    onClick={handleAddNewQuestion}
                                    variant='default'
                                    label='Thêm câu hỏi'
                                    icon={<Plus className='w-3.5 h-3.5' />}
                                    className='h-7 px-4 text-[10px] font-bold bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md shadow-blue-100'
                                />
                            </div>
                        </div>

                        {/* Quizzes Grid */}
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                            {quizzes.length > 0 ? (
                                quizzes.map((q, idx) => (
                                    <QuizCard
                                        key={q.id || idx}
                                        quiz={q}
                                        index={idx}
                                        onEdit={handleSelectQuestion}
                                        onDelete={handleDeleteQuiz}
                                        isSelected={q.id ? selectedIds.includes(q.id) : false}
                                        onSelect={handleToggleSelect}
                                    />
                                ))
                            ) : (
                                <div className='col-span-full py-24 flex flex-col items-center justify-center text-center bg-gray-50/10 border-2 border-dashed border-gray-100 rounded-[2.5rem]'>
                                    <div className='w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-blue-100 shadow-sm border border-gray-50 mb-6 text-3xl'>
                                        <BookOpen className='w-10 h-10' />
                                    </div>
                                    <h4 className='text-[18px] font-extrabold text-gray-800'>Trình soạn thảo đang trống</h4>
                                    <p className='text-[14px] text-gray-400 mt-2.5 max-w-sm leading-relaxed font-medium'>
                                        Sử dụng AI gợi ý hoặc tự tạo hệ thống câu hỏi trắc nghiệm để học viên đạt hiệu quả học tập cao nhất.
                                    </p>
                                    <CustomButton
                                        type='button'
                                        onClick={handleAddNewQuestion}
                                        variant='outline'
                                        label='Bắt đầu tạo câu hỏi'
                                        className='mt-10 h-10 px-8 text-[11px] font-bold border-gray-200 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm'
                                    />
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <QuizEditor
                        chunkId={chunkId}
                        quiz={quizzes[activeIndex]}
                        index={activeIndex}
                        total={quizzes.length}
                        onSave={handleSaveCurrentQuiz}
                        onCancel={() => setIsEditing(false)}
                        onPrev={() => setActiveIndex(prev => prev - 1)}
                        onNext={() => setActiveIndex(prev => prev + 1)}
                        lessonTitle={lessonTitle}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

export default LearnovaQuizBuilder
