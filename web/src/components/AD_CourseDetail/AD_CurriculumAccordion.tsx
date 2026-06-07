import { motion } from 'framer-motion'
import { PlayCircle, FileText, Eye, Video, HelpCircle } from 'lucide-react'
import { Section, Lesson } from '@/types/course.type'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { lessonTypeLabel, normalizeLessonType } from '@/utils/lessonType.utils'

interface AD_CurriculumAccordionProps {
  sections: Section[]
  courseId: string
  onViewLesson: (lesson: Lesson) => void
}

function LessonTypeBadge({ type }: { type: Lesson['type'] }) {
  const normalized = normalizeLessonType(type)
  const Icon = normalized === 'article' ? FileText : normalized === 'quiz' ? HelpCircle : Video

  return (
    <Badge variant='secondary' className='gap-1 rounded-md bg-white font-normal text-[11px] text-slate-600'>
      <Icon className='h-3 w-3 shrink-0' />
      {lessonTypeLabel(normalized)}
    </Badge>
  )
}

export function AD_CurriculumAccordion({ sections, onViewLesson }: AD_CurriculumAccordionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className='relative isolate overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_22px_rgba(15,23,42,0.05)]'
    >
      <div className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-12 bg-gradient-to-r from-cyan-100/70 via-blue-100/45 to-transparent' />
      <h2 className='mb-4 text-lg font-semibold tracking-tight text-slate-900'>Nội dung khóa học</h2>

      <Accordion type='multiple' defaultValue={sections.length > 0 ? [sections[0].id] : []} className='space-y-3'>
        {sections.map((section, index) => (
          <AccordionItem
            key={section.id}
            value={section.id}
            className='rounded-lg border border-slate-200 bg-white transition-all duration-300 hover:border-blue-200 hover:bg-blue-50/30'
          >
            <AccordionTrigger className='group px-4 py-3.5 hover:no-underline'>
              <div className='flex w-full items-center justify-between text-left'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-semibold text-white'>
                    {index + 1}
                  </div>
                  <div>
                    <h3 className='font-semibold text-slate-800 transition-colors group-hover:text-blue-700'>{section.title}</h3>
                    <div className='mt-1 flex items-center gap-3 text-xs text-slate-500'>
                      <div className='flex items-center gap-1'>
                        <FileText className='h-3.5 w-3.5' />
                        <span>{section.lessons.length} bài học</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Badge className='hidden rounded-full border border-blue-200 bg-blue-50 text-xs font-medium text-blue-700 sm:inline-flex'>
                  {section.lessons.length} bài
                </Badge>
              </div>
            </AccordionTrigger>

            <AccordionContent className='px-4 pb-4'>
              <div className='ml-10 space-y-2'>
                {section.lessons.map((lesson) => {
                  const isVideo = normalizeLessonType(lesson.type) === 'video'
                  return (
                    <div
                      key={lesson.id}
                      className='flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 transition-colors hover:border-blue-200 hover:bg-blue-50/60'
                    >
                      <div className='flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600'>
                        {isVideo ? (
                          <PlayCircle className='h-3.5 w-3.5' />
                        ) : (
                          <FileText className='h-3.5 w-3.5' />
                        )}
                      </div>
                      <span className='min-w-0 flex-1 truncate text-sm text-slate-700'>{lesson.title}</span>
                      <LessonTypeBadge type={lesson.type} />
                      <Button
                        size='sm'
                        variant='outline'
                        className='h-7 shrink-0 gap-1 text-xs'
                        onClick={() => onViewLesson(lesson)}
                      >
                        <Eye className='h-3.5 w-3.5' />
                        Xem chi tiết
                      </Button>
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
