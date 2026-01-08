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
      <AccordionTrigger className='px-6 py-4 hover:no-underline group' onClick={() => setIsOpen((prev) => !prev)}>
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
                  <span>{section.lessonNum} bài học</span>
                </div>
                <div className='flex items-center gap-1'>
                  <Clock className='w-4 h-4' />
                  <span>{formatDuration(section.duration)}</span>
                </div>
              </div>
            </div>
          </div>
          <Badge className='hidden sm:inline-flex bg-blue-600'>{section.lessonNum} bài</Badge>
        </div>
        <PreviewPublicLesson preview={preview} setPreview={setPreview} />
      </AccordionTrigger>

      <AccordionContent className='px-6 pb-6'>
        <div className='ml-20 space-y-3'>
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
                  className='flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors'
                >
                  <div className='flex items-center gap-3'>
                    <div className='w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center'>
                      {createElement(Icon, { className: 'w-4 h-4 text-primary' })}
                    </div>
                    <span className='text-muted-foreground'>{lesson.title}</span>
                  </div>
                  <div className='text-sm text-muted-foreground flex items-center gap-2'>
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
                          <Badge className='bg-blue-600'>
                            <Play className='w-4 h-4 mr-1' />
                            Xem trước
                          </Badge>
                        </button>
                      </div>
                    )}
                    {formatDuration(lesson.duration)}
                  </div>
                </div>
              )
            })}

          {!loading && lessons.length === 0 && (
            <div className='text-muted-foreground text-sm italic'>Chưa có bài học nào</div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export default CourseSection
