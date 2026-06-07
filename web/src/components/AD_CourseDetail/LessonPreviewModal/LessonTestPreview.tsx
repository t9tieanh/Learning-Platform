import { ClipboardList, Loader2, Target, StickyNote, Layers } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { LessonTestBundleResponse } from '@/types/lesson-test.type'
import type { GeneratedQuiz } from '@/types/quiz'
import type { LessonChunk } from '@/types/ai'
import { LessonType } from '@/types/lesson'
import { AdminExplanationCitation } from './AdminExplanationCitation'
import { AdminReadOnlyQuizList } from './ReadOnlyQuizList'

interface LessonTestPreviewProps {
  loading: boolean
  bundle: LessonTestBundleResponse | null
  chunks?: LessonChunk[]
  onSeek?: (startTime: string | null) => void
  lessonType?: LessonType
}

function mapGeneratedQuizToQuiz(quiz: GeneratedQuiz) {
  return {
    id: quiz.id,
    question: quiz.question,
    explanation: quiz.explanation,
    choices: quiz.choices.map((c) => ({
      id: c.id,
      text: c.text,
      isCorrect: c.isCorrect,
      feedback: c.feedback,
    })),
  }
}

function formatChunkGroupLabel(
  label: string | null | undefined,
  chunkIds: string[],
  chunks: LessonChunk[]
): string {
  const custom = label?.trim()
  if (custom && !/@\{\{/.test(custom)) return custom

  const titles = chunkIds
    .map((id) => chunks.find((c) => c.id === id))
    .filter(Boolean)
    .map((chunk, i) => chunk!.title || `Phân đoạn ${(chunk!.chunkIndex ?? i) + 1}`)

  if (titles.length > 0) return titles.join(' · ')
  return custom || 'Nhóm câu hỏi'
}

/** Maps lesson test status enum to Vietnamese label. */
function testStatusLabel(status: string): string {
  const map: Record<string, string> = {
    DRAFT: 'Bản nháp',
    PUBLISHED: 'Đã xuất bản',
    ARCHIVED: 'Đã lưu trữ',
  }
  return map[status] || status
}

export function LessonTestPreview({
  loading,
  bundle,
  chunks = [],
  onSeek,
  lessonType = LessonType.VIDEO,
}: LessonTestPreviewProps) {
  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center py-20 text-slate-500'>
        <Loader2 className='mb-3 h-8 w-8 animate-spin text-slate-400' />
        <p className='text-sm'>Đang tải bài kiểm tra...</p>
      </div>
    )
  }

  if (!bundle) {
    return (
      <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center'>
        <ClipboardList className='mb-3 h-10 w-10 text-slate-300' />
        <p className='text-sm text-slate-600'>Chưa có bài kiểm tra cho bài học này.</p>
        <p className='mt-1 text-xs text-slate-400'>Giảng viên có thể chưa tạo bài kiểm tra.</p>
      </div>
    )
  }

  const { lessonTest, chunkGroups, quizzes } = bundle

  return (
    <div className='space-y-6'>
      <div className='rounded-xl border border-slate-100 bg-white p-5 shadow-sm ring-1 ring-slate-100/80 sm:p-6'>
        <div className='flex flex-wrap items-center gap-3'>
          <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white'>
            <ClipboardList className='h-5 w-5' />
          </span>
          <div className='min-w-0 flex-1'>
            <h3 className='text-base font-semibold text-slate-900'>
              {lessonTest.title || 'Bài kiểm tra'}
            </h3>
            <Badge variant='outline' className='mt-1.5 font-normal text-slate-600'>
              {testStatusLabel(lessonTest.status)}
            </Badge>
          </div>
        </div>

        <div className='mt-5 grid gap-3 sm:grid-cols-2'>
          {lessonTest.targetTotalQuestions != null && (
            <div className='flex items-center gap-2.5 rounded-lg bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600'>
              <Target className='h-4 w-4 shrink-0 text-slate-400' />
              Số câu mục tiêu: {lessonTest.targetTotalQuestions}
            </div>
          )}
          <div className='flex items-center gap-2.5 rounded-lg bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600'>
            <Layers className='h-4 w-4 shrink-0 text-slate-400' />
            {chunkGroups.length} nhóm · {quizzes.length} câu hỏi
          </div>
        </div>

        {lessonTest.notes && (
          <div className='mt-4 flex gap-2.5 rounded-lg border border-slate-100 bg-slate-50/80 px-3.5 py-3 text-sm text-slate-600'>
            <StickyNote className='mt-0.5 h-4 w-4 shrink-0 text-slate-400' />
            {lessonTest.notes}
          </div>
        )}
      </div>

      {chunkGroups.length > 0 && (
        <div className='space-y-3'>
          <p className='flex items-center gap-2 text-sm font-medium text-slate-700'>
            <Layers className='h-4 w-4 text-slate-400' />
            Nhóm phân đoạn
          </p>
          <ul className='space-y-2'>
            {chunkGroups.map((group) => {
              const label = group.label?.trim()
              const hasCitation = !!label && /@\{\{/.test(label)

              return (
                <li
                  key={group.id}
                  className='rounded-xl border border-slate-100 bg-white px-4 py-3.5 text-sm text-slate-700 shadow-sm'
                >
                  <span className='font-medium'>
                    {hasCitation && chunks.length > 0 && onSeek ? (
                      <AdminExplanationCitation
                        text={label}
                        chunks={chunks}
                        onSeek={onSeek}
                        lessonType={lessonType}
                      />
                    ) : (
                      formatChunkGroupLabel(group.label, group.chunkIds, chunks)
                    )}
                  </span>
                  <span className='text-slate-500'>
                    {' '}
                    · {group.questionCount} câu · {group.chunkIds.length} phân đoạn
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <div className='space-y-3'>
        <p className='flex items-center gap-2 text-sm font-medium text-slate-700'>
          <ClipboardList className='h-4 w-4 text-slate-400' />
          Danh sách câu hỏi
        </p>
        <AdminReadOnlyQuizList
          quizzes={quizzes.map(mapGeneratedQuizToQuiz)}
          chunks={chunks}
          onSeek={onSeek}
          lessonType={lessonType}
        />
      </div>
    </div>
  )
}
