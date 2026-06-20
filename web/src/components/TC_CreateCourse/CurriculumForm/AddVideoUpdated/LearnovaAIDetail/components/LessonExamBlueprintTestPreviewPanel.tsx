import React, { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Eye,
  GraduationCap,
  Loader2,
  PencilLine,
  ShieldCheck,
} from 'lucide-react'
import CustomButton from '@/components/common/Button'
import { cn } from '@/lib/utils'
import type { GeneratedQuiz } from '@/types/quiz'
import { QuestionType } from '@/types/quiz'
import { LessonType } from '@/types/lesson'
import { LessonChunk } from '@/types/ai'

import ExplanationCitation from './ExplanationCitation'
import QuizTeacherInlineEditor from './QuizTeacherInlineEditor'

export interface LessonExamBlueprintTestPreviewPanelProps {
  visible: boolean
  loading: boolean
  quizzes: GeneratedQuiz[]
  chunks: LessonChunk[]
  handleSeek?: (startTime: string | null) => void
  testTitle?: string | null
  onBack?: () => void
  lessonType?: LessonType
}

type PreviewMode = 'student' | 'teacher'

/**
 * Flat lesson-test preview: learner interaction vs teacher review/edit.
 */
const LessonExamBlueprintTestPreviewPanel: React.FC<
  LessonExamBlueprintTestPreviewPanelProps
> = ({
  visible,
  loading,
  quizzes,
  chunks,
  handleSeek,
  testTitle,
  onBack,
  lessonType,
}) => {
  const [mode, setMode] = useState<PreviewMode>('teacher')
  const [localQuizzes, setLocalQuizzes] = useState<GeneratedQuiz[]>(quizzes)
  const [selectionByQuizId, setSelectionByQuizId] = useState<
    Record<string, string>
  >({})
  const [revealedByQuizId, setRevealedByQuizId] = useState<
    Record<string, boolean>
  >({})
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null)

  useEffect(() => {
    setLocalQuizzes(quizzes)
  }, [quizzes])

  const titleHint = useMemo(() => {
    if (!testTitle?.trim()) return null
    return testTitle.trim()
  }, [testTitle])

  if (!visible) return null

  const handlePickChoice = (quizId: string, choiceId: string) => {
    setSelectionByQuizId((prev) => ({ ...prev, [quizId]: choiceId }))
    setRevealedByQuizId((prev) => ({ ...prev, [quizId]: true }))
  }

  const handleQuizSavedAfterPatch = (updated: GeneratedQuiz) => {
    setLocalQuizzes((prev) => prev.map((q) => (q.id === updated.id ? updated : q)))
    setEditingQuizId(null)
  }

  return (
    <div className='flex flex-col h-full bg-white'>
      {/* Header & Tabs */}
      <div className='px-4 py-3 md:px-5 md:py-3.5 border-b border-blue-100/90 bg-blue-600/[0.07] flex flex-col gap-3'>
        <div className='flex flex-wrap items-start gap-3'>
          <div className='flex items-center gap-2 min-w-0 flex-1'>
            <div className='shrink-0 w-8 h-8 rounded-xl bg-blue-600/15 flex items-center justify-center border border-blue-300/40'>
              {mode === 'student' ? (
                <GraduationCap
                  className='w-4 h-4 text-blue-700'
                  strokeWidth={2.25}
                  aria-hidden
                />
              ) : (
                <ShieldCheck
                  className='w-4 h-4 text-blue-700'
                  strokeWidth={2.25}
                  aria-hidden
                />
              )}
            </div>
            <div className='min-w-0'>
              <h3 className='text-[14px] md:text-[15px] font-bold text-blue-950 tracking-tight leading-snug'>
                Xem trước toàn bài kiểm tra
              </h3>
              <p className='text-[12px] md:text-[13px] text-blue-800/75 font-medium leading-snug mt-0.5'>
                Danh sách phẳng theo thứ tự làm bài (đã gộp các nhóm phân đoạn).
                {titleHint ? (
                  <span className='block [overflow-wrap:anywhere] opacity-90 mt-0.5'>
                    Tiêu đề:{' '}
                    <span className='font-semibold text-blue-900'>
                      {titleHint}
                    </span>
                  </span>
                ) : null}
              </p>
            </div>
          </div>
          {!loading && localQuizzes.length > 0 ? (
            <div className='flex items-center gap-2 shrink-0 ml-auto'>
              <span className='text-[12px] md:text-[13px] font-semibold tabular-nums text-blue-700 bg-blue-100/80 border border-blue-200/90 px-2 py-0.5 rounded-full'>
                {localQuizzes.length} câu
              </span>
              {onBack && (
                <CustomButton
                  type='button'
                  variant='outline'
                  label='Quay lại'
                  icon={<ArrowLeft className='w-4 h-4' />}
                  className='h-8.5 text-[13px] font-bold border-blue-200 text-blue-700 bg-white hover:bg-blue-50 rounded-lg px-3'
                  onClick={onBack}
                />
              )}
            </div>
          ) : (
            onBack && (
              <div className='ml-auto shrink-0'>
                <CustomButton
                  type='button'
                  variant='outline'
                  label='Quay lại'
                  icon={<ArrowLeft className='w-4 h-4' />}
                  className='h-8.5 text-[13px] font-bold border-blue-200 text-blue-700 bg-white hover:bg-blue-50 rounded-lg px-3'
                  onClick={onBack}
                />
              </div>
            )
          )}
        </div>

        <div
          className='flex flex-wrap gap-1 p-0.5 rounded-xl bg-blue-900/10 border border-blue-200/60 w-fit max-w-full'
          role='tablist'
          aria-label='Chế độ xem'
        >
          <button
            type='button'
            role='tab'
            aria-selected={mode === 'teacher'}
            onClick={() => setMode('teacher')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] md:text-[13px] font-bold transition-colors',
              mode === 'teacher'
                ? 'bg-white text-blue-900 shadow-sm'
                : 'text-blue-800/80 hover:text-blue-950'
            )}
          >
            <Eye
              className='w-3.5 h-3.5 shrink-0'
              strokeWidth={2.25}
              aria-hidden
            />
            Giáo viên & chỉnh sửa
          </button>
          <button
            type='button'
            role='tab'
            aria-selected={mode === 'student'}
            onClick={() => {
              setMode('student')
              setEditingQuizId(null)
            }}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] md:text-[13px] font-bold transition-colors',
              mode === 'student'
                ? 'bg-white text-blue-900 shadow-sm'
                : 'text-blue-800/80 hover:text-blue-950'
            )}
          >
            <GraduationCap
              className='w-3.5 h-3.5 shrink-0'
              strokeWidth={2.25}
              aria-hidden
            />
            Góc nhìn học viên
          </button>
        </div>
      </div>

      <div className='px-4 py-3 md:px-5 md:py-4'>
        {loading ? (
          <div className='flex items-center gap-2 text-[13px] md:text-[14px] text-blue-900/80 py-6 justify-center'>
            <Loader2
              className='w-4 h-4 animate-spin text-blue-600 shrink-0'
              aria-hidden
            />
            Đang tải bài kiểm tra đầy đủ…
          </div>
        ) : localQuizzes.length === 0 ? (
          <p className='text-[13px] md:text-[14px] text-blue-900/70 leading-relaxed py-2'>
            Chưa có câu hỏi nào cho bài kiểm tra này. Sau khi sinh câu thành
            công, danh sách sẽ hiện ở đây.
          </p>
        ) : mode === 'student' ? (
          <ol className='space-y-4 pr-1'>
            {localQuizzes.map((q, idx) => {
              const answered = Boolean(revealedByQuizId[q.id])
              const selectedId = selectionByQuizId[q.id]

              return (
                <li
                  key={q.id}
                  className='rounded-xl border border-slate-200/90 bg-slate-50/40 p-3 md:p-3.5 shadow-sm'
                >
                  <p className='text-[12px] md:text-[13px] font-bold text-slate-800 leading-snug flex gap-2'>
                    <span className='tabular-nums text-blue-700 shrink-0'>
                      {idx + 1}.
                    </span>
                    <div className='[overflow-wrap:anywhere] prose-sm max-w-none prose-p:my-0' dangerouslySetInnerHTML={{ 
                      __html: (q.question || '').includes('&lt;') 
                        ? new DOMParser().parseFromString(q.question || '', 'text/html').documentElement.textContent || ''
                        : (q.question || '')
                    }} />
                  </p>

                  {q.type === QuestionType.SHORT_ANSWER ? (
                    <div className='mt-2.5'>
                      <label className='sr-only'>Ô trả lời ngắn</label>
                      <textarea
                        readOnly
                        disabled
                        placeholder='Học viên nhập câu trả lời tại đây…'
                        className='w-full min-h-[72px] rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-[12px] md:text-[13px] text-slate-600 placeholder:text-slate-400 resize-none cursor-not-allowed'
                      />
                    </div>
                  ) : (
                    <ul className='mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2'>
                      {q.choices.map((choice) => {
                        const isCorrect = choice.isCorrect
                        const isSelected = selectedId === choice.id

                        let ring =
                          'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 text-slate-700'
                        if (answered) {
                          if (isCorrect)
                            ring =
                              'border-blue-300 bg-blue-50/90 text-blue-950 shadow-[0_0_12px_rgba(37,99,235,0.12)]'
                          else if (isSelected)
                            ring =
                              'border-rose-300 bg-rose-50/90 text-rose-950 shadow-[0_0_12px_rgba(244,63,94,0.1)]'
                          else
                            ring =
                              'opacity-45 border-slate-100 bg-slate-50/50 text-slate-500'
                        }

                        return (
                          <li key={choice.id}>
                            <button
                              type='button'
                              onClick={() => handlePickChoice(q.id, choice.id)}
                              className={cn(
                                'w-full text-left rounded-xl border px-3 py-2 text-[12px] md:text-[13px] font-medium leading-snug transition-colors',
                                ring
                              )}
                            >
                              <span className='[overflow-wrap:anywhere]'>
                                {choice.text}
                              </span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}

                  {answered &&
                  q.type !== QuestionType.SHORT_ANSWER &&
                  q.explanation?.trim() ? (
                    <div className='mt-2 text-[11px] md:text-[12px] text-slate-600 leading-snug border-t border-slate-200/80 pt-2 [overflow-wrap:anywhere] prose-sm max-w-none prose-p:my-0 prose-p:inline'>
                      <span className='font-semibold text-slate-700 mr-1'>
                        Giải thích:
                      </span>
                      <ExplanationCitation
                        text={q.explanation.trim()}
                        chunks={chunks}
                        handleSeek={handleSeek}
                        lessonType={lessonType}
                      />
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ol>
        ) : (
          <ol className='space-y-4 pr-1'>
            {localQuizzes.map((q, idx) => (
              <li
                key={q.id}
                className='rounded-xl border border-slate-200/90 bg-white p-3 md:p-3.5 shadow-sm space-y-2'
              >
                <div className='flex flex-wrap items-start justify-between gap-2'>
                  <p className='text-[12px] md:text-[13px] font-bold text-slate-800 leading-snug flex gap-2 min-w-0 flex-1'>
                    <span className='tabular-nums text-blue-700 shrink-0'>
                      {idx + 1}.
                    </span>
                    <div className='[overflow-wrap:anywhere] prose-sm max-w-none prose-p:my-0' dangerouslySetInnerHTML={{ 
                      __html: (q.question || '').includes('&lt;') 
                        ? new DOMParser().parseFromString(q.question || '', 'text/html').documentElement.textContent || ''
                        : (q.question || '')
                    }} />
                  </p>
                  <CustomButton
                    type='button'
                    variant='outline'
                    label={editingQuizId === q.id ? 'Đang sửa…' : 'Chỉnh sửa'}
                    icon={<PencilLine className='w-4 h-4' strokeWidth={2.25} />}
                    className='h-8.5 text-[12px] md:text-[13px] font-bold shrink-0 rounded-lg border-blue-200 text-blue-800'
                    onClick={() =>
                      setEditingQuizId((cur) => (cur === q.id ? null : q.id))
                    }
                    disabled={editingQuizId !== null && editingQuizId !== q.id}
                  />
                </div>

                {q.type === QuestionType.SHORT_ANSWER ? (
                  <div className='rounded-lg border border-blue-100 bg-blue-50/50 px-3 py-2'>
                    <p className='text-[11px] font-semibold text-blue-900 mb-1'>
                      Tự luận ngắn
                    </p>
                    {q.explanation?.trim() ? (
                      <div className='text-[11px] md:text-[12px] text-blue-900/85 leading-snug [overflow-wrap:anywhere] prose-sm max-w-none prose-p:my-0 prose-p:inline'>
                        <span className='font-semibold mr-1'>
                          Gợi ý đáp án / chấm:
                        </span>
                        <ExplanationCitation
                          text={q.explanation.trim()}
                          chunks={chunks}
                          handleSeek={handleSeek}
                          lessonType={lessonType}
                        />
                      </div>
                    ) : (
                      <p className='text-[10px] text-blue-800/70'>
                        Chưa có gợi ý chấm.
                      </p>
                    )}
                  </div>
                ) : (
                  <ul className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                    {q.choices.map((choice) => (
                      <li
                        key={choice.id}
                        className={cn(
                          'rounded-xl border px-3 py-2 text-[12px] md:text-[13px] font-medium leading-snug',
                          choice.isCorrect
                            ? 'border-blue-400 bg-blue-50/95 text-blue-950 ring-1 ring-blue-200/80'
                            : 'border-slate-200 bg-slate-50/60 text-slate-600'
                        )}
                      >
                        {choice.isCorrect ? (
                          <span className='block text-[10px] font-bold uppercase tracking-wide text-blue-700 mb-0.5'>
                            Đáp án đúng
                          </span>
                        ) : null}
                        <span className='[overflow-wrap:anywhere]'>
                          {choice.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {q.type !== QuestionType.SHORT_ANSWER &&
                q.explanation?.trim() ? (
                  <div className='text-[11px] md:text-[12px] text-slate-600 leading-snug border-t border-slate-100 pt-2 [overflow-wrap:anywhere] prose-sm max-w-none prose-p:my-0 prose-p:inline'>
                    <span className='font-semibold text-slate-700 mr-1'>
                      Giải thích:
                    </span>
                    <ExplanationCitation
                      text={q.explanation.trim()}
                      chunks={chunks}
                      handleSeek={handleSeek}
                      lessonType={lessonType}
                    />
                  </div>
                ) : null}

                {editingQuizId === q.id ? (
                  <QuizTeacherInlineEditor
                    key={q.id}
                    quiz={q}
                    onCancel={() => setEditingQuizId(null)}
                    onSaved={handleQuizSavedAfterPatch}
                    chunks={chunks}
                    handleSeek={handleSeek}
                    lessonType={lessonType}
                  />
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}

export default LessonExamBlueprintTestPreviewPanel
