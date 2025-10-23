import { motion } from 'framer-motion'
import { Mail, BookOpen } from 'lucide-react'
import { Instructor } from '@/types/course.type'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface InstructorCardProps {
  instructor: Instructor
}

export function InstructorCard({ instructor }: InstructorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className='rounded-xl bg-gradient-card p-6 shadow-md'
    >
      <h2 className='text-2xl font-bold mb-6'>Giảng viên</h2>

      <div className='flex flex-col items-center text-center space-y-4'>
        <Avatar className='h-24 w-24 shadow-md'>
          <AvatarImage src={instructor.image} alt={instructor.name} />
          <AvatarFallback className='text-2xl'>
            {instructor.name ||
              ''
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div>
          <h3 className='text-xl font-semibold mb-2'>{instructor.name}</h3>
          <p className='text-sm text-muted-foreground leading-relaxed'>{instructor.bio}</p>
        </div>

        {instructor.coursesCount && (
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <BookOpen className='h-4 w-4' />
            <span>{instructor.coursesCount} khóa học</span>
          </div>
        )}

        {instructor.email && (
          <Button variant='outline' size='sm' className='w-full gap-2'>
            <Mail className='h-4 w-4' />
            <span className='truncate'>{instructor.email}</span>
          </Button>
        )}
      </div>
    </motion.div>
  )
}
