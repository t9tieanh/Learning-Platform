import React, { useMemo } from 'react'
import { Brain, Sparkles } from 'lucide-react'
import { LessonChunk } from '@/types/ai'
import { AnalysisResult } from '@/services/assistant/analysis.service'
import { SubtitleEntry } from '@/components/common/Video/LearnovaVideoPlayer'
import { parseSRT } from '@/utils/srtParser'
import { Accordion } from '@/components/ui/accordion'

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
    mainWrapperRef,
    onSaveSummary
}) => {
    const chunks: LessonChunk[] = analysisData?.chunks || []
    const [editingSummaryId, setEditingSummaryId] = React.useState<string | null>(null)
    const [draftSummary, setDraftSummary] = React.useState<string>('')
    const [isSavingSummary, setIsSavingSummary] = React.useState(false)

    const subtitles: SubtitleEntry[] = useMemo(() => {
        if (analysisData?.subtitles && typeof analysisData.subtitles === 'string') {
            try {
                return parseSRT(analysisData.subtitles)
            } catch (error) {
                console.warn('Failed to parse SRT subtitles, using fallback:', error)
            }
        }

        return []
    }, [analysisData?.subtitles])

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
                    subtitles={subtitles}
                />
            </div>

            <div className='max-w-5xl mx-auto w-full px-4'>
                <div className='space-y-6'>
                    <div className='bg-gradient-to-r from-blue-50/80 to-transparent rounded-2xl shadow-sm flex items-center justify-between px-6 py-5'>
                        <div className='flex items-center gap-4'>
                            <div className='w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100'>
                                <Brain className='w-4.5 h-4.5' />
                            </div>
                            <div>
                                <h2 className='text-gray-900 font-bold text-sm tracking-tight'>
                                    Cấu trúc nội dung bài giảng
                                </h2>
                                <p className='text-[11px] text-gray-400 mt-0.5 flex items-center gap-1.5 font-medium'>
                                    <Sparkles className='w-3 h-3 text-blue-500' /> Trợ lý AI phân tích
                                </p>
                            </div>
                        </div>
                        <div className='bg-white px-3 py-1 rounded-full border border-blue-100'>
                            <span className='text-[10px] text-blue-600 tracking-tight'>
                                {chunks.length} phân đoạn
                            </span>
                        </div>
                    </div>

                    <div className='w-full'>
                        <Accordion type='single' collapsible defaultValue='chunk-0' className='space-y-6'>
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
                                />
                            ))}
                        </Accordion>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LearnovaDetailedView
