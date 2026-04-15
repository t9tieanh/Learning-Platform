import { useState, useCallback, useMemo } from 'react'
import { useAuthStore } from '@/stores/useAuth.stores'
import { QuizGenerationProgress } from '@/types/quiz'

/**
 * Hook for managing quiz generation progress and state
 */
export const useQuizGeneration = () => {
  const [progress, setProgress] = useState<QuizGenerationProgress>({
    isGenerating: false,
    currentTask: '',
    progress: 0
  })

  const startGeneration = useCallback((taskName: string) => {
    setProgress({
      isGenerating: true,
      currentTask: taskName,
      progress: 0
    })
  }, [])

  const updateProgress = useCallback((current: number, total: number, taskName?: string) => {
    setProgress((prev) => ({
      ...prev,
      progress: Math.round((current / total) * 100),
      currentTask: taskName || prev.currentTask
    }))
  }, [])

  const completeGeneration = useCallback(() => {
    setProgress({
      isGenerating: false,
      currentTask: '',
      progress: 100
    })
  }, [])

  const setError = useCallback((error: string) => {
    setProgress({
      isGenerating: false,
      currentTask: '',
      progress: 0,
      error
    })
  }, [])

  const reset = useCallback(() => {
    setProgress({
      isGenerating: false,
      currentTask: '',
      progress: 0
    })
  }, [])

  return {
    progress,
    startGeneration,
    updateProgress,
    completeGeneration,
    setError,
    reset
  }
}

/**
 * Hook to check if user is VIP (integrates with auth store)
 */
export const useVipStatus = () => {
  const authData = useAuthStore((state) => state.data)

  const isVip = useMemo(() => {
    return authData?.isVip ?? false
  }, [authData?.isVip])

  return { isVip }
}
