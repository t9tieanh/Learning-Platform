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
      className='relative isolate overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_22px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(15,23,42,0.09)]'
    >
      <div className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-12 bg-gradient-to-r from-amber-100/75 via-orange-100/45 to-transparent' />
      <h2 className='mb-5 text-lg font-semibold tracking-tight text-slate-900'>Yêu cầu trước khi học</h2>
      <ul className='space-y-2.5 pl-1'>
        {prerequisites.map((prerequisite, index) => (
          <li key={index} className='flex items-center gap-2 text-sm text-slate-700'>
            <BadgeCheck size={16} className='text-amber-600' />
            {prerequisite}
          </li>
        ))}
      </ul>
    </motion.div>
  )
}
