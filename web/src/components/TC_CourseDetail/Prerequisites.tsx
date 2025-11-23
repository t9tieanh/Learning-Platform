import { motion } from 'framer-motion'
import { BadgeCheck } from 'lucide-react'

interface PrerequisitesProps {
  prerequisites: string[]
}

export function Prerequisites({ prerequisites }: PrerequisitesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className='rounded-xl bg-card p-6 shadow-md'
    >
      <h2 className='text-xl font-bold mb-6'>Yêu cầu trước khi học</h2>
      <ul className='pl-2 space-y-2'>
        {prerequisites.map((prerequisite, index) => (
          <li key={index} className='text-sm flex items-center gap-2'>
            <BadgeCheck size={18} className='text-blue-500' />
            {prerequisite}
          </li>
        ))}
      </ul>
    </motion.div>
  )
}
