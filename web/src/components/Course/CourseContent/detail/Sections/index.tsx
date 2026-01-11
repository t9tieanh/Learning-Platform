import { useState, createElement, useEffect } from 'react'
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Clock, FileText, PlayCircle, CheckSquare, Play } from 'lucide-react'
import { formatDuration } from '@/utils/time/time.utils'
import { Lesson } from '@/types/course-user'
import chapterUserService from '@/services/course/chapter-user.service'
import PreviewPublicLesson from './previewPublicLesson'
import LessonSkeleton from './LessonSkeleton'

export interface Section {
  id: string
  title: string
  description: string | null
  position: number
  lessonNum: number
  duration: number
}

const CourseSection = ({ section, index }: { section: Section; index: number }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(false)

  const [preview, setPreview] = useState<{
    openPreview: boolean
    previewUrl: string | null
    previewTitle: string
  }>({
    openPreview: false,
    previewUrl: null,
    previewTitle: ''
  })

  useEffect(() => {
    const fetchLessons = async () => {
      if (isOpen && lessons.length === 0 && section.id) {
        try {
          setLoading(true)
          const response = await chapterUserService.getChapterPublic(section.id)
          if (response.code === 200 && response.result) {
            setLessons(response.result.lessons)
          }
        } finally {
          setLoading(false)
        }
      }
    }
    fetchLessons()
  }, [isOpen, section.id, lessons.length])

  return (
    <AccordionItem
      key={index}
      value={`item-${index}`}
      className='border border-border rounded-lg bg-card hover:shadow-soft transition-all duration-300'
    >
      <AccordionTrigger
        className='px-3 md:px-6 py-3 md:py-4 hover:no-underline group'
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className='flex items-center justify-between w-full text-left gap-2'>
          <div className='flex items-center gap-2 md:gap-4 min-w-0'>
            <div className='w-8 md:w-10 h-8 md:h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-semibold text-sm md:text-base flex-shrink-0'>
              {index + 1}
            </div>
            <div className='min-w-0'>
              <h3 className='font-semibold text-foreground group-hover:text-primary transition-colors text-sm md:text-base truncate'>
                {section.title}
              </h3>
              <div className='flex items-center gap-2 md:gap-4 mt-1 text-xs md:text-sm text-muted-foreground'>
                <div className='flex items-center gap-1'>
                  <FileText className='w-3 md:w-4 h-3 md:h-4 flex-shrink-0' />
                  <span className='hidden sm:inline'>{section.lessonNum} bài học</span>
                  <span className='sm:hidden'>{section.lessonNum}</span>
                </div>
                <div className='flex items-center gap-1'>
                  <Clock className='w-3 md:w-4 h-3 md:h-4 flex-shrink-0' />
                  <span>{formatDuration(section.duration)}</span>
                </div>
              </div>
            </div>
          </div>
          <Badge className='hidden sm:inline-flex bg-blue-600 text-xs md:text-sm flex-shrink-0'>
            {section.lessonNum} bài
          </Badge>
        </div>
        <PreviewPublicLesson preview={preview} setPreview={setPreview} />
      </AccordionTrigger>

      <AccordionContent className='px-3 md:px-6 pb-6'>
        <div className='ml-4 md:ml-20 space-y-2 md:space-y-3'>
          {loading && <LessonSkeleton />}

          {!loading &&
            lessons.length > 0 &&
            lessons.map((lesson, lidx) => {
              const Icon =
                lesson.type === 'video'
                  ? PlayCircle
                  : lesson.type === 'article'
                  ? FileText
                  : lesson.type === 'quiz'
                  ? CheckSquare
                  : FileText

              return (
                <div
                  key={lidx}
                  className='flex items-center justify-between gap-2 md:gap-3 p-2 md:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors'
                >
                  <div className='flex items-center gap-2 md:gap-3 min-w-0'>
                    <div className='w-5 md:w-6 h-5 md:h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0'>
                      {createElement(Icon, { className: 'w-3 md:w-4 h-3 md:h-4 text-primary' })}
                    </div>
                    <span className='text-muted-foreground text-xs md:text-sm truncate'>{lesson.title}</span>
                  </div>
                  <div className='text-xs md:text-sm text-muted-foreground flex items-center gap-1 md:gap-2 flex-shrink-0'>
                    {lesson?.isPublic && (
                      <div className='preview'>
                        <button
                          type='button'
                          onClick={(e) => {
                            e.stopPropagation()
                            if (lesson.url) {
                              setPreview({
                                openPreview: true,
                                previewUrl: lesson.url,
                                previewTitle: lesson.title
                              })
                            }
                          }}
                        >
                          <Badge className='bg-blue-600 text-xs px-2 py-1'>
                            <Play className='w-3 md:w-4 h-3 md:h-4 mr-1' />
                            Xem trước
                          </Badge>
                        </button>
                      </div>
                    )}
                    <span className='text-xs md:text-sm'>{formatDuration(lesson.duration)}</span>
                  </div>
                </div>
              )
            })}

          {!loading && lessons.length === 0 && (
            <div className='text-muted-foreground text-xs md:text-sm italic'>Chưa có bài học nào</div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export default CourseSection
