import { Award, BookOpen, CheckCircle2, ChevronDown, Lock, PartyPopper, Sparkles } from 'lucide-react'
import { CertificateJourney } from '@/types/course-student'
import { Link } from 'react-router-dom'
import { Progress } from '@/components/ui/progress'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import HighGlossBackground from '@/components/common/HighGlossBackground'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface CertificateJourneyProgressProps {
  journey: CertificateJourney
}

type JourneyStep = 'learning' | 'completed' | 'certificate'

function getActiveStep(certificateIssued: boolean, progressPercent: number, completedLessons: number): JourneyStep {
  if (certificateIssued || progressPercent >= 100) return 'certificate'
  if (completedLessons > 0 || progressPercent > 0) return 'completed'
  return 'learning'
}

function getSummaryText(
  certificateIssued: boolean,
  remaining: number,
  completedLessons: number,
  totalLessons: number
) {
  if (certificateIssued) return 'Bạn đã nhận chứng chỉ hoàn thành khóa học.'
  if (remaining > 0) return `Còn ${remaining} bài để nhận chứng chỉ (${completedLessons}/${totalLessons}).`
  return `Đã hoàn thành ${completedLessons}/${totalLessons} bài.`
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
            left: `${10 + i * 22}%`
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.5],
            y: [0, -6, 0]
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            delay: i * 0.25,
            ease: 'easeInOut'
          }}
        />
      ))}
    </>
  )
}

export function CertificateJourneyProgress({ journey }: CertificateJourneyProgressProps) {
  const { completedLessons, totalLessons, progressPercent, certificateIssued, certificate } = journey
  const remaining = Math.max(0, totalLessons - completedLessons)
  const summary = getSummaryText(certificateIssued, remaining, completedLessons, totalLessons)
  const activeStep = getActiveStep(certificateIssued, progressPercent, completedLessons)
  const isCelebrating = activeStep === 'certificate'

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
                    {Math.round(progressPercent)}%
                  </span>
                </div>
                <Progress
                  value={progressPercent}
                  className={cn('h-1.5 mt-2 mb-1.5 group-data-[state=open]:hidden', progressOnGloss)}
                />
                <p className='text-[11px] text-blue-100/85 line-clamp-2 group-data-[state=open]:hidden'>{summary}</p>
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
              {/* Step 1 — Đang học */}
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

              {/* Step 2 — Hoàn thành bài */}
              <div className='flex flex-col items-center flex-1 min-w-0'>
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-500',
                    activeStep === 'completed'
                      ? 'bg-white/20 border-white/40 ring-2 ring-white/30'
                      : activeStep === 'certificate'
                        ? 'bg-emerald-400/15 border-emerald-300/35'
                        : 'bg-white/10 border-white/15'
                  )}
                >
                  {activeStep === 'completed' ? (
                    <CheckCircle2 className='w-4 h-4 text-white' />
                  ) : activeStep === 'certificate' ? (
                    <CheckCircle2 className='w-4 h-4 text-emerald-200' />
                  ) : (
                    <CheckCircle2 className='w-4 h-4 text-blue-200/50' />
                  )}
                </div>
                <span
                  className={cn(
                    'text-[10px] mt-1 text-center font-medium',
                    activeStep === 'completed'
                      ? 'text-white'
                      : activeStep === 'certificate'
                        ? 'text-emerald-200/80'
                        : 'text-blue-100/85'
                  )}
                >
                  Hoàn thành bài
                </span>
              </div>

              <StepConnector done={activeStep === 'certificate'} />

              {/* Step 3 — Nhận chứng chỉ */}
              <div className='flex flex-col items-center flex-1 min-w-0'>
                <motion.div
                  className={cn(
                    'relative w-8 h-8 rounded-full flex items-center justify-center border transition-colors duration-500',
                    activeStep === 'certificate'
                      ? 'bg-white/30 border-white/50 shadow-[0_0_16px_rgba(255,255,255,0.45)]'
                      : 'bg-white/10 border-white/15'
                  )}
                  animate={
                    activeStep === 'certificate'
                      ? { scale: [1, 1.08, 1], boxShadow: ['0 0 16px rgba(255,255,255,0.35)', '0 0 24px rgba(255,255,255,0.55)', '0 0 16px rgba(255,255,255,0.35)'] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {activeStep === 'certificate' && <CelebrationSparkles />}
                  {activeStep === 'certificate' || certificateIssued ? (
                    <Award className='w-4 h-4 text-white relative z-10' />
                  ) : (
                    <Lock className='w-4 h-4 text-blue-200/50' />
                  )}
                </motion.div>
                <span
                  className={cn(
                    'text-[10px] mt-1 text-center font-medium',
                    activeStep === 'certificate' ? 'text-white font-bold' : 'text-blue-100/85'
                  )}
                >
                  Nhận chứng chỉ
                </span>
              </div>
            </div>

            <Progress value={progressPercent} className={cn('h-2 mb-2', progressOnGloss)} />
            <p className='text-xs text-blue-100/90 mb-3'>{summary}</p>

            {isCelebrating && certificateIssued && certificate && (
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

            {isCelebrating && !certificateIssued && (
              <p className='text-[11px] text-center text-blue-100/80 font-medium animate-pulse'>
                Đang cấp chứng chỉ, vui lòng đợi trong giây lát...
              </p>
            )}
          </div>
        </CollapsibleContent>
      </HighGlossBackground>
    </Collapsible>
  )
}
