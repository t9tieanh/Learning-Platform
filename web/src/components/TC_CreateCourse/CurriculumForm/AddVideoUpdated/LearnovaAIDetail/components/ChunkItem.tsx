import React, { useState } from 'react'
import { PlayCircle, Pencil, RefreshCw, Check, BookOpen, Brain, ChevronRight, Sparkles } from 'lucide-react'
import { LessonChunk, Quiz } from '@/types/ai'
import CustomButton from '@/components/common/Button'
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import LearnovaQuizBuilder from './QuizBuilder'
import { cn } from '@/lib/utils'

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

    const handleSaveQuizzes = (updatedQuizzes: Quiz[]) => {
        setChunkQuizzes(updatedQuizzes)
    }

    return (
        <AccordionItem
            value={`chunk-${idx}`}
            className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-blue-100/30'
        >
            <AccordionTrigger className='px-6 py-5 hover:no-underline group/trigger data-[state=open]:bg-gray-50/30 transition-colors'>
                <div className='flex items-center gap-4 flex-1 min-w-0 pr-4 text-left'>
                    <div className='w-9 h-9 flex-shrink-0 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-blue-100'>
                        {idx + 1}
                    </div>
                    <div className='flex-1 min-w-0'>
                        <h4 className='font-bold text-gray-900 text-[15px] tracking-tight truncate'>
                            {chunk.title || `Phân đoạn ${idx + 1}`}
                        </h4>
                        <div className='flex items-center gap-3 text-[11px] font-medium text-gray-400 mt-0.5 tracking-wide'>
                            <span className='flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-bold'>
                                {chunk.timestamp}
                            </span>
                            <CustomButton
                                type='button'
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleSeek(chunk.startTime)
                                }}
                                variant='link'
                                size='sm'
                                icon={<PlayCircle className='w-3.5 h-3.5' />}
                                label='Xem ngay'
                                className='h-auto p-0 font-bold text-blue-500 hover:text-blue-700 text-[11px]'
                            />
                        </div>
                    </div>
                </div>
            </AccordionTrigger>

            <AccordionContent className='p-6 pt-2 space-y-6 border-t border-gray-50 bg-gray-50/10'>
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
                        <div className='space-y-3 p-1 animate-in fade-in slide-in-from-top-1 duration-200'>
                            <textarea
                                value={draftSummary}
                                onChange={(e) => setDraftSummary(e.target.value)}
                                className='w-full text-sm text-gray-800 leading-relaxed bg-white p-5 rounded-2xl border border-blue-200 shadow-sm outline-none focus:border-blue-400 min-h-[140px] font-medium'
                                autoFocus
                            />
                            <div className='flex justify-end gap-3'>
                                <CustomButton
                                    onClick={handleCancelEdit}
                                    variant='ghost'
                                    size='sm'
                                    label='Hủy'
                                    className='text-[11px] font-bold text-gray-400 px-5'
                                />
                                <CustomButton
                                    onClick={() => handleSave(chunk.id)}
                                    disabled={isSavingSummary}
                                    variant='default'
                                    size='sm'
                                    icon={isSavingSummary ? <RefreshCw className='w-3.5 h-3.5 animate-spin' /> : <Check className='w-3.5 h-3.5' />}
                                    label={isSavingSummary ? 'Lưu...' : 'Lưu tóm tắt'}
                                    className='bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-8.5 px-6 text-[11px] font-bold shadow-md shadow-blue-100 transition-all'
                                />
                            </div>
                        </div>
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

                <div className='pt-2'>
                    <div className='flex items-center gap-3 px-1'>
                        <button
                            type='button'
                            onClick={() => setIsQuizVisible(!isQuizVisible)}
                            className={cn(
                                'flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all border group/quiz-btn bg-white',
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
                                    {isQuizVisible ? 'Đóng trình chỉnh sửa' : `Có ${chunkQuizzes.length} câu hỏi đã tạo`}
                                </p>
                            </div>
                            <ChevronRight className={cn(
                                'w-4 h-4 ml-4 transition-transform duration-300',
                                isQuizVisible ? 'rotate-90 text-blue-400' : 'text-gray-300'
                            )} />
                        </button>

                        <button
                            type='button'
                            className='flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-100 hover:shadow-lg hover:translate-y-[-1px] transition-all active:scale-95 group/ai-bulk'
                        >
                            <Sparkles className='w-3.5 h-3.5 animate-pulse text-blue-200' />
                            <div className='text-left'>
                                <p className='text-[10.5px] font-bold leading-none'>Tự động tạo 3 câu hỏi</p>
                                <p className='text-[8px] font-medium text-blue-100/80 mt-1'>Sức mạnh AI (Tối đa 3 câu/lần)</p>
                            </div>
                        </button>
                    </div>

                    <div className={cn(
                        'grid transition-all duration-300 ease-in-out',
                        isQuizVisible ? 'grid-rows-[1fr] opacity-100 mt-5' : 'grid-rows-[0fr] opacity-0 mt-0'
                    )}>
                        <div className='overflow-hidden rounded-2xl'>
                            <LearnovaQuizBuilder
                                chunkId={chunk.id}
                                initialQuizzes={chunkQuizzes}
                                onSave={handleSaveQuizzes}
                            />
                        </div>
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    )
}

export default ChunkItem
