import { Award, BookOpen, CheckCircle2, ChevronDown, ClipboardList, Lock, PartyPopper, Sparkles } from 'lucide-react'
import { CertificateJourney, CertificateJourneyPendingTest } from '@/types/course-student'
import { Link } from 'react-router-dom'
import { Progress } from '@/components/ui/progress'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import HighGlossBackground from '@/components/common/HighGlossBackground'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'

const PENDING_TEST_PREVIEW_LIMIT = 3

function PendingTestPreviewItem({
  item,
  onNavigate,
}: {
  item: CertificateJourneyPendingTest
  onNavigate?: (lessonId: string) => void
}) {
  const title = item.lessonTitle?.trim() || 'Bài kiểm tra bài học'
  const label =
    item.status === 'NOT_ATTEMPTED' ? 'Chưa làm' : `Chưa đạt ${Math.round(item.bestPercent)}%`
  const badgeClass =
    item.status === 'NOT_ATTEMPTED'
      ? 'bg-white/10 text-blue-100/90'
      : 'bg-amber-400/20 text-amber-100'

  const content = (
    <>
      <span className='line-clamp-2 min-h-[2.4em] text-[9px] font-medium leading-tight text-blue-50'>
        {title}
      </span>
      <span className={cn('w-fit rounded px-1 py-0.5 text-[8px] font-semibold', badgeClass)}>{label}</span>
    </>
  )

  const className =
    'flex min-w-0 flex-1 flex-col gap-1 rounded-lg border border-white/10 bg-white/5 p-2 text-left transition-colors'

  if (onNavigate) {
    return (
      <button type='button' onClick={() => onNavigate(item.lessonId)} className={cn(className, 'hover:bg-white/10')}>
        {content}
      </button>
    )
  }

  return <div className={className}>{content}</div>
}

function PendingTestsPreview({
  items,
  onNavigate,
}: {
  items: CertificateJourneyPendingTest[]
  onNavigate?: (lessonId: string) => void
}) {
  if (items.length === 0) return null

  const visibleItems = items.slice(0, PENDING_TEST_PREVIEW_LIMIT)
  const remainingCount = Math.max(0, items.length - PENDING_TEST_PREVIEW_LIMIT)

  return (
    <div className='mt-2 flex items-stretch gap-1.5'>
      {visibleItems.map((item) => (
        <PendingTestPreviewItem key={item.lessonId} item={item} onNavigate={onNavigate} />
      ))}
      {remainingCount > 0 && (
        <div
          className='flex w-9 shrink-0 flex-col items-center justify-center self-center rounded-full border border-white/20 bg-white/10 aspect-square'
          title={`Còn ${remainingCount} bài kiểm tra chưa hoàn thành`}
        >
          <span className='text-[10px] font-bold tabular-nums text-blue-50'>+{remainingCount}</span>
        </div>
      )}
    </div>
  )
}

interface CertificateJourneyProgressProps {
  journey: CertificateJourney
  onNavigateToLessonTest?: (lessonId: string) => void
}

type JourneyStep = 'learning' | 'completed' | 'certificate'

function getActiveStep(
  certificateIssued: boolean,
  progressPercent: number,
  completedLessons: number,
  lessonsComplete?: boolean,
  testsComplete?: boolean
): JourneyStep {
  if (certificateIssued) return 'certificate'
  if (lessonsComplete || progressPercent >= 100) {
    if (testsComplete === false) return 'completed'
    return 'completed'
  }
  if (completedLessons > 0 || progressPercent > 0) return 'completed'
  return 'learning'
}

function getCombinedProgress(journey: CertificateJourney) {
  const {
    certificateIssued,
    completedLessons,
    totalLessons,
    progressPercent,
    lessonsWithTest = 0,
    passedTests = 0,
  } = journey

  const totalUnits = totalLessons + lessonsWithTest
  const completedUnits = completedLessons + passedTests

  if (certificateIssued) {
    return { percent: 100, completed: totalUnits, total: totalUnits, remaining: 0 }
  }

  if (totalUnits <= 0) {
    const remaining = Math.max(0, totalLessons - completedLessons)
    return {
      percent: progressPercent,
      completed: completedLessons,
      total: totalLessons,
      remaining,
    }
  }

  const percent = Math.round((completedUnits / totalUnits) * 1000) / 10
  return {
    percent,
    completed: completedUnits,
    total: totalUnits,
    remaining: Math.max(0, totalUnits - completedUnits),
  }
}

function getCollapsedSummaryText(
  journey: CertificateJourney,
  combined: ReturnType<typeof getCombinedProgress>
): string {
  if (journey.certificateIssued) return 'Bạn đã nhận chứng chỉ hoàn thành khóa học.'
  if (combined.remaining <= 0) return 'Đủ điều kiện nhận chứng chỉ.'
  return `Còn ${combined.remaining} bài để nhận chứng chỉ (${combined.completed}/${combined.total}).`
}

function getSummaryText(journey: CertificateJourney): string {
  const {
    certificateIssued,
    completedLessons,
    totalLessons,
    lessonsComplete,
    testsComplete,
    lessonsWithTest = 0,
    passedTests = 0,
    minPassPercent = 50,
    blockers,
  } = journey

  if (certificateIssued) return 'Bạn đã nhận chứng chỉ hoàn thành khóa học.'

  const remainingLessons = Math.max(0, totalLessons - completedLessons)
  if (!lessonsComplete && remainingLessons > 0) {
    return `Còn ${remainingLessons} bài học để nhận chứng chỉ (${completedLessons}/${totalLessons}).`
  }

  if (lessonsWithTest > 0 && testsComplete === false) {
    const pending = Math.max(0, lessonsWithTest - passedTests)
    return `Còn ${pending} bài kiểm tra chưa đạt ${minPassPercent}% (${passedTests}/${lessonsWithTest}).`
  }

  if (blockers && blockers.length > 0) {
    return blockers[0]
  }

  if (lessonsComplete && (lessonsWithTest === 0 || testsComplete)) {
    return 'Đủ điều kiện nhận chứng chỉ.'
  }

  return `Đã hoàn thành ${completedLessons}/${totalLessons} bài học.`
}

const progressOnGloss = 'bg-white/20 [&_[data-slot=progress-indicator]]:bg-white'

function StepConnector({ done }: { done: boolean }) {
  return (
    <div
      className={cn(
        'h-px flex-1 max-w-[24px] transition-colors duration-500',
        done ? 'bg-emerald-300/70' : 'bg-white/20'
      )}
    />
  )
}

function CelebrationSparkles() {
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <motion.span
          key={i}
          className='absolute w-1 h-1 rounded-full bg-amber-200'
          style={{
            top: `${20 + i * 15}%`,
            left: `${10 + i * 22}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.5],
            y: [0, -6, 0],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            delay: i * 0.25,
            ease: 'easeInOut',
          }}
        />
      ))}
    </>
  )
}

export function CertificateJourneyProgress({ journey, onNavigateToLessonTest }: CertificateJourneyProgressProps) {
  const {
    completedLessons,
    totalLessons,
    progressPercent,
    certificateIssued,
    certificate,
    lessonsWithTest = 0,
    passedTests = 0,
    testProgressPercent = 0,
    minPassPercent = 50,
    lessonsComplete,
    testsComplete,
    pendingLessonTests = [],
  } = journey

  const combinedProgress = useMemo(() => getCombinedProgress(journey), [journey])
  const collapsedSummary = useMemo(
    () => getCollapsedSummaryText(journey, combinedProgress),
    [journey, combinedProgress]
  )
  const detailSummary = getSummaryText(journey)
  const activeStep = getActiveStep(
    certificateIssued,
    progressPercent,
    completedLessons,
    lessonsComplete,
    testsComplete
  )
  const isCelebrating = certificateIssued

  const resolvedTestProgress = useMemo(() => {
    if (testProgressPercent > 0) return testProgressPercent
    if (lessonsWithTest > 0) return Math.round((passedTests / lessonsWithTest) * 1000) / 10
    return 100
  }, [testProgressPercent, lessonsWithTest, passedTests])

  const [open, setOpen] = useState(isCelebrating)

  useEffect(() => {
    if (isCelebrating) setOpen(true)
  }, [isCelebrating])

  return (
    <Collapsible open={open} onOpenChange={setOpen} className='group mb-4'>
      <HighGlossBackground className='rounded-2xl shadow-md shadow-blue-900/10 overflow-hidden'>
        <CollapsibleTrigger asChild>
          <button
            type='button'
            className='w-full p-3 text-left hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-inset'
          >
            <div className='flex items-start gap-2'>
              <div
                className={cn(
                  'w-7 h-7 shrink-0 rounded-lg flex items-center justify-center border mt-0.5 transition-all',
                  isCelebrating
                    ? 'bg-white/25 border-white/40 shadow-[0_0_12px_rgba(255,255,255,0.35)]'
                    : 'bg-white/10 border-white/15'
                )}
              >
                {isCelebrating ? (
                  <PartyPopper className='w-3.5 h-3.5 text-white' />
                ) : (
                  <Award className='w-3.5 h-3.5 text-white' />
                )}
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center justify-between gap-2'>
                  <h3 className='text-xs font-bold text-white tracking-tight'>
                    {isCelebrating ? 'Chúc mừng! Bạn đã hoàn thành khóa học' : 'Con đường tới chứng chỉ'}
                  </h3>
                  <span className='text-[10px] font-semibold text-blue-100 tabular-nums'>
                    {Math.round(combinedProgress.percent)}%
                  </span>
                </div>
                <div className='mt-2 mb-1.5 group-data-[state=open]:hidden'>
                  <Progress value={combinedProgress.percent} className={cn('h-1.5', progressOnGloss)} />
                </div>
                <p className='text-[11px] text-blue-100/85 line-clamp-2 group-data-[state=open]:hidden'>
                  {collapsedSummary}
                </p>
              </div>
              <ChevronDown className='w-4 h-4 text-blue-100/70 shrink-0 mt-0.5 transition-transform duration-200 group-data-[state=open]:rotate-180' />
            </div>
            <p className='text-[10px] text-blue-100/70 mt-2 pl-9 font-medium group-data-[state=open]:hidden'>
              {isCelebrating ? 'Mở để xem chứng chỉ của bạn' : 'Nhấn để xem chi tiết'}
            </p>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className='px-4 pb-4 pt-1 border-t border-white/10'>
            <div className='flex items-center gap-2 mb-3 mt-2'>
              <div className='flex flex-col items-center flex-1 min-w-0'>
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-500',
                    activeStep === 'learning'
                      ? 'bg-white/20 border-white/40 ring-2 ring-white/30'
                      : 'bg-emerald-400/15 border-emerald-300/35'
                  )}
                >
                  {activeStep === 'learning' ? (
                    <BookOpen className='w-4 h-4 text-white' />
                  ) : (
                    <CheckCircle2 className='w-4 h-4 text-emerald-200' />
                  )}
                </div>
                <span
                  className={cn(
                    'text-[10px] mt-1 text-center font-medium',
                    activeStep === 'learning' ? 'text-white' : 'text-emerald-200/80'
                  )}
                >
                  Đang học
                </span>
              </div>

              <StepConnector done={activeStep !== 'learning'} />

              <div className='flex flex-col items-center flex-1 min-w-0'>
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-500',
                    activeStep === 'completed' && !certificateIssued
                      ? 'bg-white/20 border-white/40 ring-2 ring-white/30'
                      : activeStep !== 'learning'
                        ? 'bg-emerald-400/15 border-emerald-300/35'
                        : 'bg-white/10 border-white/15'
                  )}
                >
                  {activeStep !== 'learning' ? (
                    <CheckCircle2 className='w-4 h-4 text-emerald-200' />
                  ) : (
                    <CheckCircle2 className='w-4 h-4 text-blue-200/50' />
                  )}
                </div>
                <span
                  className={cn(
                    'text-[10px] mt-1 text-center font-medium',
                    activeStep === 'completed' && !certificateIssued ? 'text-white' : 'text-blue-100/85'
                  )}
                >
                  Hoàn thành bài
                </span>
              </div>

              <StepConnector done={certificateIssued} />

              <div className='flex flex-col items-center flex-1 min-w-0'>
                <motion.div
                  className={cn(
                    'relative w-8 h-8 rounded-full flex items-center justify-center border transition-colors duration-500',
                    certificateIssued
                      ? 'bg-white/30 border-white/50 shadow-[0_0_16px_rgba(255,255,255,0.45)]'
                      : 'bg-white/10 border-white/15'
                  )}
                  animate={
                    certificateIssued
                      ? {
                          scale: [1, 1.08, 1],
                          boxShadow: [
                            '0 0 16px rgba(255,255,255,0.35)',
                            '0 0 24px rgba(255,255,255,0.55)',
                            '0 0 16px rgba(255,255,255,0.35)',
                          ],
                        }
                      : { scale: 1 }
                  }
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {certificateIssued && <CelebrationSparkles />}
                  {certificateIssued ? (
                    <Award className='w-4 h-4 text-white relative z-10' />
                  ) : (
                    <Lock className='w-4 h-4 text-blue-200/50' />
                  )}
                </motion.div>
                <span
                  className={cn(
                    'text-[10px] mt-1 text-center font-medium',
                    certificateIssued ? 'text-white font-bold' : 'text-blue-100/85'
                  )}
                >
                  Nhận chứng chỉ
                </span>
              </div>
            </div>

            <div className='space-y-3 mb-3'>
              <div>
                <div className='flex items-center justify-between mb-1'>
                  <span className='text-[10px] font-semibold text-blue-100/90 flex items-center gap-1'>
                    <BookOpen className='w-3 h-3' />
                    Hoàn thành bài học
                  </span>
                  <span className='text-[10px] text-blue-100/80 tabular-nums'>
                    {completedLessons}/{totalLessons}
                  </span>
                </div>
                <Progress value={progressPercent} className={cn('h-2', progressOnGloss)} />
              </div>

              {lessonsWithTest > 0 ? (
                <div>
                  <div className='flex items-center justify-between mb-1'>
                    <span className='text-[10px] font-semibold text-blue-100/90 flex items-center gap-1'>
                      <ClipboardList className='w-3 h-3' />
                      Hoàn thành bài kiểm tra
                    </span>
                    <span className='text-[10px] text-blue-100/80 tabular-nums'>
                      {passedTests}/{lessonsWithTest} · ≥{minPassPercent}%
                    </span>
                  </div>
                  <Progress value={resolvedTestProgress} className={cn('h-2', progressOnGloss)} />
                  <PendingTestsPreview items={pendingLessonTests} onNavigate={onNavigateToLessonTest} />
                </div>
              ) : (
                <p className='text-[10px] text-blue-100/70 italic'>Không có bài kiểm tra bắt buộc trong khóa này.</p>
              )}
            </div>

            <p className='text-xs text-blue-100/90 mb-3'>{detailSummary}</p>

            {certificateIssued && certificate && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22, delay: 0.15 }}
              >
                <Link
                  to='/me?mode=cert'
                  className='group/cta relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-blue-700 shadow-lg shadow-blue-950/25 transition-all hover:bg-blue-50 hover:shadow-xl hover:shadow-blue-950/30'
                >
                  <span className='pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full group-hover/cta:translate-x-full transition-transform duration-700' />
                  <Sparkles className='w-4 h-4 text-amber-500 animate-pulse relative z-10' />
                  <Award className='w-4 h-4 relative z-10' />
                  <span className='relative z-10'>Xem chứng chỉ ngay</span>
                </Link>
                <p className='text-[10px] text-center text-blue-100/75 mt-2 font-medium'>
                  Chứng chỉ đã sẵn sàng trong hồ sơ của bạn
                </p>
              </motion.div>
            )}
          </div>
        </CollapsibleContent>
      </HighGlossBackground>
    </Collapsible>
  )
}
