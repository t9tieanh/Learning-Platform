import React, { useState, useRef, useMemo } from 'react'
import { PencilLine, Plus, X, Trash2, ShieldCheck } from 'lucide-react'
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
import CustomButton from '@/components/common/Button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { GeneratedQuiz } from '@/types/quiz'
import { QuestionType, QuizDifficulty } from '@/types/quiz'
import { LessonType } from '@/types/lesson'
import { LessonChunk } from '@/types/ai'
import quizService from '@/services/assistant/quiz.service'
import ExplanationCitation from './ExplanationCitation'

type DraftChoice = { key: string; text: string; isCorrect: boolean }

function draftChoicesFromQuiz(q: GeneratedQuiz): DraftChoice[] {
  return q.choices.map((c) => ({
    key: c.id,
    text: c.text,
    isCorrect: c.isCorrect,
  }))
}

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
  chunks: LessonChunk[]
  handleSeek?: (startTime: string | null) => void
  lessonType?: LessonType
}

const QuizTeacherInlineEditor: React.FC<QuizTeacherInlineEditorProps> = ({
  quiz,
  onCancel,
  onSaved,
  chunks,
  handleSeek,
  lessonType,
}) => {
  const [question, setQuestion] = useState(quiz.question)
  const [explanation, setExplanation] = useState(quiz.explanation ?? '')
  const [type, setType] = useState<QuestionType>(() => initialEditorType(quiz))
  const [difficulty, setDifficulty] = useState<QuizDifficulty>(quiz.difficulty)
  const [choices, setChoices] = useState<DraftChoice[]>(() =>
    initialEditorChoices(quiz)
  )
  const [saving, setSaving] = useState(false)

  // Mentions logic
  const [mentionOpen, setMentionOpen] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionIndex, setMentionIndex] = useState(-1)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const filteredChunks = useMemo(() => {
    const query = mentionQuery.toLowerCase()
    return chunks.filter(
      (c) =>
        (c.title || '').toLowerCase().includes(query) ||
        (c.timestamp || '').includes(query)
    )
  }, [chunks, mentionQuery])

  const handleExplanationChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const val = e.target.value
    const pos = e.target.selectionStart
    setExplanation(val)

    const lastAt = val.lastIndexOf('@', pos - 1)
    if (lastAt !== -1) {
      const textAfterAt = val.substring(lastAt + 1, pos)
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        setMentionOpen(true)
        setMentionQuery(textAfterAt)
        setMentionIndex(lastAt)
        setSelectedIndex(0)
        return
      }
    }
    setMentionOpen(false)
  }

  const insertMention = (chunk: LessonChunk) => {
    if (mentionIndex === -1) return
    const before = explanation.substring(0, mentionIndex)
    const after = explanation.substring(textareaRef.current?.selectionStart || 0)
    const mentionText = `@{{${chunk.id}}}@`
    setExplanation(before + mentionText + after)
    setMentionOpen(false)

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        const newPos = mentionIndex + mentionText.length
        textareaRef.current.setSelectionRange(newPos, newPos)
      }
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!mentionOpen) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(
        (prev) => (prev + 1) % Math.max(1, filteredChunks.length)
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(
        (prev) =>
          (prev - 1 + filteredChunks.length) % Math.max(1, filteredChunks.length)
      )
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (filteredChunks.length > 0) {
        e.preventDefault()
        insertMention(filteredChunks[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      setMentionOpen(false)
    }
  }

  const setCorrectExclusive = (key: string) => {
    setChoices((prev) => prev.map((c) => ({ ...c, isCorrect: c.key === key })))
  }

  const addChoice = () => {
    setChoices((prev) => [
      ...prev,
      {
        key: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        text: '',
        isCorrect: false,
      },
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
    <div className='mt-4 pt-4 border-t border-slate-100 space-y-4'>
      <p className='text-[13px] md:text-[14px] font-bold text-blue-900 flex items-center gap-1.5 px-0.5'>
        <PencilLine
          className='w-4.5 h-4.5 shrink-0'
          strokeWidth={2.25}
          aria-hidden
        />
        Soạn thảo (giáo viên)
      </p>

      <div className='space-y-2'>
        <Label className='text-[12px] md:text-[13px] font-semibold text-gray-600'>
          Câu hỏi
        </Label>
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          className='text-[12px] md:text-[13px] resize-y min-h-[72px]'
        />
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
        <div className='space-y-1'>
          <Label className='text-[12px] font-semibold text-gray-600'>
            Dạng câu
          </Label>
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
            <SelectTrigger size='sm' className='h-9.5 text-[13px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUESTION_TYPES.map((t) => (
                <SelectItem key={t} value={t} className='text-[14px]'>
                  {t === QuestionType.MULTIPLE_CHOICE
                    ? 'Trắc nghiệm'
                    : 'Đúng / Sai'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='space-y-1'>
          <Label className='text-[12px] font-semibold text-gray-600'>
            Độ khó
          </Label>
          <Select
            value={difficulty}
            onValueChange={(v) => setDifficulty(v as QuizDifficulty)}
          >
            <SelectTrigger size='sm' className='h-9.5 text-[13px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTIES.map((d) => (
                <SelectItem key={d} value={d} className='text-[14px]'>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='space-y-2'>
        <Label className='text-[12px] md:text-[13px] font-semibold text-gray-600'>
          Giải thích / gợi ý chấm
        </Label>
        <div className='relative group/exp'>
          <Textarea
            ref={textareaRef}
            value={explanation}
            onChange={handleExplanationChange}
            onKeyDown={handleKeyDown}
            rows={3}
            className='text-[12px] md:text-[13px] resize-y min-h-[80px] pb-10'
            placeholder='Gõ @ để nhắc đến một phân đoạn bài giảng…'
          />

          {mentionOpen && (
            <div className='absolute z-[60] bottom-full left-0 mb-1 w-full max-h-[200px] overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-2xl p-1.5 flex flex-col gap-0.5 animate-in fade-in slide-in-from-bottom-2'>
              <p className='px-2 py-1 text-[10px] font-bold text-slate-400 tracking-wider'>
                Chọn phân đoạn bài giảng
              </p>
              {filteredChunks.length > 0 ? (
                filteredChunks.map((c, idx) => (
                  <button
                    key={c.id}
                    type='button'
                    className={cn(
                      'flex flex-col items-start px-2.5 py-1.5 rounded-lg text-left transition-colors',
                      idx === selectedIndex
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-slate-50'
                    )}
                    onClick={() => insertMention(c)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <span className='text-[12px] font-bold line-clamp-1'>
                      {c.title || `Phân đoạn ${c.chunkIndex + 1}`}
                    </span>
                    <span
                      className={cn(
                        'text-[10px] font-medium opacity-80',
                        idx === selectedIndex ? 'text-blue-100' : 'text-slate-500'
                      )}
                    >
                      {c.timestamp}
                    </span>
                  </button>
                ))
              ) : (
                <div className='px-3 py-4 text-center text-[12px] text-slate-400 italic'>
                  Không tìm thấy phân đoạn phù hợp
                </div>
              )}
            </div>
          )}

          {explanation.trim() && (
            <div className='absolute bottom-2 left-2 right-2 p-2 rounded-lg bg-blue-50/40 border border-blue-100/50 backdrop-blur-sm transition-all pointer-events-none'>
              <div className='text-[11px] md:text-[12px] text-blue-900 leading-snug line-clamp-2'>
                <span className='font-bold text-blue-800 opacity-70 mr-1.5'>
                  Hiển thị:
                </span>
                <ExplanationCitation
                  text={explanation}
                  chunks={chunks}
                  handleSeek={handleSeek}
                  lessonType={lessonType}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className='space-y-2'>
        <div className='flex items-center justify-between gap-2'>
          <Label className='text-[12px] md:text-[13px] font-semibold text-gray-600'>
            Lựa chọn
          </Label>
          <CustomButton
            type='button'
            variant='outline'
            label='Thêm lựa chọn'
            icon={<Plus className='w-3.5 h-3.5' strokeWidth={2.5} />}
            className='h-8 text-[12px] font-semibold rounded-lg px-3'
            onClick={addChoice}
            disabled={saving}
          />
        </div>

        <ul className='grid grid-cols-1 gap-2'>
          {choices.map((c, ci) => (
            <li key={c.key} className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => setCorrectExclusive(c.key)}
                className={cn(
                  'w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 transition-colors',
                  c.isCorrect
                    ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm'
                    : 'border-slate-200 text-slate-300 hover:border-blue-200'
                )}
                title='Chọn làm đáp án đúng'
              >
                {c.isCorrect ? (
                  <ShieldCheck className='w-5 h-5' />
                ) : (
                  <div className='w-5 h-5 rounded-full border-2 border-current' />
                )}
              </button>
              <Input
                value={c.text}
                onChange={(e) => updateChoiceText(c.key, e.target.value)}
                placeholder={`Lựa chọn ${ci + 1}`}
                className='text-[12px] md:text-[13px] flex-1 min-w-0'
              />
              <button
                type='button'
                onClick={() => removeChoice(c.key)}
                className='w-9 h-9 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors'
                disabled={saving}
              >
                <Trash2 className='w-4 h-4' />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className='flex flex-wrap items-center justify-end gap-2 pt-4 mt-2 border-t border-slate-100'>
        <CustomButton
          type='button'
          variant='outline'
          label='Hủy'
          icon={<X className='w-4 h-4' strokeWidth={2.25} />}
          className='h-9 text-[13px] md:text-[14px] font-semibold border-slate-200 text-slate-600 hover:bg-slate-50 px-4'
          onClick={onCancel}
          disabled={saving}
        />
        <CustomButton
          type='button'
          label={saving ? 'Đang lưu…' : 'Lưu thay đổi'}
          className='h-9 text-[13px] md:text-[14px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 shadow-sm shadow-blue-100'
          onClick={() => void handleSave()}
          disabled={saving}
          isLoader={saving}
        />
      </div>
    </div>
  )
}

export default QuizTeacherInlineEditor
