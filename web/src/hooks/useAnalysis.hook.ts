import { useState, useEffect, useRef, useCallback } from 'react'
import analysisService, { AnalysisResult } from '@/services/assistant/analysis.service'

export type AnalysisState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'completed'; data: AnalysisResult }
  | { status: 'processing'; message: string }
  | { status: 'not_found'; message: string }
  | { status: 'error'; message: string }

const RETRY_DELAY_MS = 7_000 // wait 5s before retrying on 202
const MAX_RETRIES = 15 // give up after 15 retries (~5 min with 5s long-poll each)

/**
 * Polls the long-polling analysis endpoint until:
 *   status 200 (completed) → resolves
 *   status 202 (processing) → auto-retries after RETRY_DELAY_MS
 *   status 404 → not_found
 *   network error → error state
 *
 * Only fetches when lessonId is provided and isVip is true.
 */
export function useAnalysis(lessonId: string | undefined, isVip: boolean) {
  const [state, setState] = useState<AnalysisState>({ status: 'idle' })
  const abortRef = useRef<AbortController | null>(null)
  const retryCount = useRef(0)
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchAnalysis = useCallback(async () => {
    // Always clean up previous active fetches when we fetch anew or if not qualified
    if (retryTimer.current) clearTimeout(retryTimer.current)
    if (abortRef.current) abortRef.current.abort()

    if (!lessonId || !isVip) {
      setState({ status: 'idle' })
      return
    }

    abortRef.current = new AbortController()
    const signal = abortRef.current.signal

    setState({ status: 'loading' })
    retryCount.current = 0

    const poll = async () => {
      if (signal.aborted) return

      if (retryCount.current >= MAX_RETRIES) {
        if (!signal.aborted)
          setState({ status: 'error', message: 'Phân tích mất quá nhiều thời gian, vui lòng thử lại sau.' })
        return
      }

      try {
        // Pass signal if getAnalysis supports it; otherwise we check signal.aborted right after
        const res = await analysisService.getAnalysis(lessonId)

        if (signal.aborted) return

        // 200 result=null — lesson not yet synced to assistant-service
        // This happens because the MQ message hasn't been consumed yet right
        // after upload. Treat it the same as 202 and keep retrying.
        if (res.code === 200 && res.result === null) {
          if (retryCount.current < MAX_RETRIES) {
            setState({ status: 'processing', message: 'Đang chờ hệ thống xử lý bài học…' })
            retryCount.current += 1
            retryTimer.current = setTimeout(poll, RETRY_DELAY_MS)
            return
          }
          // Gave up after MAX_RETRIES — lesson truly not found
          setState({ status: 'not_found', message: res.message ?? 'Bài học chưa được xử lý trong hệ thống' })
          return
        }

        // 200 — completed
        if (res.code === 200 && res.result?.status === 'completed') {
          setState({ status: 'completed', data: res.result })
          return
        }

        // 202 — still processing, retry after delay
        if (res.code === 202 || res.result?.status === 'processing') {
          setState({ status: 'processing', message: res.message ?? 'Nội dung đang được phân tích, vui lòng chờ…' })
          retryCount.current += 1
          retryTimer.current = setTimeout(poll, RETRY_DELAY_MS)
          return
        }

        // Fallback
        setState({ status: 'error', message: 'Phản hồi không hợp lệ từ server.' })
      } catch (err: unknown) {
        if (signal.aborted) return
        const msg = err instanceof Error ? err.message : 'Lỗi không xác định'
        setState({ status: 'error', message: msg })
      }
    }

    await poll()
  }, [lessonId, isVip])

  useEffect(() => {
    fetchAnalysis()

    return () => {
      // Cleanup: cancel in-flight retry timer on unmount / lessonId change
      if (retryTimer.current) clearTimeout(retryTimer.current)
      abortRef.current?.abort()
    }
  }, [fetchAnalysis])

  return { state, refetch: fetchAnalysis }
}
