import React, { useMemo } from 'react'
import { Brain, ClipboardList, Sparkles } from 'lucide-react'
import { LessonChunk } from '@/types/ai'
import { AnalysisResult } from '@/services/assistant/analysis.service'
import { SubtitleEntry } from '@/components/common/Video/LearnovaVideoPlayer'
import { parseSRT } from '@/utils/srtParser'
import { Accordion } from '@/components/ui/accordion'
import CustomButton from '@/components/common/Button'

import Header from './components/Header'
import VideoPreview from './components/VideoPreview'
import ChunkItem from './components/ChunkItem'
import LessonExamBlueprintSection from './components/LessonExamBlueprintSection'

import HighGlossBackground from '@/components/common/HighGlossBackground'

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
    onAfterExamGenerate?: () => void
}

const LearnovaDetailedView: React.FC<LearnovaDetailedViewProps> = ({
    analysisData,
    videoSrc,
    onBack,
    detailedVideoRef,
    handleSeek,
    mainWrapperRef,
    onSaveSummary,
    onAfterExamGenerate
}) => {
    const chunks: LessonChunk[] = analysisData?.chunks || []
    /** Toggle: lecture structure vs lesson-test blueprint — avoids stacking both on one long page. */
    const [detailMainPanel, setDetailMainPanel] = React.useState<'structure' | 'lessonExam'>(
        'structure'
    )
    const [editingSummaryId, setEditingSummaryId] = React.useState<string | null>(null)
    const [draftSummary, setDraftSummary] = React.useState<string>('')
    const [isSavingSummary, setIsSavingSummary] = React.useState(false)

    const canOpenLessonExam = chunks.length > 0 && Boolean(analysisData?.lessonId)

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

    React.useEffect(() => {
        // If prerequisites disappear while on the exam panel, fall back to structure.
        if (detailMainPanel === 'lessonExam' && !canOpenLessonExam) {
            setDetailMainPanel('structure')
        }
    }, [detailMainPanel, canOpenLessonExam])

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
                {detailMainPanel === 'structure' ? (
                    <div className='space-y-6'>
                        <HighGlossBackground className='rounded-2xl shadow-xl border border-blue-400/20 overflow-hidden'>
                            <div className='px-6 py-5 md:py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                                <div className='flex items-start gap-4 md:gap-5 min-w-0'>
                                    <div className='w-10 h-10 md:w-12 md:h-12 mt-0.5 shrink-0 bg-white/10 rounded-2xl flex items-center justify-center text-white shadow-xl backdrop-blur-md border border-white/20'>
                                        <Brain className='w-5 h-5 md:w-6 md:h-6' />
                                    </div>
                                    <div className='flex flex-col min-w-0 pt-0.5'>
                                        <h2 className='text-white font-bold text-[15px] md:text-[16px] tracking-tight leading-snug'>
                                            Cấu trúc nội dung bài giảng
                                        </h2>
                                        <p className='text-[10px] md:text-[11px] text-blue-100/80 mt-1.5 flex items-center gap-2 font-medium leading-normal'>
                                            <Sparkles className='w-3 h-3 text-blue-300 animate-pulse shrink-0' />
                                            Trợ lý AI phân tích
                                        </p>
                                    </div>
                                </div>
                                {/* Same fixed height for CTA + segment pill — avoids mismatched button heights */}
                                <div className='flex flex-wrap items-center gap-2 shrink-0 sm:justify-end'>
                                    {canOpenLessonExam ? (
                                        <CustomButton
                                            type='button'
                                            size='lg'
                                            variant='ghost'
                                            label='Tạo bài kiểm tra cho bài học này'
                                            icon={<ClipboardList className='w-3.5 h-3.5 shrink-0' strokeWidth={2.25} />}
                                            className={[
                                                'h-10 min-h-10 max-h-10 py-0 box-border rounded-xl px-4',
                                                'text-[12px] leading-none font-bold whitespace-nowrap',
                                                'bg-white/15 border border-white/25 text-white hover:bg-white/25 hover:text-white',
                                                'shadow-none gap-2 [&_span:first-child]:!mr-0',
                                            ].join(' ')}
                                            onClick={() => setDetailMainPanel('lessonExam')}
                                        />
                                    ) : null}
                                    <div
                                        className={[
                                            'h-10 min-h-10 max-h-10 box-border rounded-xl px-4 inline-flex items-center justify-center',
                                            'bg-white/15 border border-white/25 backdrop-blur-sm shadow-inner shrink-0',
                                        ].join(' ')}
                                    >
                                        <span className='text-[12px] leading-none font-bold text-white whitespace-nowrap tabular-nums'>
                                            {chunks.length} phân đoạn
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </HighGlossBackground>

                        <div className='w-full rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-sm shadow-sm p-4 md:p-6'>
                            <Accordion
                                type='single'
                                collapsible
                                defaultValue={chunks[0]?.id}
                                className='space-y-4 md:space-y-5'
                            >
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
                ) : canOpenLessonExam && analysisData?.lessonId ? (
                    <LessonExamBlueprintSection
                        lessonId={analysisData.lessonId}
                        chunks={chunks}
                        persistedLessonTest={analysisData.lessonTest ?? null}
                        persistedLessonTestChunkGroups={
                            analysisData.lessonTestChunkGroups ?? []
                        }
                        onAfterGenerate={onAfterExamGenerate}
                        onBackToStructure={() => setDetailMainPanel('structure')}
                    />
                ) : null}
            </div>
        </div>
    )
}

export default LearnovaDetailedView
