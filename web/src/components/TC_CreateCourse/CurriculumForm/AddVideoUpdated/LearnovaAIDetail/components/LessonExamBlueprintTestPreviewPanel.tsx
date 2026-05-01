import React, { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Eye,
  GraduationCap,
  Loader2,
  PencilLine,
  Plus,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import CustomButton from '@/components/common/Button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { GeneratedQuiz } from '@/types/quiz'
import { QuestionType, QuizDifficulty } from '@/types/quiz'
import quizService from '@/services/assistant/quiz.service'
import { toast } from 'sonner'

export interface LessonExamBlueprintTestPreviewPanelProps {
  visible: boolean
  loading: boolean
  quizzes: GeneratedQuiz[]
  testTitle?: string | null
  onBack?: () => void
}

type PreviewMode = 'student' | 'teacher'

type DraftChoice = { key: string; text: string; isCorrect: boolean }

function draftChoicesFromQuiz(q: GeneratedQuiz): DraftChoice[] {
  return q.choices.map((c) => ({
    key: c.id,
    text: c.text,
    isCorrect: c.isCorrect,
  }))
}

/** Editor chỉ hỗ trợ trắc nghiệm / đúng-sai; câu tự luận cũ mở ra dưới dạng trắc nghiệm để chuyển khi lưu. */
function initialEditorType(quiz: GeneratedQuiz): QuestionType {
  if (quiz.type === QuestionType.SHORT_ANSWER) return QuestionType.MULTIPLE_CHOICE
  return quiz.type
}

function initialEditorChoices(quiz: GeneratedQuiz): DraftChoice[] {
  if (quiz.type === QuestionType.SHORT_ANSWER) {
    const fromDb = draftChoicesFromQuiz(quiz).filter((c) => c.text.trim().length > 0)
    if (fromDb.length >= 2) return fromDb
    return [
      { key: `conv-a-${quiz.id}`, text: '', isCorrect: true },
      { key: `conv-b-${quiz.id}`, text: '', isCorrect: false },
    ]
  }
  return draftChoicesFromQuiz(quiz)
}

const QUESTION_TYPES = [QuestionType.MULTIPLE_CHOICE, QuestionType.TRUE_FALSE] as const

const DIFFICULTIES = [
  QuizDifficulty.EASY,
  QuizDifficulty.MEDIUM,
  QuizDifficulty.HARD,
] as const

interface QuizTeacherInlineEditorProps {
  quiz: GeneratedQuiz
  onCancel: () => void
  /** Được gọi với payload quiz sau PATCH — panel merge vào danh sách cục bộ, không refetch. */
  onSaved: (updated: GeneratedQuiz) => void
}

const QuizTeacherInlineEditor: React.FC<QuizTeacherInlineEditorProps> = ({
  quiz,
  onCancel,
  onSaved,
}) => {
  const [question, setQuestion] = useState(quiz.question)
  const [explanation, setExplanation] = useState(quiz.explanation ?? '')
  const [type, setType] = useState<QuestionType>(() => initialEditorType(quiz))
  const [difficulty, setDifficulty] = useState<QuizDifficulty>(quiz.difficulty)
  const [choices, setChoices] = useState<DraftChoice[]>(() => initialEditorChoices(quiz))
  const [saving, setSaving] = useState(false)

  const setCorrectExclusive = (key: string) => {
    setChoices((prev) => prev.map((c) => ({ ...c, isCorrect: c.key === key })))
  }

  const addChoice = () => {
    setChoices((prev) => [
      ...prev,
      { key: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, text: '', isCorrect: false },
    ])
  }

  const removeChoice = (key: string) => {
    setChoices((prev) => {
      const next = prev.filter((c) => c.key !== key)
      if (!next.some((c) => c.isCorrect) && next.length > 0) {
        next[0] = { ...next[0], isCorrect: true }
      }
      return next
    })
  }

  const updateChoiceText = (key: string, text: string) => {
    setChoices((prev) => prev.map((c) => (c.key === key ? { ...c, text } : c)))
  }

  const handleSave = async () => {
    const trimmedQ = question.trim()
    if (!trimmedQ) {
      toast.error('Nội dung câu hỏi không được để trống.')
      return
    }

    const payloadChoices = choices
      .map((c) => ({
        text: c.text.trim(),
        isCorrect: c.isCorrect,
      }))
      .filter((c) => c.text.length > 0)

    if (payloadChoices.length < 2) {
      toast.error('Cần ít nhất 2 lựa chọn có nội dung.')
      return
    }
    const nCorrect = payloadChoices.filter((c) => c.isCorrect).length
    if (nCorrect !== 1) {
      toast.error('Phải chọn đúng một đáp án đúng.')
      return
    }

    setSaving(true)
    try {
      const res = await quizService.updateQuiz(quiz.id, {
        question: trimmedQ,
        explanation: explanation.trim(),
        type,
        difficulty,
        choices: payloadChoices,
      })
      if (res.code !== 200 || !res.result) {
        toast.error(res.message || 'Không lưu được câu hỏi.')
        return
      }
      toast.success('Đã lưu chỉnh sửa câu hỏi.')
      onSaved(res.result as GeneratedQuiz)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi khi lưu câu hỏi.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='mt-3 rounded-xl border border-amber-200/90 bg-amber-50/35 p-3 md:p-3.5 space-y-3'>
      <p className='text-[11px] md:text-[12px] font-bold text-amber-950 flex items-center gap-1.5'>
        <PencilLine className='w-3.5 h-3.5 shrink-0' strokeWidth={2.25} aria-hidden />
        Soạn thảo (giáo viên)
      </p>

      <div className='space-y-2'>
        <Label className='text-[10px] md:text-[11px] font-semibold text-gray-600'>Câu hỏi</Label>
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          className='text-[11px] md:text-[12px] resize-y min-h-[72px]'
        />
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
        <div className='space-y-1'>
          <Label className='text-[10px] font-semibold text-gray-600'>Dạng câu</Label>
          <Select
            value={type}
            onValueChange={(v) => {
              const next = v as QuestionType
              setType(next)
              if (choices.length < 2) {
                setChoices([
                  { key: `n1-${Date.now()}`, text: '', isCorrect: true },
                  { key: `n2-${Date.now()}`, text: '', isCorrect: false },
                ])
              }
            }}
          >
            <SelectTrigger size='sm' className='h-9 text-[11px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUESTION_TYPES.map((t) => (
                <SelectItem key={t} value={t} className='text-[12px]'>
                  {t === QuestionType.MULTIPLE_CHOICE ? 'Trắc nghiệm' : 'Đúng / Sai'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='space-y-1'>
          <Label className='text-[10px] font-semibold text-gray-600'>Độ khó</Label>
          <Select value={difficulty} onValueChange={(v) => setDifficulty(v as QuizDifficulty)}>
            <SelectTrigger size='sm' className='h-9 text-[11px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTIES.map((d) => (
                <SelectItem key={d} value={d} className='text-[12px]'>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='space-y-2'>
        <Label className='text-[10px] md:text-[11px] font-semibold text-gray-600'>
          Giải thích / gợi ý chấm
        </Label>
        <Textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          rows={2}
          className='text-[11px] md:text-[12px] resize-y'
          placeholder='Hiển thị sau khi học viên trả lời…'
        />
      </div>

      <div className='space-y-2'>
        <div className='flex items-center justify-between gap-2'>
          <Label className='text-[10px] md:text-[11px] font-semibold text-gray-600'>Lựa chọn</Label>
          <CustomButton
            type='button'
            variant='outline'
            label='Thêm lựa chọn'
            icon={<Plus className='w-3 h-3' strokeWidth={2.5} />}
            className='h-7 text-[10px] font-semibold rounded-lg px-2'
            onClick={addChoice}
            disabled={saving}
          />
        </div>
        <ul className='space-y-2'>
          {choices.map((c, ci) => (
            <li
              key={c.key}
              className='flex flex-col sm:flex-row sm:items-center gap-2 rounded-lg border border-gray-200 bg-white/90 p-2'
            >
              <button
                type='button'
                onClick={() => setCorrectExclusive(c.key)}
                className={cn(
                  'shrink-0 text-[10px] font-bold px-2 py-1 rounded-md border transition-colors',
                  c.isCorrect
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                    : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-emerald-200'
                )}
              >
                {c.isCorrect ? 'Đáp án đúng' : `Đánh dấu đúng`}
              </button>
              <Input
                value={c.text}
                onChange={(e) => updateChoiceText(c.key, e.target.value)}
                placeholder={`Lựa chọn ${ci + 1}`}
                className='text-[11px] md:text-[12px] flex-1 min-w-0'
              />
              <button
                type='button'
                className='inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-transparent text-rose-600 hover:bg-rose-50 disabled:opacity-40'
                onClick={() => removeChoice(c.key)}
                disabled={saving || choices.length <= 2}
                aria-label='Xóa lựa chọn'
              >
                <Trash2 className='w-3.5 h-3.5' strokeWidth={2.25} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className='flex flex-wrap items-center justify-end gap-2 pt-3 mt-1 border-t border-amber-200/70'>
        <CustomButton
          type='button'
          variant='outline'
          label='Hủy'
          icon={<X className='w-3.5 h-3.5' strokeWidth={2.25} />}
          className='h-8 text-[11px] md:text-[12px] font-semibold border-gray-200 text-gray-700'
          onClick={onCancel}
          disabled={saving}
        />
        <CustomButton
          type='button'
          label={saving ? 'Đang lưu…' : 'Lưu'}
          className='h-8 text-[11px] md:text-[12px] font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-4 min-w-[88px]'
          onClick={() => void handleSave()}
          disabled={saving}
          isLoader={saving}
        />
      </div>
    </div>
  )
}

/**
 * Flat lesson-test preview: learner interaction vs teacher review/edit.
 */
const LessonExamBlueprintTestPreviewPanel: React.FC<
  LessonExamBlueprintTestPreviewPanelProps
> = ({ visible, loading, quizzes, testTitle, onBack }) => {
  const [mode, setMode] = useState<PreviewMode>('teacher')
  const [localQuizzes, setLocalQuizzes] = useState<GeneratedQuiz[]>(quizzes)
  const [selectionByQuizId, setSelectionByQuizId] = useState<Record<string, string>>({})
  const [revealedByQuizId, setRevealedByQuizId] = useState<Record<string, boolean>>({})
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
    setEditingQuizId(null)
    setLocalQuizzes((prev) => prev.map((q) => (q.id === updated.id ? updated : q)))
    setSelectionByQuizId((prev) => {
      const next = { ...prev }
      delete next[updated.id]
      return next
    })
    setRevealedByQuizId((prev) => {
      const next = { ...prev }
      delete next[updated.id]
      return next
    })
  }

  return (
    <div className='rounded-2xl border border-violet-200/80 bg-gradient-to-b from-violet-50/90 via-white to-white shadow-md shadow-violet-100/60 overflow-hidden'>
      <div className='px-4 py-3 md:px-5 md:py-3.5 border-b border-violet-100/90 bg-violet-600/[0.07] flex flex-col gap-3'>
        <div className='flex flex-wrap items-start gap-3'>
          <div className='flex items-center gap-2 min-w-0 flex-1'>
            <div className='shrink-0 w-8 h-8 rounded-xl bg-violet-600/15 flex items-center justify-center border border-violet-300/40'>
              {mode === 'student' ? (
                <GraduationCap className='w-4 h-4 text-violet-700' strokeWidth={2.25} aria-hidden />
              ) : (
                <ShieldCheck className='w-4 h-4 text-violet-700' strokeWidth={2.25} aria-hidden />
              )}
            </div>
            <div className='min-w-0'>
              <h3 className='text-[12px] md:text-[13px] font-bold text-violet-950 tracking-tight leading-snug'>
                Xem trước toàn bài kiểm tra
              </h3>
              <p className='text-[10px] md:text-[11px] text-violet-800/75 font-medium leading-snug mt-0.5'>
                Danh sách phẳng theo thứ tự làm bài (đã gộp các nhóm phân đoạn).
                {titleHint ? (
                  <span className='block [overflow-wrap:anywhere] opacity-90 mt-0.5'>
                    Tiêu đề: <span className='font-semibold text-violet-900'>{titleHint}</span>
                  </span>
                ) : null}
              </p>
            </div>
          </div>
          {!loading && localQuizzes.length > 0 ? (
            <div className='flex items-center gap-2 shrink-0 ml-auto'>
              <span className='text-[10px] md:text-[11px] font-semibold tabular-nums text-violet-700 bg-violet-100/80 border border-violet-200/90 px-2 py-0.5 rounded-full'>
                {localQuizzes.length} câu
              </span>
              {onBack && (
                <CustomButton
                  type='button'
                  variant='outline'
                  label='Quay lại'
                  icon={<ArrowLeft className='w-3 h-3' />}
                  className='h-7.5 text-[11px] font-bold border-violet-200 text-violet-700 bg-white hover:bg-violet-50 rounded-lg px-2.5'
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
                  icon={<ArrowLeft className='w-3 h-3' />}
                  className='h-7.5 text-[11px] font-bold border-violet-200 text-violet-700 bg-white hover:bg-violet-50 rounded-lg px-2.5'
                  onClick={onBack}
                />
              </div>
            )
          )}
        </div>

        <div
          className='flex flex-wrap gap-1 p-0.5 rounded-xl bg-violet-900/10 border border-violet-200/60 w-fit max-w-full'
          role='tablist'
          aria-label='Chế độ xem'
        >
          <button
            type='button'
            role='tab'
            aria-selected={mode === 'teacher'}
            onClick={() => setMode('teacher')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] md:text-[11px] font-bold transition-colors',
              mode === 'teacher'
                ? 'bg-white text-violet-900 shadow-sm'
                : 'text-violet-800/80 hover:text-violet-950'
            )}
          >
            <Eye className='w-3.5 h-3.5 shrink-0' strokeWidth={2.25} aria-hidden />
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
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] md:text-[11px] font-bold transition-colors',
              mode === 'student'
                ? 'bg-white text-violet-900 shadow-sm'
                : 'text-violet-800/80 hover:text-violet-950'
            )}
          >
            <GraduationCap className='w-3.5 h-3.5 shrink-0' strokeWidth={2.25} aria-hidden />
            Góc nhìn học viên
          </button>
        </div>
      </div>

      <div className='px-4 py-3 md:px-5 md:py-4'>
        {loading ? (
          <div className='flex items-center gap-2 text-[11px] md:text-[12px] text-violet-900/80 py-6 justify-center'>
            <Loader2 className='w-4 h-4 animate-spin text-violet-600 shrink-0' aria-hidden />
            Đang tải bài kiểm tra đầy đủ…
          </div>
        ) : localQuizzes.length === 0 ? (
          <p className='text-[11px] md:text-[12px] text-violet-900/70 leading-relaxed py-2'>
            Chưa có câu hỏi nào cho bài kiểm tra này. Sau khi sinh câu thành công, danh sách sẽ hiện ở đây.
          </p>
        ) : mode === 'student' ? (
          <ol className='space-y-4 max-h-[min(70vh,520px)] overflow-y-auto pr-1'>
            {localQuizzes.map((q, idx) => {
              const answered = Boolean(revealedByQuizId[q.id])
              const selectedId = selectionByQuizId[q.id]

              return (
                <li
                  key={q.id}
                  className='rounded-xl border border-slate-200/90 bg-slate-50/40 p-3 md:p-3.5 shadow-sm'
                >
                  <p className='text-[11px] md:text-[12px] font-bold text-slate-800 leading-snug flex gap-2'>
                    <span className='tabular-nums text-violet-700 shrink-0'>{idx + 1}.</span>
                    <span className='[overflow-wrap:anywhere]'>{q.question}</span>
                  </p>

                  {q.type === QuestionType.SHORT_ANSWER ? (
                    <div className='mt-2.5'>
                      <label className='sr-only'>Ô trả lời ngắn</label>
                      <textarea
                        readOnly
                        disabled
                        placeholder='Học viên nhập câu trả lời tại đây…'
                        className='w-full min-h-[72px] rounded-lg border border-slate-200 bg-white/90 px-2.5 py-2 text-[11px] md:text-[12px] text-slate-600 placeholder:text-slate-400 resize-none cursor-not-allowed'
                      />
                    </div>
                  ) : (
                    <ul className='mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2'>
                      {q.choices.map((choice) => {
                        const isCorrect = choice.isCorrect
                        const isSelected = selectedId === choice.id

                        let ring =
                          'border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50/40 text-slate-700'
                        if (answered) {
                          if (isCorrect)
                            ring =
                              'border-emerald-300 bg-emerald-50/90 text-emerald-950 shadow-[0_0_12px_rgba(16,185,129,0.12)]'
                          else if (isSelected)
                            ring =
                              'border-rose-300 bg-rose-50/90 text-rose-950 shadow-[0_0_12px_rgba(244,63,94,0.1)]'
                          else ring = 'opacity-45 border-slate-100 bg-slate-50/50 text-slate-500'
                        }

                        return (
                          <li key={choice.id}>
                            <button
                              type='button'
                              onClick={() => handlePickChoice(q.id, choice.id)}
                              className={cn(
                                'w-full text-left rounded-xl border px-2.5 py-2 text-[11px] md:text-[12px] font-medium leading-snug transition-colors',
                                ring
                              )}
                            >
                              <span className='[overflow-wrap:anywhere]'>{choice.text}</span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}

                  {answered &&
                  q.type !== QuestionType.SHORT_ANSWER &&
                  q.explanation?.trim() ? (
                    <p className='mt-2 text-[10px] md:text-[11px] text-slate-600 leading-snug border-t border-slate-200/80 pt-2 [overflow-wrap:anywhere]'>
                      <span className='font-semibold text-slate-700'>Giải thích: </span>
                      {q.explanation.trim()}
                    </p>
                  ) : null}
                </li>
              )
            })}
          </ol>
        ) : (
          <ol className='space-y-4 max-h-[min(70vh,560px)] overflow-y-auto pr-1'>
            {localQuizzes.map((q, idx) => (
              <li
                key={q.id}
                className='rounded-xl border border-slate-200/90 bg-white p-3 md:p-3.5 shadow-sm space-y-2'
              >
                <div className='flex flex-wrap items-start justify-between gap-2'>
                  <p className='text-[11px] md:text-[12px] font-bold text-slate-800 leading-snug flex gap-2 min-w-0 flex-1'>
                    <span className='tabular-nums text-violet-700 shrink-0'>{idx + 1}.</span>
                    <span className='[overflow-wrap:anywhere]'>{q.question}</span>
                  </p>
                  <CustomButton
                    type='button'
                    variant='outline'
                    label={editingQuizId === q.id ? 'Đang sửa…' : 'Chỉnh sửa'}
                    icon={<PencilLine className='w-3.5 h-3.5' strokeWidth={2.25} />}
                    className='h-8 text-[10px] md:text-[11px] font-bold shrink-0 rounded-lg border-violet-200 text-violet-800'
                    onClick={() =>
                      setEditingQuizId((cur) => (cur === q.id ? null : q.id))
                    }
                    disabled={editingQuizId !== null && editingQuizId !== q.id}
                  />
                </div>

                {q.type === QuestionType.SHORT_ANSWER ? (
                  <div className='rounded-lg border border-sky-100 bg-sky-50/50 px-2.5 py-2'>
                    <p className='text-[10px] font-semibold text-sky-900 mb-1'>Tự luận ngắn</p>
                    {q.explanation?.trim() ? (
                      <p className='text-[10px] md:text-[11px] text-sky-900/85 leading-snug [overflow-wrap:anywhere]'>
                        <span className='font-semibold'>Gợi ý đáp án / chấm: </span>
                        {q.explanation.trim()}
                      </p>
                    ) : (
                      <p className='text-[10px] text-sky-800/70'>Chưa có gợi ý chấm.</p>
                    )}
                  </div>
                ) : (
                  <ul className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                    {q.choices.map((choice) => (
                      <li
                        key={choice.id}
                        className={cn(
                          'rounded-xl border px-2.5 py-2 text-[11px] md:text-[12px] font-medium leading-snug',
                          choice.isCorrect
                            ? 'border-emerald-400 bg-emerald-50/95 text-emerald-950 ring-1 ring-emerald-200/80'
                            : 'border-slate-200 bg-slate-50/60 text-slate-600'
                        )}
                      >
                        {choice.isCorrect ? (
                          <span className='block text-[9px] font-bold uppercase tracking-wide text-emerald-700 mb-0.5'>
                            Đáp án đúng
                          </span>
                        ) : null}
                        <span className='[overflow-wrap:anywhere]'>{choice.text}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {q.type !== QuestionType.SHORT_ANSWER && q.explanation?.trim() ? (
                  <p className='text-[10px] md:text-[11px] text-slate-600 leading-snug border-t border-slate-100 pt-2 [overflow-wrap:anywhere]'>
                    <span className='font-semibold text-slate-700'>Giải thích: </span>
                    {q.explanation.trim()}
                  </p>
                ) : null}

                {editingQuizId === q.id ? (
                  <QuizTeacherInlineEditor
                    key={q.id}
                    quiz={q}
                    onCancel={() => setEditingQuizId(null)}
                    onSaved={handleQuizSavedAfterPatch}
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
