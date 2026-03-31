import React from 'react'
import { MessageSquare } from 'lucide-react'
import { LessonChunk } from '@/types/ai'
import { AnalysisResult } from '@/services/assistant/analysis.service'
import { SubtitleEntry } from '@/components/common/Video/LearnovaVideoPlayer'

import Header from './components/Header'
import VideoPreview from './components/VideoPreview'
import ChunkItem from './components/ChunkItem'
import AnalyticsSidebar from './components/AnalyticsSidebar'
import TranscriptEditor from './components/TranscriptEditor'

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
        <div ref={mainWrapperRef} className='animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10 pb-20 relative px-2 md:px-0'>
            {/* Header Area */}
            <Header onBack={onBack} />

            {/* Video Playback Section */}
            <VideoPreview
                videoSrc={videoSrc}
                detailedVideoRef={detailedVideoRef}
                subtitles={mockSubtitles}
            />

            {/* Content Split: Chunks vs Info */}
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-10 items-start'>
                <div className='lg:col-span-8 space-y-8'>
                    <div className='flex items-center justify-between px-2'>
                        <h3 className='text-xl font-bold text-gray-900 flex items-center gap-3'>
                            <div className='p-2 bg-blue-50 rounded-xl'>
                                <MessageSquare className='w-6 h-6 text-blue-600' />
                            </div>
                            Phân đoạn & Tương tác bài học
                        </h3>
                        <span className='text-[10px] font-black text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full uppercase tracking-widest'>
                            {chunks.length} PHÂN ĐOẠN ĐÃ ĐỊNH DẠNG
                        </span>
                    </div>

                    <div className='space-y-8'>
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

                {/* Right Area: Fixed Intelligence Metadata */}
                <AnalyticsSidebar chunkCount={chunks.length} />
            </div>

            {/* Transcript Section */}
            <TranscriptEditor chunks={chunks} />
        </div>
    )
}

export default LearnovaDetailedView
