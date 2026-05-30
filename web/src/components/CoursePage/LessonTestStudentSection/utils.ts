import type { AxiosError } from 'axios'
import type { StudentLessonTestView } from '@/types/lesson-test-student.type'

export function getLessonTestErrorMessage(err: unknown): string {
  const ax = err as AxiosError<{ message?: string }>
  const msg = ax.response?.data?.message
  if (typeof msg === 'string' && msg.trim()) return msg.trim()
  if (ax.response?.status === 403) {
    return 'Bạn chưa được phép làm bài hoặc bài học chưa sẵn sàng.'
  }
  if (ax.response?.status === 404) {
    return 'Không có bài kiểm tra đang mở cho bài học này.'
  }
  return 'Không tải được bài kiểm tra. Thử lại sau.'
}

export function lessonTestViewFingerprint(view: StudentLessonTestView): string {
  const ids = view.chunkGroups.flatMap((g) => g.quizzes.map((q) => q.id)).sort().join('|')
  return `${view.lessonTest.updatedAt}::${ids}`
}

export function buildQuestionNavItems(view: StudentLessonTestView | null): { quizId: string; globalN: number }[] {
  if (!view?.chunkGroups?.length) return []
  const items: { quizId: string; globalN: number }[] = []
  let n = 0
  for (const g of view.chunkGroups) {
    for (const q of g.quizzes) {
      n += 1
      items.push({ quizId: q.id, globalN: n })
    }
  }
  return items
}

export function scrollToLessonTestQuiz(quizId: string): void {
  document.getElementById(`lesson-test-quiz-${quizId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
