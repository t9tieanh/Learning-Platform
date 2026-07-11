import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { PlayCircle, Clock, FileText, File, X } from 'lucide-react'
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
  const [artifactOpen, setArtifactOpen] = useState(false)
  const [currentArtifact, setCurrentArtifact] = useState<Lesson | null>(null)

  const handleOpenArtifact = (lesson: Lesson) => {
    setCurrentArtifact(lesson)
    setArtifactOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const handleCloseArtifact = () => {
    setArtifactOpen(false)
    setCurrentArtifact(null)
    document.body.style.overflow = 'unset'
  }

  useEffect(() => {
    const saved = localStorage.getItem(`course-${courseId}-sections`)
    if (saved) {
      setOpenSections(JSON.parse(saved))
    } else {
      setOpenSections(sections.length > 0 ? [sections[0].id] : [])
    }
  }, [courseId, sections])

  useEffect(() => {
    localStorage.setItem(`course-${courseId}-sections`, JSON.stringify(openSections))
  }, [openSections, courseId])

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className='relative isolate overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_22px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(15,23,42,0.09)]'
    >
      <div className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-12 bg-gradient-to-r from-cyan-100/70 via-blue-100/45 to-transparent' />
      <h2 className='mb-4 text-lg font-semibold tracking-tight text-slate-900'>Nội dung khóa học</h2>

      <Accordion type='multiple' value={openSections} onValueChange={setOpenSections} className='space-y-3'>
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
                      <div className='flex items-center gap-1'>
                        <Clock className='h-3.5 w-3.5' />
                        <span>
                          {(() => {
                            const totalSeconds = section.lessons.reduce((acc, l) => acc + (l.duration ? parseInt(l.duration) : 0), 0)
                            const hours = Math.floor(totalSeconds / 3600)
                            const minutes = Math.floor((totalSeconds % 3600) / 60)
                            return `${hours > 0 ? `${hours} giờ ` : ''}${minutes} phút`
                          })()}
                        </span>
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
                  const canPlay = lesson.type === 'video' && lesson.videoUrl
                  const canView = lesson.type === 'article' && lesson.videoUrl
                  return (
                    <div key={lesson.id} className='flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 transition-colors hover:border-blue-200 hover:bg-blue-50/60'>
                      <div className='flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600'>
                        {canPlay && (
                          <Button size='icon' variant='ghost' className='h-5 w-5 rounded-full hover:bg-blue-200/60' onClick={() => onPlayLesson(lesson)} aria-label={`Phát ${lesson.title}`}>
                            <PlayCircle className='h-3.5 w-3.5' />
                          </Button>
                        )}
                        {canView && (
                          <Button size='icon' variant='ghost' className='h-5 w-5 rounded-full hover:bg-blue-200/60' onClick={() => handleOpenArtifact(lesson)} aria-label={`Xem ${lesson.title}`}>
                            <File className='h-3.5 w-3.5' />
                          </Button>
                        )}
                      </div>
                      <span className='flex-1 truncate text-sm text-slate-700'>{lesson.title}</span>
                      <Badge variant='secondary' className='rounded-md bg-white text-[11px] text-slate-600'>
                        {lesson.type === 'video' ? 'Video' : lesson.type === 'article' ? 'Bài viết' : lesson.type === 'artifact' ? 'Tài liệu' : 'Nội dung'}
                      </Badge>
                      <span className='text-xs text-slate-500'>
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

    {artifactOpen && currentArtifact && createPortal(
      (
        <>
          <div className='fixed inset-0 z-[99998] bg-black/70' onClick={handleCloseArtifact} />
          <div className='fixed inset-0 z-[99999] flex items-center justify-center p-4' onClick={handleCloseArtifact}>
            <div className='relative w-full max-w-5xl h-[95vh] bg-white rounded-xl shadow-2xl flex flex-col' onClick={(e) => e.stopPropagation()}>
          <div className='flex-1 overflow-hidden'>
            {currentArtifact.videoUrl ? (
              <iframe
                src={currentArtifact.videoUrl}
                title={currentArtifact.title}
                className='w-full h-full border-none'
              />
            ) : (
              <div className='flex items-center justify-center h-full text-slate-500'>
                Không có tài liệu để hiển thị
              </div>
            )}
          </div>
        </div>
        </div>
        </>
      ),
      document.body
    )}
    </>
  )
}
