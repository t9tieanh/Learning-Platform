import { motion } from 'framer-motion'
import { Tag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface CourseSummaryProps {
  shortDescription: string
  studentsCount: number
  rating: number
  reviewsCount: number
  category?: string
  tags?: string[]
}

export function CourseSummary({ shortDescription, category, tags = [] }: CourseSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className='relative isolate overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_22px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(15,23,42,0.09)]'
    >
      <div className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-12 bg-gradient-to-r from-violet-100/60 via-fuchsia-100/40 to-transparent' />
      <h2 className='text-lg font-semibold tracking-tight text-slate-900'>Tổng quan</h2>
      <p className='mt-2 text-sm leading-relaxed text-slate-600'>{shortDescription}</p>

      {category && (
        <div className='mt-4 flex items-center gap-2 text-sm text-slate-600'>
          <Tag className='h-4 w-4 text-violet-600' />
          <span>
            Thể loại: <strong className='font-semibold text-slate-800'>{category}</strong>
          </span>
        </div>
      )}

      {tags.length > 0 && (
        <div className='mt-4 flex flex-wrap gap-2'>
          {tags.map((tag) => (
            <Badge key={tag} className='rounded-md border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700'>
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </motion.div>
  )
}
