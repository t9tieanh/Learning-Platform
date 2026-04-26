import React from 'react'
import { Trash2, Sparkles, ArrowRight } from 'lucide-react'
import { Quiz } from '@/types/ai'
import { QuizDifficulty, BloomLevel } from '@/types/quiz'
import CustomButton from '@/components/common/Button'
import { cn } from '@/lib/utils'

interface QuizCardProps {
    quiz: Quiz
    index: number
    onEdit: (index: number) => void
    onDelete: (index: number, e: React.MouseEvent) => void
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz, index, onEdit, onDelete }) => {
    return (
        <div
            onClick={() => onEdit(index)}
            className='group flex flex-col p-6 rounded-2xl border border-gray-100 bg-gray-50/20 hover:bg-white hover:border-blue-200 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden h-full'
        >
            <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-2'>
                    <span className='w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-md shadow-blue-100'>
                        {index + 1}
                    </span>
                    {quiz.aiGenerated && (
                        <div className='flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[8px] font-semibold border border-blue-100'>
                            <Sparkles className='w-2 h-2' /> AI {quiz.aiConfidence ? `• ${Math.round(quiz.aiConfidence * 100)}%` : ''}
                        </div>
                    )}
                    {!quiz.isApproved && quiz.aiGenerated && (
                        <div className='px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[8px] font-semibold border border-amber-100'>
                            Chờ duyệt
                        </div>
                    )}
                </div>
                <CustomButton
                    type='button'
                    onClick={(e) => onDelete(index, e)}
                    variant='ghost'
                    size='icon'
                    icon={<Trash2 className='w-3.5 h-3.5' />}
                    className='h-6.5 w-6.5 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors'
                />
            </div>
            <p className='text-[14px] font-bold text-gray-800 line-clamp-2 min-h-[44px] leading-relaxed group-hover:text-blue-600 transition-colors'>
                {quiz.question || 'Nội dung câu hỏi đang để trống...'}
            </p>

            {(quiz.difficulty || quiz.bloomLevel) && (
                <div className='mt-4 flex flex-wrap gap-2'>
                    {quiz.difficulty && (
                        <span className={cn(
                            'text-[9px] font-bold px-2 py-0.5 rounded-full border',
                            quiz.difficulty === QuizDifficulty.EASY ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                quiz.difficulty === QuizDifficulty.MEDIUM ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                    'bg-rose-50 text-rose-600 border-rose-100'
                        )}>
                            {quiz.difficulty === QuizDifficulty.EASY ? 'Dễ' : quiz.difficulty === QuizDifficulty.MEDIUM ? 'Trung bình' : 'Khó'}
                        </span>
                    )}
                    {quiz.bloomLevel && (
                        <span className='text-[9px] font-bold px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100'>
                            {quiz.bloomLevel === BloomLevel.REMEMBER ? 'Nhớ' :
                                quiz.bloomLevel === BloomLevel.UNDERSTAND ? 'Hiểu' :
                                    quiz.bloomLevel === BloomLevel.APPLY ? 'Vận dụng' :
                                        quiz.bloomLevel === BloomLevel.ANALYZE ? 'Phân tích' :
                                            quiz.bloomLevel === BloomLevel.EVALUATE ? 'Đánh giá' : 'Sáng tạo'}
                        </span>
                    )}
                </div>
            )}

            <div className='mt-auto pt-4 flex items-center justify-between border-t border-gray-100/50'>
                <span className='text-[10px] text-gray-400 font-medium'>{quiz.choices.length} đáp án</span>
                <div className='flex items-center gap-1.5 text-blue-600 font-medium text-[10.5px] group-hover:translate-x-1 transition-transform'>
                    Chỉnh sửa <ArrowRight className='w-3 h-3' />
                </div>
            </div>
        </div>
    )
}

export default QuizCard
