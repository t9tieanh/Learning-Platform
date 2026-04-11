import React, { useState } from 'react'
import { PlayCircle, Pencil, RefreshCw, Check, BookOpen, Brain } from 'lucide-react'
import { LessonChunk, Quiz } from '@/types/ai'
import CustomButton from '@/components/common/Button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import LearnovaQuizBuilder from './QuizBuilder'

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
    chunkQuestions: Record<string, string[]>
    newQuestionInputs: Record<string, string>
    setNewQuestionInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>
    handleAddQuestion: (chunkId: string) => void
    handleRemoveQuestion: (chunkId: string, index: number) => void
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

    const handleSaveQuizzes = (updatedQuizzes: Quiz[]) => {
        setChunkQuizzes(updatedQuizzes)
    }

    return (
        <div className='group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-blue-100/30'>
            <div className='bg-gray-50/30 px-5 py-4 border-b border-gray-100 flex items-center justify-between'>
                <div className='flex items-center gap-3.5'>
                    <div className='w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-blue-100'>
                        {idx + 1}
                    </div>
                    <div>
                        <h4 className='font-bold text-gray-900 text-[15px] tracking-tight'>
                            {chunk.title || `Phân đoạn ${idx + 1}`}
                        </h4>
                        <div className='flex items-center gap-3 text-[11px] font-bold text-gray-400 mt-0.5 uppercase tracking-wide'>
                            <span className='flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md'>
                                {chunk.timestamp}
                            </span>
                            <CustomButton
                                type='button'
                                onClick={() => handleSeek(chunk.startTime)}
                                variant='link'
                                size='sm'
                                icon={<PlayCircle className='w-3.5 h-3.5' />}
                                label='Xem ngay'
                                className='h-auto p-0 font-bold text-blue-500 hover:text-blue-700 text-[11px]'
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className='p-5 space-y-4'>
                <div className='space-y-3'>
                    <div className='flex items-center justify-between px-1'>
                        <div className='flex items-center gap-2'>
                            <div className='w-1 h-3.5 bg-blue-600 rounded-full' />
                            <label className='text-[11px] font-bold text-gray-400 uppercase tracking-widest'>
                                Tóm tắt kiến thức
                            </label>
                        </div>
                        {editingSummaryId !== chunk.id && (
                            <CustomButton
                                onClick={() => handleStartEdit(chunk)}
                                variant='ghost'
                                size='sm'
                                icon={<Pencil className='w-3 h-3' />}
                                label='Chỉnh sửa'
                                className='h-7 text-[10px] font-bold text-blue-500 hover:bg-blue-50 px-2 rounded-lg transition-all'
                            />
                        )}
                    </div>

                    {editingSummaryId === chunk.id ? (
                        <div className='space-y-2.5 animate-in fade-in zoom-in-95 duration-200'>
                            <textarea
                                value={draftSummary}
                                onChange={(e) => setDraftSummary(e.target.value)}
                                className='w-full text-sm text-gray-800 leading-relaxed bg-white p-4 rounded-xl border border-blue-200 shadow-sm outline-none focus:border-blue-400 min-h-[120px] font-medium'
                                autoFocus
                            />
                            <div className='flex justify-end gap-2'>
                                <CustomButton
                                    onClick={handleCancelEdit}
                                    variant='ghost'
                                    size='sm'
                                    label='Hủy'
                                    className='h-7.5 text-[11px] font-bold text-gray-400'
                                />
                                <CustomButton
                                    onClick={() => handleSave(chunk.id)}
                                    disabled={isSavingSummary}
                                    variant='default'
                                    size='sm'
                                    icon={isSavingSummary ? <RefreshCw className='w-3.5 h-3.5 animate-spin' /> : <Check className='w-3.5 h-3.5' />}
                                    label={isSavingSummary ? 'Lưu...' : 'Lưu tóm tắt'}
                                    isLoader={isSavingSummary}
                                    className='bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-7.5 px-4 text-[11px] font-bold'
                                />
                            </div>
                        </div>
                    ) : (
                        <div className='bg-blue-50/30 border border-blue-100/50 p-4 rounded-xl relative group/summary'>
                            <div className='absolute -top-2 -left-2 p-1 bg-white rounded-md border border-blue-100'>
                                <Brain className='w-3 h-3 text-blue-600' />
                            </div>
                            <p className='text-gray-700 text-sm leading-relaxed font-medium italic'>
                                {chunk.summary || 'Chưa có tóm tắt...'}
                            </p>
                        </div>
                    )}
                </div>

                <div className='pt-1'>
                    <Accordion type='single' collapsible className='border-none'>
                        <AccordionItem value='quiz-builder' className='border-none'>
                            <AccordionTrigger className='hover:no-underline py-0 group/trigger'>
                                <div className='flex items-center gap-2 text-gray-400 group-hover/trigger:text-blue-600 transition-colors'>
                                    <BookOpen className='w-3.5 h-3.5' />
                                    <h3 className='text-[11px] font-bold uppercase tracking-widest'>
                                        Ôn tập Quiz
                                    </h3>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className='pt-4 pb-1'>
                                <LearnovaQuizBuilder
                                    chunkId={chunk.id}
                                    initialQuizzes={chunkQuizzes}
                                    onSave={handleSaveQuizzes}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
        </div>
    )
}

export default ChunkItem
