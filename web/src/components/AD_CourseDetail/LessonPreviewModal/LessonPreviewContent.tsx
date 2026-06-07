import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  AlertCircle,
  Bot,
  Clock,
  ClipboardList,
  ExternalLink,
  FileText,
  Globe,
  Layers,
  Lock,
  ShieldCheck,
  Sparkles,
  Video,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdminLessonVideoPreview } from './AdminLessonVideoPreview'
import { parseSRT } from '@/utils/srtParser'
import type { AnalysisResult } from '@/services/assistant/analysis.service'
import type { LessonTestBundleResponse } from '@/types/lesson-test.type'
import courseAdminAnalysisService from '@/services/course/course-admin-analysis.service'
import { SegmentList } from './SegmentList'
import { LessonTestPreview } from './LessonTestPreview'
import { LessonPreviewSkeleton } from './LessonPreviewSkeleton'
import { cn } from '@/lib/utils'
import { lessonTypeLabel as getLessonTypeLabel, normalizeLessonType } from '@/utils/lessonType.utils'
import { LessonType } from '@/types/lesson'

export interface AdminPreviewLesson {
  id: string
  title: string
  type: 'video' | 'article' | 'quiz'
  duration: string
  videoUrl?: string
  content?: string
  isPublic?: boolean
}

interface LessonPreviewContentProps {
  lesson: AdminPreviewLesson
}

function lessonTypeLabel(type: AdminPreviewLesson['type']): string {
  return getLessonTypeLabel(type)
}

function lessonTypeIcon(type: AdminPreviewLesson['type']) {
  const normalized = normalizeLessonType(type)
  if (normalized === 'article') return FileText
  if (normalized === 'quiz') return ClipboardList
  return Video
}

/** Maps backend analysis status to Vietnamese UI label. */
function analysisStatusLabel(status: AnalysisResult['status'] | undefined): string {
  const normalized = String(status || '').toLowerCase()
  if (normalized === 'completed') return 'Hoàn tất'
  if (normalized === 'processing') return 'Đang xử lý'
  if (normalized === 'failed') return 'Thất bại'
  if (normalized === 'not_found') return 'Chưa phân tích'
  return 'Chưa phân tích'
}

function MetaItem({
  icon: Icon,
  label,
  value,
  iconClassName,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  iconClassName?: string
}) {
  return (
    <div className='flex items-start gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3.5 shadow-sm ring-1 ring-slate-100/80'>
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500',
          iconClassName
        )}
      >
        <Icon className='h-4 w-4' />
      </span>
      <div className='min-w-0 flex-1'>
        <p className='text-xs text-slate-500'>{label}</p>
        <p className='mt-0.5 text-sm font-medium leading-snug text-slate-800'>{value}</p>
      </div>
    </div>
  )
}

function TabLabel({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: ReactNode }) {
  return (
    <span className='flex items-center justify-center gap-2'>
      <Icon className='h-4 w-4 shrink-0 opacity-80' />
      {children}
    </span>
  )
}

export function LessonPreviewContent({ lesson }: LessonPreviewContentProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [intelligence, setIntelligence] = useState<AnalysisResult | null>(null)
  const [intelligenceLoading, setIntelligenceLoading] = useState(true)
  const [testBundle, setTestBundle] = useState<LessonTestBundleResponse | null>(null)
  const [testLoading, setTestLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function load() {
      setIntelligenceLoading(true)
      setTestLoading(true)

      const [intelResult, testResult] = await Promise.allSettled([
        courseAdminAnalysisService.getLessonIntelligence(lesson.id),
        courseAdminAnalysisService.getLessonTestPreview(lesson.id),
      ])

      if (!mounted) return

      if (intelResult.status === 'fulfilled') {
        setIntelligence(intelResult.value)
      } else {
        console.error('Failed to load lesson intelligence:', intelResult.reason)
        setIntelligence(null)
      }

      if (testResult.status === 'fulfilled') {
        setTestBundle(testResult.value)
      } else {
        console.error('Failed to load lesson test:', testResult.reason)
        setTestBundle(null)
      }

      setIntelligenceLoading(false)
      setTestLoading(false)
    }

    load()
    return () => {
      mounted = false
    }
  }, [lesson.id])

  const subtitles = useMemo(() => {
    if (intelligence?.subtitles && typeof intelligence.subtitles === 'string') {
      try {
        return parseSRT(intelligence.subtitles)
      } catch {
        return []
      }
    }
    return []
  }, [intelligence?.subtitles])

  const TypeIcon = lessonTypeIcon(lesson.type)
  const isInitialLoading = intelligenceLoading && testLoading
  const chunks = intelligence?.chunks || []
  const isVideoLesson = lesson.type === 'video' && !!lesson.videoUrl

  const handleSeek = useCallback((startTime: string | null) => {
    if (!videoRef.current || !startTime) return

    const clean = startTime.split(',')[0].trim()
    const parts = clean.split(':').map(Number)
    let seconds = 0
    if (parts.length === 2) seconds = parts[0] * 60 + parts[1]
    if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2]

    videoRef.current.currentTime = seconds
    void videoRef.current.play()
  }, [])

  const tabContentClass =
    'mt-0 px-6 py-6 data-[state=inactive]:hidden sm:px-8 sm:py-7'

  if (isInitialLoading) {
    return <LessonPreviewSkeleton />
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col bg-slate-50/40'>
      <Tabs defaultValue='info' className='flex min-h-0 flex-1 flex-col'>
        <div className='sticky top-0 z-10 shrink-0 border-b border-slate-100 bg-white px-6 py-4 sm:px-8'>
          <TabsList className='grid h-auto w-full grid-cols-3 gap-1.5 bg-slate-100/80 p-1.5'>
            <TabsTrigger
              value='info'
              className='rounded-lg py-2.5 text-sm font-normal data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm'
            >
              <TabLabel icon={FileText}>Thông tin</TabLabel>
            </TabsTrigger>
            <TabsTrigger
              value='segments'
              className='rounded-lg py-2.5 text-sm font-normal data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm'
            >
              <TabLabel icon={Layers}>Phân đoạn</TabLabel>
            </TabsTrigger>
            <TabsTrigger
              value='test'
              className='rounded-lg py-2.5 text-sm font-normal data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm'
            >
              <TabLabel icon={ClipboardList}>Bài kiểm tra</TabLabel>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className='min-h-0 flex-1 overflow-y-auto'>
          {isVideoLesson && (
            <div className='border-b border-slate-100 bg-white px-6 py-5 sm:px-8'>
              <AdminLessonVideoPreview
                videoSrc={lesson.videoUrl!}
                videoRef={videoRef}
                subtitles={subtitles}
                chunks={chunks}
              />
            </div>
          )}

        <TabsContent value='info' className={tabContentClass}>
          <div className='space-y-6'>
            <div className='rounded-xl border border-slate-100 bg-white p-4 shadow-sm ring-1 ring-slate-100/80 sm:p-5'>
              <h3 className='break-words text-sm font-semibold leading-snug text-slate-900 sm:text-base'>
                {lesson.title}
              </h3>
              <div className='mt-3 flex flex-wrap gap-2'>
                <Badge variant='outline' className='gap-1.5 font-normal text-slate-600'>
                  <TypeIcon className='h-3.5 w-3.5' />
                  {lessonTypeLabel(lesson.type)}
                </Badge>
                {lesson.isPublic != null && (
                  <Badge variant='secondary' className='gap-1.5 font-normal'>
                    {lesson.isPublic ? (
                      <>
                        <Globe className='h-3.5 w-3.5' />
                        Công khai
                      </>
                    ) : (
                      <>
                        <Lock className='h-3.5 w-3.5' />
                        Riêng tư
                      </>
                    )}
                  </Badge>
                )}
              </div>
            </div>

            <div className='grid gap-3 sm:grid-cols-2'>
              <MetaItem
                icon={Bot}
                label='Trạng thái AI'
                value={
                  intelligenceLoading
                    ? 'Đang tải...'
                    : intelligence
                      ? analysisStatusLabel(intelligence.status)
                      : 'Chưa phân tích'
                }
                iconClassName='text-violet-600 bg-violet-50'
              />
              {!intelligenceLoading && intelligence && (
                <MetaItem
                  icon={ShieldCheck}
                  label='Chất lượng nội dung'
                  value={intelligence.isQualityValid ? 'Đạt yêu cầu' : 'Chưa đạt'}
                  iconClassName={
                    intelligence.isQualityValid
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-amber-600 bg-amber-50'
                  }
                />
              )}
            </div>

            {!intelligenceLoading && intelligence?.qualityReason && (
              <div className='flex gap-3 rounded-xl border border-amber-100 bg-amber-50/90 px-4 py-3.5 sm:px-5'>
                <AlertCircle className='mt-0.5 h-4 w-4 shrink-0 text-amber-600' />
                <p className='text-sm leading-relaxed text-amber-900'>{intelligence.qualityReason}</p>
              </div>
            )}

            {intelligence?.summary && (
              <div className='rounded-xl border border-slate-100 bg-white p-5 shadow-sm ring-1 ring-slate-100/80 sm:p-6'>
                <div className='mb-3 flex items-center gap-2 text-sm font-medium text-slate-800'>
                  <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600'>
                    <Sparkles className='h-4 w-4' />
                  </span>
                  Tóm tắt AI
                </div>
                <p className='text-sm leading-relaxed text-slate-600'>{intelligence.summary}</p>
              </div>
            )}

            {lesson.type === 'article' && lesson.videoUrl && (
              <div className='overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm ring-1 ring-slate-100/80'>
                <div className='flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5'>
                  <div className='flex items-center gap-2 text-sm font-medium text-slate-800'>
                    <FileText className='h-4 w-4 text-blue-600' />
                    Tài liệu bài học
                  </div>
                  <a
                    href={lesson.videoUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700'
                  >
                    Mở tab mới
                    <ExternalLink className='h-3.5 w-3.5' />
                  </a>
                </div>
                <iframe
                  src={lesson.videoUrl}
                  className='h-[min(480px,55vh)] w-full bg-slate-50'
                  title={lesson.title}
                />
              </div>
            )}

            {lesson.type === 'article' && lesson.content && (
              <div className='rounded-xl border border-slate-100 bg-white p-4 shadow-sm ring-1 ring-slate-100/80 sm:p-5'>
                <p className='mb-1.5 text-xs font-medium text-slate-500'>Mô tả</p>
                <div
                  className='text-sm leading-relaxed text-slate-600 [&_*]:text-sm [&_*]:leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0'
                  dangerouslySetInnerHTML={{ __html: lesson.content }}
                />
              </div>
            )}

            {lesson.type === 'article' && !lesson.videoUrl && !lesson.content && (
              <p className='text-sm text-slate-500'>Bài học chưa có nội dung.</p>
            )}

            {!intelligenceLoading && !intelligence && lesson.type === 'video' && (
              <p className='text-sm text-slate-500'>Bài học chưa có dữ liệu phân tích AI.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value='segments' className={tabContentClass}>
          {intelligenceLoading ? (
            <div className='flex flex-col items-center justify-center py-16 text-slate-500'>
              <Clock className='mb-3 h-7 w-7 animate-pulse text-slate-400' />
              <p className='text-sm'>Đang tải phân đoạn...</p>
            </div>
          ) : (
            <SegmentList chunks={chunks} onSeek={handleSeek} />
          )}
        </TabsContent>

        <TabsContent value='test' className={tabContentClass}>
          <LessonTestPreview
            loading={testLoading}
            bundle={testBundle}
            chunks={chunks}
            onSeek={handleSeek}
            lessonType={LessonType.VIDEO}
          />
        </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
