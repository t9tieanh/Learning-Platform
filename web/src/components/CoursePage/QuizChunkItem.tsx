import React, { memo } from 'react'
import { LessonChunk } from '@/types/ai'

interface QuizChunkItemProps {
    chunk: LessonChunk
    idx: number
    isActive: boolean
    isLocked: boolean
    onSelect: (id: string) => void
}

const QuizChunkItem = memo(({ 
    chunk, 
    idx, 
    isActive, 
    isLocked, 
    onSelect 
}: QuizChunkItemProps) => (
    <button
        disabled={isLocked}
        onClick={() => onSelect(chunk.id)}
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
        <span className='truncate max-w-[120px]'>{chunk.title}</span>
        {isLocked && (
            <div className='absolute inset-0 bg-black/5 rounded-xl pointer-events-none' />
        )}
    </button>
))

QuizChunkItem.displayName = 'QuizChunkItem'

export default QuizChunkItem
