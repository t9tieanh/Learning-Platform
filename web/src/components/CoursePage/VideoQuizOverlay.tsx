import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, ArrowRight, SkipForward, PlayCircle } from 'lucide-react'
import { LessonChunk } from '@/types/ai'
import CustomButton from '@/components/common/Button'
import { timeToSeconds } from '@/utils/time/time.utils'

interface VideoQuizOverlayProps {
    chunk: LessonChunk
    allChunks: LessonChunk[]
    maxTimeWatched: number
    onSkip: () => void
    onContinue: () => void
    onClose: () => void
    onSeek: (time: number) => void
}

const VideoQuizOverlay: React.FC<VideoQuizOverlayProps> = ({
    chunk: initialChunk,
    allChunks,
    maxTimeWatched,
    onSkip,
    onContinue,
    onClose,
    onSeek
}) => {
    const [activeChunkId, setActiveChunkId] = useState(initialChunk.id)
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
    const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null)
    const [isAnswered, setIsAnswered] = useState(false)
 
    React.useEffect(() => {
        setActiveChunkId(initialChunk.id)
        setCurrentQuizIndex(0)
        setSelectedChoiceId(null)
        setIsAnswered(false)
    }, [initialChunk.id])

    const activeChunk = allChunks.find(c => c.id === activeChunkId) || initialChunk
    const quizzes = activeChunk.quizzes || []
    const currentQuiz = quizzes[currentQuizIndex]

    const handleChunkSwitch = (chunkId: string) => {
        setActiveChunkId(chunkId)
        setCurrentQuizIndex(0)
        setSelectedChoiceId(null)
        setIsAnswered(false)
    }

    if (!currentQuiz) return null

    const isLastQuiz = currentQuizIndex === quizzes.length - 1

    const handleChoiceSelect = (choiceId: string) => {
        if (isAnswered) return
        setSelectedChoiceId(choiceId)
        setIsAnswered(true)
    }

    const handleNextAction = () => {
        if (isAnswered) {
            if (isLastQuiz) {
                onContinue()
            } else {
                setCurrentQuizIndex(prev => prev + 1)
                setIsAnswered(false)
                setSelectedChoiceId(null)
            }
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='absolute inset-0 z-50 flex items-center justify-center p-4 md:p-8'
        >
            <div className='absolute inset-0 bg-black/40 backdrop-blur-[1px]' onClick={onClose} />

            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className='relative w-full max-lg bg-white/95 backdrop-blur-xl rounded-[2rem] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col'
                style={{ maxWidth: '40rem' }}
            >
                <div className='bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 px-7 py-6 text-white'>
                    <div className='flex items-center justify-between mb-4'>
                        <div className='flex items-center gap-2'>
                            <span className='text-[10px] font-semibold uppercase tracking-widest opacity-70'>Hệ thống ôn tập</span>
                            {quizzes.length > 1 && (
                                <span className='text-[9px] font-bold bg-white/20 px-2 py-0.5 rounded-full'>
                                    {currentQuizIndex + 1}/{quizzes.length}
                                </span>
                            )}
                        </div>
                        <span className='px-3 py-0.5 bg-white/10 rounded-full text-[9px] font-medium border border-white/10'>
                            Thời lượng: {activeChunk.startTime} - {activeChunk.endTime}
                        </span>
                    </div>

                    <div 
                        className='flex items-center gap-1.5 mb-6 overflow-x-auto pb-1 scrollbar-hide'
                        style={{ 
                            msOverflowStyle: 'none', 
                            scrollbarWidth: 'none',
                            WebkitOverflowScrolling: 'touch'
                        }}
                    >
                        <style>{`
                            .scrollbar-hide::-webkit-scrollbar {
                                display: none;
                            }
                        `}</style>
                        {allChunks.filter(c => c.quizzes && c.quizzes.length > 0).map((c, idx) => {
                            const isLocked = timeToSeconds(c.startTime) > maxTimeWatched + 2
                            const isActive = activeChunkId === c.id

                            return (
                                <button
                                    key={c.id}
                                    disabled={isLocked}
                                    onClick={() => handleChunkSwitch(c.id)}
                                    className={`px-3.5 py-2 rounded-xl text-[9px] font-bold uppercase tracking-tight transition-all whitespace-nowrap border flex flex-col items-start gap-0.5 relative ${isActive
                                        ? 'bg-white text-blue-600 border-white shadow-lg'
                                        : isLocked
                                            ? 'bg-black/10 text-white/30 border-white/5 cursor-not-allowed opacity-50'
                                            : 'bg-white/10 text-white/60 border-white/10 hover:bg-white/20'
                                        }`}
                                >
                                    <div className='flex items-center gap-1'>
                                        <span className={`text-[8px] opacity-70 ${isActive ? 'text-blue-500' : isLocked ? 'text-white/20' : 'text-white/40'}`}>
                                            Phần {idx + 1}
                                        </span>
                                        {isLocked && <div className='w-2 h-2 rounded-full bg-white/20 flex items-center justify-center'><div className='w-1 h-1 bg-white/40 rounded-full' /></div>}
                                    </div>
                                    <span className='truncate max-w-[120px]'>{c.title}</span>
                                    {isLocked && (
                                        <div className='absolute inset-0 bg-black/5 rounded-xl pointer-events-none' />
                                    )}
                                </button>
                            )
                        })}
                    </div>

                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={activeChunkId + currentQuizIndex}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h3 className='text-base md:text-lg font-bold leading-snug mb-2'>
                                {currentQuiz.question}
                            </h3>
                            <div className='flex items-center gap-2'>
                                <span className='px-2.5 py-0.5 bg-white/20 rounded-lg text-[10px] font-bold border border-white/10 backdrop-blur-sm'>
                                    Chuyên đề: {activeChunk.title}
                                </span>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className='p-7 flex flex-col flex-1'>
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={activeChunkId + currentQuizIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                            className='grid grid-cols-1 md:grid-cols-2 gap-3 mb-6'
                        >
                            {currentQuiz.choices.map((choice) => {
                                const isCorrect = choice.isCorrect
                                const isSelected = selectedChoiceId === choice.id

                                let styleClass = 'border-slate-100 bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/50 text-slate-700'
                                if (isAnswered) {
                                    if (isCorrect) styleClass = 'border-emerald-200 bg-emerald-50/80 text-emerald-900 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                    else if (isSelected) styleClass = 'border-rose-200 bg-rose-50/80 text-rose-900 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                                    else styleClass = 'opacity-40 border-slate-50'
                                }

                                return (
                                    <motion.button
                                        key={choice.id}
                                        whileHover={!isAnswered ? { x: 4 } : {}}
                                        whileTap={!isAnswered ? { scale: 0.985 } : {}}
                                        onClick={() => handleChoiceSelect(choice.id)}
                                        className={`w-full text-left px-5 py-4 rounded-2xl border transition-all flex items-center justify-between gap-4 group cursor-pointer ${styleClass}`}
                                        disabled={isAnswered}
                                    >
                                        <span className='text-sm font-medium tracking-tight leading-relaxed'>
                                            {choice.text}
                                        </span>
                                        {isAnswered && (
                                            <motion.div
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className='flex-shrink-0'
                                            >
                                                {isCorrect ? (
                                                    <div className='w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center'>
                                                        <CheckCircle2 className='w-4 h-4 text-white' />
                                                    </div>
                                                ) : isSelected ? (
                                                    <div className='w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center'>
                                                        <XCircle className='w-4 h-4 text-white' />
                                                    </div>
                                                ) : null}
                                            </motion.div>
                                        )}
                                    </motion.button>
                                )
                            })}
                        </motion.div>
                    </AnimatePresence>

                    <AnimatePresence mode='wait'>
                        {isAnswered && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className='bg-blue-50/50 rounded-2xl p-5 mb-6 border border-blue-100/50 overflow-hidden'
                            >
                                <div className='flex items-center justify-between mb-3'>
                                    <div className='flex flex-col gap-0.5'>
                                        <div className='text-[10px] font-bold text-blue-600 uppercase tracking-wider'>Giải thích</div>
                                        <div className='text-[10px] text-slate-400 font-medium truncate max-w-[250px]'>{activeChunk.title}</div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => onSeek(timeToSeconds(activeChunk.startTime))}
                                        className='flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all text-[10px] font-bold uppercase tracking-tight whitespace-nowrap'
                                    >
                                        <PlayCircle className='w-4 h-4' /> Xem lại đoạn này
                                    </motion.button>
                                </div>
                                <p className='text-xs text-slate-600 leading-relaxed font-normal'>
                                    {currentQuiz.explanation}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className='flex items-center justify-end gap-3 mt-auto'>
                        <CustomButton
                            variant='ghost'
                            className='text-slate-400 hover:text-slate-600 text-[11px] font-semibold tracking-wider'
                            onClick={onSkip}
                            label='Bỏ qua tất cả'
                            icon={<SkipForward className='w-3.5 h-3.5' />}
                            iconPosition='right'
                        />
                        {isAnswered && (
                            <CustomButton
                                variant='default'
                                className='bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 font-bold text-[11px] tracking-wider shadow-lg shadow-blue-500/20'
                                onClick={handleNextAction}
                                label={isLastQuiz ? 'Hoàn thành & Xem tiếp' : 'Câu hỏi tiếp theo'}
                                icon={<ArrowRight className='w-4 h-4' />}
                                iconPosition='right'
                            />
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default VideoQuizOverlay
