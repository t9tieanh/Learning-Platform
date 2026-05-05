import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** Bản nháp đáp án / cờ — theo bài học; fingerprint khớp `lessonTest.updatedAt` + bộ quiz id. */
export type LessonTestDraftSnapshot = {
  fingerprint: string
  answers: Record<string, string[]>
  flaggedIds: Record<string, boolean>
}

type LessonTestDraftState = {
  draftByLessonId: Record<string, LessonTestDraftSnapshot | undefined>
}

type LessonTestDraftActions = {
  setLessonDraft: (lessonId: string, snapshot: LessonTestDraftSnapshot) => void
  clearLessonDraft: (lessonId: string) => void
}

export const useLessonTestDraftStore = create(
  persist<LessonTestDraftState & LessonTestDraftActions>(
    (set) => ({
      draftByLessonId: {},
      setLessonDraft: (lessonId, snapshot) =>
        set((s) => ({
          draftByLessonId: { ...s.draftByLessonId, [lessonId]: snapshot },
        })),
      clearLessonDraft: (lessonId) =>
        set((s) => {
          const next = { ...s.draftByLessonId }
          delete next[lessonId]
          return { draftByLessonId: next }
        }),
    }),
    {
      name: 'lesson-test-draft-storage',
      partialize: (state) => ({ draftByLessonId: state.draftByLessonId }),
    } as Parameters<typeof persist<LessonTestDraftState & LessonTestDraftActions>>[1]
  )
)
