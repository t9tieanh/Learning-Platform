import React from 'react'
import { Brain, Sparkles, FileText, LayoutList, MessageSquareText } from 'lucide-react'
import HighGlossBackground from '@/components/common/HighGlossBackground'
import { LessonChunk } from '@/types/ai'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

interface AILessonInsightsProps {
    summary: string | null
    subtitles: string | null
    chunks: LessonChunk[]
}

export const AILessonInsights = ({ summary, subtitles, chunks }: AILessonInsightsProps) => {
    const [activeSubTab, setActiveSubTab] = React.useState<'summary' | 'chunks' | 'srt'>('summary')

    return (
        <div className='mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700'>
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

                <div className='flex bg-white/5 px-4 gap-4 border-t border-white/10'>
                    <button
                        onClick={() => setActiveSubTab('summary')}
                        className={`py-4 px-4 text-xs font-bold uppercase tracking-widest transition-all relative flex items-center gap-2 ${activeSubTab === 'summary' ? 'text-white' : 'text-blue-100/40 hover:text-blue-100'
                            }`}
                    >
                        <FileText className='w-3.5 h-3.5' />
                        Tóm tắt
                        {activeSubTab === 'summary' && <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400 rounded-full' />}
                    </button>
                    <button
                        onClick={() => setActiveSubTab('chunks')}
                        className={`py-4 px-4 text-xs font-bold uppercase tracking-widest transition-all relative flex items-center gap-2 ${activeSubTab === 'chunks' ? 'text-white' : 'text-blue-100/40 hover:text-blue-100'
                            }`}
                    >
                        <LayoutList className='w-3.5 h-3.5' />
                        Phân đoạn
                        {activeSubTab === 'chunks' && <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400 rounded-full' />}
                    </button>
                    <button
                        onClick={() => setActiveSubTab('srt')}
                        className={`py-4 px-4 text-xs font-bold uppercase tracking-widest transition-all relative flex items-center gap-2 ${activeSubTab === 'srt' ? 'text-white' : 'text-blue-100/40 hover:text-blue-100'
                            }`}
                    >
                        <MessageSquareText className='w-3.5 h-3.5' />
                        Kịch bản
                        {activeSubTab === 'srt' && <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400 rounded-full' />}
                    </button>
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
                            <Accordion type='single' collapsible className='w-full space-y-4'>
                                {chunks.map((chunk, idx) => (
                                    <AccordionItem
                                        key={chunk.id}
                                        value={chunk.id}
                                        className='border border-gray-100 rounded-2xl px-6 bg-gray-50/50 overflow-hidden'
                                    >
                                        <AccordionTrigger className='hover:no-underline py-4'>
                                            <div className='flex items-center gap-4 text-left'>
                                                <span className='w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-[11px] font-black shrink-0 shadow-lg shadow-blue-100'>
                                                    {idx + 1}
                                                </span>
                                                <div className='flex flex-col'>
                                                    <span className='text-[13px] font-bold text-gray-800 tracking-tight'>{chunk.title}</span>
                                                    <span className='text-[10px] text-blue-600 font-bold uppercase mt-0.5 tracking-wider'>
                                                        Bắt đầu từ: {chunk.startTime}
                                                    </span>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className='pb-6 pt-2'>
                                            <div className='pl-12'>
                                                <p className='text-[12px] text-gray-600 leading-relaxed font-medium bg-white p-4 rounded-xl border border-gray-100'>
                                                    {chunk.summary}
                                                </p>
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
