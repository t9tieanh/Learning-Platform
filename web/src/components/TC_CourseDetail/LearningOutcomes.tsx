import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

interface LearningOutcomesProps {
  outcomes: string[]
}

export function LearningOutcomes({ outcomes }: LearningOutcomesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className='relative isolate overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_22px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(15,23,42,0.09)]'
    >
      <div className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-12 bg-gradient-to-r from-emerald-100/70 via-cyan-100/45 to-transparent' />
      <h2 className='mb-5 text-lg font-semibold tracking-tight text-slate-900'>Bạn sẽ học được gì</h2>
      <ul className='flex flex-col gap-3 text-sm'>
        {outcomes.map((outcome, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            className='flex items-start gap-3'
          >
            <CheckCircle2 className='mt-0.5 h-4 w-4 shrink-0 text-emerald-600' />
            <span className='leading-relaxed text-slate-700'>{outcome}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  )
}
