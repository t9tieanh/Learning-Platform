import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface LessonProgress {
  maxTimeWatched: number
  lastCurrentTime: number
}

interface LessonProgressState {
  // Key: lessonId, Value: Progress details
  progressMap: Record<string, LessonProgress>
  
  updateProgress: (lessonId: string, progress: Partial<LessonProgress>) => void
  getProgress: (lessonId: string) => LessonProgress
  clearProgress: (lessonId: string) => void
}

export const useLessonProgressStore = create<LessonProgressState>()(
  persist(
    (set, get) => ({
      progressMap: {},

      updateProgress: (lessonId, progress) => {
        set((state) => ({
          progressMap: {
            ...state.progressMap,
            [lessonId]: {
              ...(state.progressMap[lessonId] || { maxTimeWatched: 0, lastCurrentTime: 0 }),
              ...progress,
            },
          },
        }))
      },

      getProgress: (lessonId) => {
        return get().progressMap[lessonId] || { maxTimeWatched: 0, lastCurrentTime: 0 }
      },

      clearProgress: (lessonId) => {
        set((state) => {
          const newMap = { ...state.progressMap }
          delete newMap[lessonId]
          return { progressMap: newMap }
        })
      },
    }),
    {
      name: 'learnova-lesson-progress',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
