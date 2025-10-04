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
      className='rounded-xl bg-card p-6 shadow-md'
    >
      <h2 className='text-xl font-bold mb-6'>Bạn sẽ học được gì</h2>
      <ul className='flex flex-col gap-4'>
        {outcomes.map((outcome, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            className='flex items-start gap-3'
          >
            <CheckCircle2 className='h-5 w-5 text-success flex-shrink-0 mt-0.5 text-green-500' />
            <span className='text-sm leading-relaxed text-slate-700'>{outcome}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  )
}
