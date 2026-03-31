import React from 'react'
import { PlayCircle, Pencil, RefreshCw, Check, Search, Trash2, Plus } from 'lucide-react'
import { LessonChunk } from '@/types/ai'
import CustomInput from '@/components/common/Input'

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
    chunkQuestions,
    newQuestionInputs,
    setNewQuestionInputs,
    handleAddQuestion,
    handleRemoveQuestion
}) => {
    return (
        <div className='group bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-500'>
            {/* Chunk Header with Gradient */}
            <div className='bg-gradient-to-r from-gray-50/50 via-white to-gray-50/50 px-8 py-6 border-b border-gray-50 flex items-center justify-between'>
                <div className='flex items-center gap-5'>
                    <div className='relative'>
                        <div className='absolute inset-0 bg-blue-600 blur-md opacity-10 scale-125'></div>
                        <div className='relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md'>
                            {idx + 1}
                        </div>
                    </div>
                    <div>
                        <h4 className='font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors'>
                            {chunk.title || `Đoạn ${idx + 1}`}
                        </h4>
                        <div className='flex items-center gap-4 text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest'>
                            <span className='flex items-center gap-1 bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg'>
                                {chunk.timestamp}
                            </span>
                            <button
                                type='button'
                                onClick={() => handleSeek(chunk.startTime)}
                                className='flex items-center gap-1.5 text-indigo-500 hover:text-indigo-700 transition-all hover:scale-110 active:scale-95'
                            >
                                <PlayCircle className='w-4 h-4' /> Xem từ đây
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className='p-8 space-y-8'>
                {/* Chunk Summary Section */}
                <div className='space-y-4 relative'>
                    <div className='flex items-center justify-between'>
                        <label className='text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] block'>
                            Tóm tắt kiến thức cốt lõi
                        </label>
                        {editingSummaryId !== chunk.id && (
                            <button
                                onClick={() => handleStartEdit(chunk)}
                                className='text-xs font-bold text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-200 hover:border-blue-600 px-3 py-1.5 rounded-xl transition-all flex items-center gap-2 group/btn'
                            >
                                <Pencil className='w-3 h-3 group-hover/btn:rotate-12 transition-transform' /> Chỉnh sửa
                            </button>
                        )}
                    </div>

                    {editingSummaryId === chunk.id ? (
                        <div className='space-y-3 animate-in zoom-in-95 duration-300'>
                            <textarea
                                value={draftSummary}
                                onChange={(e) => setDraftSummary(e.target.value)}
                                className='w-full text-[15px] text-gray-800 leading-relaxed bg-white p-6 rounded-2xl border border-gray-100 shadow-md outline-none transition-all min-h-[140px] font-medium'
                                autoFocus
                            />
                            <div className='flex justify-end gap-3'>
                                <button
                                    onClick={handleCancelEdit}
                                    className='px-5 py-2.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase'
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={() => handleSave(chunk.id)}
                                    disabled={isSavingSummary}
                                    className='px-6 py-2.5 text-xs font-black bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-300 transition-all shadow-md shadow-blue-200 flex items-center gap-2 uppercase tracking-wider'
                                >
                                    {isSavingSummary ? (
                                        <>
                                            <RefreshCw className='w-3.5 h-3.5 animate-spin' /> Đang lưu...
                                        </>
                                    ) : (
                                        <>
                                            <Check className='w-3.5 h-3.5' /> Cập nhật nội dung
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className='relative'>
                            <div className='absolute -left-4 top-0 bottom-0 w-1 bg-blue-100 rounded-full opacity-50 transition-all group-hover:bg-blue-400 group-hover:opacity-100'></div>
                            <p className='text-gray-700 text-[15px] leading-relaxed italic font-medium'>
                                "{chunk.summary || 'Learnova AI đang chuẩn bị tóm tắt cho đoạn này...'}"
                            </p>
                        </div>
                    )}
                </div>

                {/* Questions Section - Premium Glassmorphism */}
                <div className='bg-gray-50/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-100 shadow-inner group/questions'>
                    <div className='flex items-center justify-between mb-6'>
                        <label className='text-sm font-black text-gray-800 flex items-center gap-3'>
                            <div className='p-1.5 bg-white rounded-lg shadow-sm border border-gray-100'>
                                <Search className='w-4 h-4 text-blue-600' />
                            </div>
                            Câu hỏi ôn luyện ({chunkQuestions[chunk.id]?.length || 0})
                        </label>
                    </div>

                    <div className='space-y-4'>
                        {(chunkQuestions[chunk.id] || []).map((q, qIndex) => (
                            <div
                                key={qIndex}
                                className='flex items-center gap-4 bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm animate-in slide-in-from-left-4 duration-500 hover:border-blue-200 transition-colors'
                            >
                                <div className='w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black shadow-sm'>
                                    Q{qIndex + 1}
                                </div>
                                <span className='text-sm font-medium text-gray-700 flex-1'>{q}</span>
                                <button
                                    type='button'
                                    onClick={() => handleRemoveQuestion(chunk.id, qIndex)}
                                    className='p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all'
                                >
                                    <Trash2 className='w-4 h-4' />
                                </button>
                            </div>
                        ))}

                        {/* Add Question Input - Premium Design */}
                        <div className='relative mt-6 group/input'>
                            <div className='absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-0 group-focus-within/input:opacity-10 transition duration-500'></div>
                            <div className='relative'>
                                <CustomInput
                                    placeholder='Đề xuất câu hỏi để học viên tự kiểm tra kiến thức...'
                                    className='pr-14 pl-6 h-14 rounded-2xl text-[14px] bg-white border border-gray-100 focus:border-blue-600 transition-all font-medium placeholder:text-gray-300 shadow-sm'
                                    value={newQuestionInputs[chunk.id] || ''}
                                    onChange={(e) =>
                                        setNewQuestionInputs((prev) => ({ ...prev, [chunk.id]: e.target.value }))
                                    }
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddQuestion(chunk.id)}
                                />
                                <button
                                    type='button'
                                    onClick={() => handleAddQuestion(chunk.id)}
                                    className='absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-md shadow-blue-200'
                                >
                                    <Plus className='w-6 h-6' />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChunkItem
