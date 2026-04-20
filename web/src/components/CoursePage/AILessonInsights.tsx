import React from 'react'
import { Brain, Sparkles, FileText, LayoutList, MessageSquareText } from 'lucide-react'
import HighGlossBackground from '@/components/common/HighGlossBackground'
import { LessonChunk } from '@/types/ai'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import CustomButton from '@/components/common/Button'
import { motion } from 'framer-motion'

import { AIChatSection } from './AIChatSection'

interface AILessonInsightsProps {
    lessonId: string
    summary: string | null
    subtitles: string | null
    chunks: LessonChunk[]
    onSeek?: (timestamp: string) => void
    defaultOpenChunkId?: string | null
}

export const AILessonInsights = ({ lessonId, summary, subtitles, chunks, onSeek, defaultOpenChunkId }: AILessonInsightsProps) => {
    const [activeSubTab, setActiveSubTab] = React.useState<'summary' | 'chunks' | 'srt' | 'chat'>('summary')
    const [openChunkId, setOpenChunkId] = React.useState<string | undefined>(undefined)

    React.useEffect(() => {
        if (defaultOpenChunkId) {
            setActiveSubTab('chunks')
            setOpenChunkId(defaultOpenChunkId)

            // Minimal delay to ensure tab has switched and DOM is ready
            setTimeout(() => {
                const element = document.getElementById(`chunk-${defaultOpenChunkId}`)
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
            }, 100)
        }
    }, [defaultOpenChunkId])

    return (
        <div className='mt-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700'>
            <HighGlossBackground className='rounded-2xl shadow-xl border border-blue-400/20 overflow-hidden'>
                <div className='px-6 py-5 flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                        <div className='w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white shadow-xl backdrop-blur-md border border-white/20 shrink-0'>
                            <Brain className='w-6 h-6' />
                        </div>
                        <div className='flex flex-col'>
                            <h2 className='text-white font-bold text-[15px] tracking-tight leading-tight'>
                                Phân tích bài giảng chuyên sâu
                            </h2>
                            <p className='text-[11px] text-blue-100/60 mt-1 flex items-center gap-2 font-bold uppercase tracking-widest'>
                                <Sparkles className='w-3 h-3 text-blue-300 animate-pulse' /> Learnova AI Insight
                            </p>
                        </div>
                    </div>
                </div>

                <div className='flex bg-white/5 px-4 gap-2 border-t border-white/10 overflow-x-auto scrollbar-none'>
                    <CustomButton
                        variant='ghost'
                        onClick={() => setActiveSubTab('summary')}
                        className={`py-6 px-5 h-auto text-[11px] font-bold uppercase tracking-widest transition-all relative flex items-center gap-2.5 rounded-none border-none hover:bg-transparent ${activeSubTab === 'summary' ? 'text-white' : 'text-blue-100/40 hover:text-blue-100'
                            }`}
                        label='Tóm tắt'
                        icon={<FileText className='w-3.5 h-3.5' />}
                    >
                        {activeSubTab === 'summary' && (
                            <motion.div
                                layoutId='subtab-indicator'
                                className='absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400'
                            />
                        )}
                    </CustomButton>

                    <CustomButton
                        variant='ghost'
                        onClick={() => setActiveSubTab('chunks')}
                        className={`py-6 px-5 h-auto text-[11px] font-bold uppercase tracking-widest transition-all relative flex items-center gap-2.5 rounded-none border-none hover:bg-transparent ${activeSubTab === 'chunks' ? 'text-white' : 'text-blue-100/40 hover:text-blue-100'
                            }`}
                        label='Phân đoạn'
                        icon={<LayoutList className='w-3.5 h-3.5' />}
                    >
                        {activeSubTab === 'chunks' && (
                            <motion.div
                                layoutId='subtab-indicator'
                                className='absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400'
                            />
                        )}
                    </CustomButton>

                    <CustomButton
                        variant='ghost'
                        onClick={() => setActiveSubTab('srt')}
                        className={`py-6 px-5 h-auto text-[11px] font-bold uppercase tracking-widest transition-all relative flex items-center gap-2.5 rounded-none border-none hover:bg-transparent ${activeSubTab === 'srt' ? 'text-white' : 'text-blue-100/40 hover:text-blue-100'
                            }`}
                        label='Kịch bản'
                        icon={<MessageSquareText className='w-3.5 h-3.5' />}
                    >
                        {activeSubTab === 'srt' && (
                            <motion.div
                                layoutId='subtab-indicator'
                                className='absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400'
                            />
                        )}
                    </CustomButton>
                </div>
            </HighGlossBackground>

            <div className='bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm'>
                {activeSubTab === 'summary' && (
                    <div className='prose prose-blue max-w-none'>
                        <p className='text-gray-700 leading-[1.8] text-[14px] font-medium'>
                            {summary || 'Đang cập nhật nội dung tóm tắt từ hệ thống AI...'}
                        </p>
                    </div>
                )}

                {activeSubTab === 'chunks' && (
                    <div className='space-y-4'>
                        {chunks.length > 0 ? (
                            <Accordion
                                type='single'
                                collapsible
                                className='w-full space-y-4'
                                value={openChunkId}
                                onValueChange={setOpenChunkId}
                            >
                                {chunks.map((chunk, idx) => (
                                    <AccordionItem
                                        key={chunk.id}
                                        value={chunk.id}
                                        id={`chunk-${chunk.id}`}
                                        className='border border-gray-100 rounded-2xl px-6 bg-gray-50/50 overflow-hidden group/item hover:bg-white transition-colors'
                                    >
                                        <div className='flex items-center w-full'>
                                            <AccordionTrigger className='flex-1 hover:no-underline py-5'>
                                                <div className='flex items-center gap-4 text-left'>
                                                    <span className='w-9 h-9 rounded-[0.9rem] bg-blue-600 text-white flex items-center justify-center text-[11px] font-black shrink-0 shadow-lg shadow-blue-500/20 group-hover/item:scale-110 transition-transform'>
                                                        {idx + 1}
                                                    </span>
                                                    <div className='flex flex-col'>
                                                        <span className='text-[14px] font-bold text-gray-800 tracking-tight group-hover/item:text-blue-600 transition-colors'>
                                                            {chunk.title}
                                                        </span>
                                                        <div className='flex items-center gap-3 mt-1'>
                                                            <span className='text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1'>
                                                                Thời điểm: <span className='text-blue-600'>{chunk.startTime}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>

                                            <CustomButton
                                                variant='ghost'
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSeek?.(chunk.startTime || '00:00');
                                                }}
                                                className='h-9 w-9 p-0 rounded-xl hover:bg-blue-50 text-blue-600 shrink-0'
                                                icon={<Sparkles className='w-4 h-4' />}
                                            />
                                        </div>

                                        <AccordionContent className='pb-6 pt-0'>
                                            <div className='pl-13'>
                                                <div className='bg-white p-5 rounded-2xl border border-gray-100 shadow-sm'>
                                                    <p className='text-[12px] text-gray-600 leading-relaxed font-medium'>
                                                        {chunk.summary}
                                                    </p>
                                                    <div className='mt-4 flex justify-end'>
                                                        <CustomButton
                                                            variant='default'
                                                            size='sm'
                                                            onClick={() => onSeek?.(chunk.startTime || '00:00')}
                                                            label='Đi tới đoạn này'
                                                            className='bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider px-5 h-8 shadow-lg shadow-blue-500/20'
                                                            icon={<Brain className='w-3 h-3' />}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ) : (
                            <p className='text-center py-10 text-gray-400 font-medium italic'>Chưa có dữ liệu phân đoạn cho bài học này.</p>
                        )}
                    </div>
                )}

                {activeSubTab === 'srt' && (
                    <div className='bg-gray-900 rounded-2xl p-6 font-mono text-[12px] text-gray-300 max-h-[500px] overflow-y-auto leading-relaxed shadow-inner'>
                        <pre className='whitespace-pre-wrap break-words'>
                            {subtitles || 'Đang tải kịch bản AI...'}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    )
}
