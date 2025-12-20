import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PlayCircle, Clock, FileText } from 'lucide-react'
import { Section, Lesson } from '@/types/course.type'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface CurriculumAccordionProps {
  sections: Section[]
  courseId: string
  onPlayLesson: (lesson: Lesson) => void
}

export function CurriculumAccordion({ sections, courseId, onPlayLesson }: CurriculumAccordionProps) {
  const [openSections, setOpenSections] = useState<string[]>([])

  // Load saved state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`course-${courseId}-sections`)
    if (saved) {
      setOpenSections(JSON.parse(saved))
    } else {
      // Default: open first section
      setOpenSections(sections.length > 0 ? [sections[0].id] : [])
    }
  }, [courseId, sections])

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem(`course-${courseId}-sections`, JSON.stringify(openSections))
  }, [openSections, courseId])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className='rounded-xl bg-card p-6 shadow-md space-y-4'
    >
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-bold'>Nội dung khóa học</h2>
      </div>

      <Accordion type='multiple' value={openSections} onValueChange={setOpenSections} className='space-y-4'>
        {sections.map((section, index) => (
          <AccordionItem
            key={section.id}
            value={section.id}
            className='border border-border rounded-lg bg-card hover:shadow-soft transition-all duration-300'
          >
            <AccordionTrigger className='px-6 py-4 hover:no-underline group'>
              <div className='flex items-center justify-between w-full text-left'>
                <div className='flex items-center gap-4'>
                  <div className='w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-semibold'>
                    {index + 1}
                  </div>
                  <div>
                    <h3 className='font-semibold text-foreground group-hover:text-primary transition-colors'>
                      {section.title}
                    </h3>
                    <div className='flex items-center gap-4 mt-1 text-sm text-muted-foreground'>
                      <div className='flex items-center gap-1'>
                        <FileText className='w-4 h-4' />
                        <span>{section.lessons.length} bài học</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <Clock className='w-4 h-4' />
                        <span>
                          {(() => {
                            const totalSeconds = section.lessons.reduce(
                              (acc, l) => acc + (l.duration ? parseInt(l.duration) : 0),
                              0
                            )

                            const hours = Math.floor(totalSeconds / 3600)
                            const minutes = Math.floor((totalSeconds % 3600) / 60)

                            return `${hours > 0 ? `${hours} giờ ` : ''}${minutes} phút`
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <Badge className='hidden sm:inline-flex'>{section.lessons.length} bài</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className='px-6 pb-6'>
              <div className='ml-20 space-y-3'>
                {section.lessons.map((lesson) => {
                  const canPlay = lesson.type === 'video' && lesson.videoUrl
                  return (
                    <div
                      key={lesson.id}
                      className='flex items-center gap-3 p-3 rounded-lg bg-slate-100 hover:bg-muted transition-colors'
                    >
                      <div className='w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center'>
                        {canPlay && (
                          <Button
                            size='icon'
                            variant='ghost'
                            onClick={() => onPlayLesson(lesson)}
                            aria-label={`Phát ${lesson.title}`}
                          >
                            <PlayCircle className='h-4 w-4' />
                          </Button>
                        )}
                      </div>
                      <span className='text-muted-foreground flex-1 truncate'>{lesson.title}</span>
                      <Badge variant='secondary' className='text-xs'>
                        {lesson.type === 'video' ? 'Video' : lesson.type === 'article' ? 'Bài viết' : 'Nội dung'}
                      </Badge>
                      <span className='text-xs text-muted-foreground'>
                        {(() => {
                          const seconds = Math.floor(Number(lesson.duration) || 0)
                          const hours = Math.floor(seconds / 3600)
                          const minutes = Math.floor((seconds % 3600) / 60)
                          return hours > 0 ? `${hours}h${minutes.toString().padStart(2, '0')}m` : `${minutes}m`
                        })()}
                      </span>
                    </div>
                  )
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </motion.div>
  )
}
