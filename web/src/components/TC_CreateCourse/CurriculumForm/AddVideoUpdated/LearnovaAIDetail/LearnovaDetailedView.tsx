import React from 'react'
import { MessageSquare, Sparkles } from 'lucide-react'
import { LessonChunk } from '@/types/ai'
import { AnalysisResult } from '@/services/assistant/analysis.service'
import { SubtitleEntry } from '@/components/common/Video/LearnovaVideoPlayer'

import Header from './components/Header'
import VideoPreview from './components/VideoPreview'
import ChunkItem from './components/ChunkItem'

interface LearnovaDetailedViewProps {
    analysisData: AnalysisResult | null
    videoSrc: string | null
    onBack: () => void
    detailedVideoRef: React.RefObject<HTMLVideoElement | null>
    chunkQuestions: Record<string, string[]>
    newQuestionInputs: Record<string, string>
    handleAddQuestion: (chunkId: string) => void
    handleRemoveQuestion: (chunkId: string, index: number) => void
    setNewQuestionInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>
    handleSeek: (startTime: string | null) => void
    mockSubtitles: SubtitleEntry[]
    mainWrapperRef?: React.RefObject<HTMLDivElement | null>
    onSaveSummary: (chunkId: string, newSummary: string) => Promise<void>
}

const LearnovaDetailedView: React.FC<LearnovaDetailedViewProps> = ({
    analysisData,
    videoSrc,
    onBack,
    detailedVideoRef,
    chunkQuestions,
    newQuestionInputs,
    handleAddQuestion,
    handleRemoveQuestion,
    setNewQuestionInputs,
    handleSeek,
    mockSubtitles,
    mainWrapperRef,
    onSaveSummary
}) => {
    const chunks: LessonChunk[] = analysisData?.chunks || []
    const [editingSummaryId, setEditingSummaryId] = React.useState<string | null>(null)
    const [draftSummary, setDraftSummary] = React.useState<string>('')
    const [isSavingSummary, setIsSavingSummary] = React.useState(false)

    const handleStartEdit = (chunk: LessonChunk) => {
        setEditingSummaryId(chunk.id)
        setDraftSummary(chunk.summary || '')
    }

    const handleCancelEdit = () => {
        setEditingSummaryId(null)
        setDraftSummary('')
    }

    const handleSave = async (chunkId: string) => {
        try {
            setIsSavingSummary(true)
            await onSaveSummary(chunkId, draftSummary)
            setEditingSummaryId(null)
        } catch (error) {
            console.error('Failed to save summary:', error)
        } finally {
            setIsSavingSummary(false)
        }
    }

    return (
        <div ref={mainWrapperRef} className='animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-16 relative px-2 md:px-0'>
            <Header onBack={onBack} />

            <div className='max-w-6xl mx-auto w-full px-4'>
                <VideoPreview
                    videoSrc={videoSrc}
                    detailedVideoRef={detailedVideoRef}
                    subtitles={mockSubtitles}
                />
            </div>

            <div className='max-w-5xl mx-auto w-full px-4'>
                <div className='space-y-6'>
                    <div className='flex items-center justify-between px-6 py-5 bg-gradient-to-r from-blue-50/40 to-transparent rounded-2xl border-l-4 border-blue-600 shadow-sm'>
                        <div className='flex items-center gap-4'>
                            <div className='p-3 bg-blue-600 rounded-xl shadow-md shadow-blue-100'>
                                <MessageSquare className='w-5 h-5 text-white' />
                            </div>
                            <div>
                                <h2 className='text-lg font-bold text-gray-900 leading-tight'>
                                    Cấu trúc nội dung bài giảng
                                </h2>
                                <p className='text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 flex items-center gap-1.5'>
                                    <Sparkles className='w-3 h-3 text-blue-500' /> AI Analysis
                                </p>
                            </div>
                        </div>
                        <div className='bg-white px-3 py-1 rounded-full border border-blue-100'>
                            <span className='text-[10px] font-black text-blue-600 uppercase tracking-tight'>
                                {chunks.length} phân đoạn
                            </span>
                        </div>
                    </div>

                    <div className='space-y-6'>
                        {chunks.map((chunk, idx) => (
                            <ChunkItem
                                key={chunk.id}
                                chunk={chunk}
                                idx={idx}
                                handleSeek={handleSeek}
                                editingSummaryId={editingSummaryId}
                                draftSummary={draftSummary}
                                setDraftSummary={setDraftSummary}
                                isSavingSummary={isSavingSummary}
                                handleStartEdit={handleStartEdit}
                                handleCancelEdit={handleCancelEdit}
                                handleSave={handleSave}
                                chunkQuestions={chunkQuestions}
                                newQuestionInputs={newQuestionInputs}
                                setNewQuestionInputs={setNewQuestionInputs}
                                handleAddQuestion={handleAddQuestion}
                                handleRemoveQuestion={handleRemoveQuestion}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LearnovaDetailedView
