import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle } from 'lucide-react'

interface QuizChoiceItemProps {
    choice: any
    isAnswered: boolean
    isSelected: boolean
    onSelect: (id: string) => void
}

const QuizChoiceItem = memo(({ 
    choice, 
    isAnswered, 
    isSelected, 
    onSelect 
}: QuizChoiceItemProps) => {
    const isCorrect = choice.isCorrect

    let styleClass = 'border-slate-100 bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/50 text-slate-700'
    if (isAnswered) {
        if (isCorrect) styleClass = 'border-emerald-200 bg-emerald-50/80 text-emerald-900 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
        else if (isSelected) styleClass = 'border-rose-200 bg-rose-50/80 text-rose-900 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
        else styleClass = 'opacity-40 border-slate-50'
    }

    return (
        <motion.button
            whileHover={!isAnswered ? { x: 4 } : {}}
            whileTap={!isAnswered ? { scale: 0.985 } : {}}
            onClick={() => onSelect(choice.id)}
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
})

QuizChoiceItem.displayName = 'QuizChoiceItem'

export default QuizChoiceItem
