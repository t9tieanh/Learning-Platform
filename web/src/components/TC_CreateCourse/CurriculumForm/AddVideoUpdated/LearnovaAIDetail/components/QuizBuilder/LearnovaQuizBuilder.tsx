import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus,
    BookOpen,
} from 'lucide-react'
import { Quiz } from '@/types/ai'
import { QuizBatchDistributionItem } from '@/types/quiz'
import CustomButton from '@/components/common/Button'
import QuizCard from './QuizCard'
import QuizEditor from './QuizEditor'

interface LearnovaQuizBuilderProps {
    chunkId: string
    initialQuizzes?: Quiz[]
    onSave: (quizzes: Quiz[]) => void
    onGenerateAI?: (distribution: QuizBatchDistributionItem[]) => void
}

const LearnovaQuizBuilder: React.FC<LearnovaQuizBuilderProps> = ({
    chunkId,
    initialQuizzes = [],
    onSave,
    onGenerateAI
}) => {
    const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes)
    const [activeIndex, setActiveIndex] = useState<number>(0)
    const [isEditing, setIsEditing] = useState(false)

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
            aiGenerated: false,
            isApproved: true
        }
        setQuizzes(prev => [...prev, newQuiz])
        setActiveIndex(quizzes.length)
        setIsEditing(true)
    }

    const handleSaveCurrentQuiz = (updatedQuiz: Quiz) => {
        const updatedQuizzes = [...quizzes]
        updatedQuizzes[activeIndex] = updatedQuiz
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
                                </div>
                                <div className='flex items-center gap-2'>
                                    <div className='w-1 h-3 bg-blue-600 rounded-full' />
                                    <p className='text-[11px] text-gray-400 font-medium'>Phát triển tư duy từng bài học với Learnova AI</p>
                                </div>
                            </div>

                            <div className='flex gap-2.5'>
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
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

export default LearnovaQuizBuilder
