import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronLeft, ChevronRight, Sparkles, X } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuth.stores'
import { cn } from '@/lib/utils'

const POPUP_VISIBLE_MS = 10_000
const MIN_GAP_MS = 30_000
const MAX_GAP_MS = 60_000

type Edge = 'top' | 'left' | 'right'

interface DynamicVideoWatermarkProps {
  active?: boolean
  courseTitle?: string
}

interface PopupPlacement {
  edge: Edge
  offset: number
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function randomEdgePlacement(): PopupPlacement {
  const edges: Edge[] = ['top', 'left', 'right']
  return {
    edge: edges[Math.floor(Math.random() * edges.length)],
    offset: randomBetween(14, 72)
  }
}

function getPlacementStyle(placement: PopupPlacement): CSSProperties {
  const { edge, offset } = placement

  switch (edge) {
    case 'top':
      return { top: 0, left: `${offset}%`, transform: 'translateX(-50%)' }
    case 'left':
      return { top: `${offset}%`, left: 0, transform: 'translateY(-50%)' }
    case 'right':
      return { top: `${offset}%`, right: 0, transform: 'translateY(-50%)' }
  }
}

function getSlideOffset(edge: Edge) {
  switch (edge) {
    case 'top':
      return { initial: { opacity: 0, y: -12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } }
    case 'left':
      return { initial: { opacity: 0, x: -16 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -10 } }
    case 'right':
      return { initial: { opacity: 0, x: 16 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 10 } }
  }
}

function getTabClasses(edge: Edge) {
  const base =
    'relative pointer-events-auto bg-white/90 backdrop-blur-xl border border-white/30 text-slate-600 shadow-xl flex items-center gap-2 max-w-[210px]'

  switch (edge) {
    case 'right':
      return cn(base, 'rounded-l-2xl rounded-r-none py-2.5 pl-3 pr-4')
    case 'left':
      return cn(base, 'rounded-r-2xl rounded-l-none py-2.5 pr-3 pl-4 flex-row-reverse')
    case 'top':
      return cn(base, 'rounded-b-2xl rounded-t-none px-4 py-2.5 flex-col')
  }
}

function EdgeChevron({ edge }: { edge: Edge }) {
  const iconClass = 'h-4 w-4 shrink-0 text-slate-400'

  switch (edge) {
    case 'right':
      return <ChevronLeft className={iconClass} />
    case 'left':
      return <ChevronRight className={iconClass} />
    case 'top':
      return <ChevronDown className={iconClass} />
  }
}

const DynamicVideoWatermark = ({ active = true, courseTitle }: DynamicVideoWatermarkProps) => {
  const { data } = useAuthStore()
  const [popup, setPopup] = useState<{ placement: PopupPlacement; key: number } | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const displayName = useMemo(() => {
    const raw = data?.username || data?.name || 'bạn'
    return raw.startsWith('@') ? raw : `@${raw}`
  }, [data?.username, data?.name])

  const message = useMemo(() => {
    if (courseTitle) {
      return `Xin chào ${displayName}, cảm ơn bạn đã học "${courseTitle}" tại Learnova.`
    }
    return `Xin chào ${displayName}, cảm ơn bạn đã học cùng Learnova.`
  }, [courseTitle, displayName])

  const dismissPopup = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
    setPopup(null)
  }, [])

  const revealPopup = useCallback(() => {
    setPopup({ placement: randomEdgePlacement(), key: Date.now() })

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
    }

    hideTimerRef.current = setTimeout(() => {
      setPopup(null)
      hideTimerRef.current = null
    }, POPUP_VISIBLE_MS)
  }, [])

  useEffect(() => {
    if (!active) {
      dismissPopup()
      return
    }

    let cancelled = false
    let nextTimer: ReturnType<typeof setTimeout>

    const schedulePopup = (delayMs: number) => {
      nextTimer = setTimeout(() => {
        if (cancelled) return

        revealPopup()
        schedulePopup(randomBetween(MIN_GAP_MS, MAX_GAP_MS))
      }, delayMs)
    }

    schedulePopup(1200)

    return () => {
      cancelled = true
      clearTimeout(nextTimer)
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }
    }
  }, [active, revealPopup, dismissPopup])

  if (!active) return null

  return (
    <AnimatePresence>
      {popup && (() => {
        const { edge } = popup.placement
        const slide = getSlideOffset(edge)

        return (
          <motion.div
            key={popup.key}
            initial={slide.initial}
            animate={slide.animate}
            exit={slide.exit}
            transition={{ duration: 0.35 }}
            className='pointer-events-none absolute z-[1]'
            style={getPlacementStyle(popup.placement)}
          >
            <div className={getTabClasses(edge)}>
              <button
                type='button'
                onClick={(event) => {
                  event.stopPropagation()
                  dismissPopup()
                }}
                className='absolute -right-1.5 -top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-white/40 bg-white/95 text-slate-400 shadow-sm transition-colors hover:text-slate-700'
                aria-label='Ẩn thông báo'
              >
                <X className='h-3 w-3' />
              </button>

              {edge !== 'top' && <EdgeChevron edge={edge} />}

              <div className='flex min-w-0 items-center gap-2 pr-1'>
                <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200/70 bg-white shadow-sm'>
                  <Sparkles className='h-4 w-4 text-sky-500' />
                </div>
                <p className='text-[10px] font-semibold leading-snug text-slate-600'>{message}</p>
              </div>

              {edge === 'top' && <EdgeChevron edge={edge} />}
            </div>
          </motion.div>
        )
      })()}
    </AnimatePresence>
  )
}

export default DynamicVideoWatermark
