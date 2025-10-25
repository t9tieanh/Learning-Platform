import { motion } from 'framer-motion'
import { Users, Star, Tag } from 'lucide-react'
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
      className='rounded-xl bg-card p-6 shadow-md'
    >
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-bold'>Tổng quan</h2>
      </div>
      <p className='text-base leading-relaxed text-foreground mb-6 mt-2'>{shortDescription}</p>

      <div className='flex flex-wrap items-center gap-6 mb-6'>
        {category && (
          <div className='flex items-center gap-2'>
            <Tag className='h-5 w-5 text-primary' />
            <span className='text-sm font-medium'>Thể loại: {category}</span>
          </div>
        )}
      </div>

      {tags.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      )}
    </motion.div>
  )
}
