import React, { useEffect, useState } from 'react'
import { Check, Hash, PenLine } from 'lucide-react'
import CustomButton from '@/components/common/Button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { clampQuestionCount } from '../utils/lessonExamBlueprint.utils'

export interface LessonExamBlueprintRowMetaInlineEditorProps {
  rowId: string
  labelIdx: number
  groupTitle: string
  instruction: string
  questionCount: number
  hasServerGroup: boolean
  disabled: boolean
  isSaving: boolean
  onCommit: (
    rowId: string,
    next: { groupTitle: string; instruction: string; questionCount: number }
  ) => Promise<void>
  onCancel: () => void
}

/**
 * Form chỉnh tiêu đề nhóm, số câu và gợi ý ra đề — nhúng trong header nhóm (không dùng dialog).
 */
const LessonExamBlueprintRowMetaInlineEditor: React.FC<
  LessonExamBlueprintRowMetaInlineEditorProps
> = ({
  rowId,
  labelIdx,
  groupTitle,
  instruction,
  questionCount,
  hasServerGroup,
  disabled,
  isSaving,
  onCommit,
  onCancel,
}) => {
  const [draftTitle, setDraftTitle] = useState(groupTitle)
  const [draftInstruction, setDraftInstruction] = useState(instruction)
  const [draftCount, setDraftCount] = useState(String(questionCount))

  useEffect(() => {
    setDraftTitle(groupTitle)
    setDraftInstruction(instruction)
    setDraftCount(String(questionCount))
  }, [groupTitle, instruction, questionCount])

  const handleSave = async () => {
    const n = parseInt(draftCount, 10)
    const qc = clampQuestionCount(Number.isNaN(n) ? questionCount : n)
    try {
      await onCommit(rowId, {
        groupTitle: draftTitle,
        instruction: draftInstruction,
        questionCount: qc,
      })
    } catch {
      /* Parent đã toast lỗi khi cần */
    }
  }

  return (
    <div
      className='min-w-0 flex-1 space-y-2.5 pt-0.5 pb-0.5'
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {hasServerGroup ? (
        <p className='text-[10px] font-medium text-blue-800/90 leading-snug'>
          Đã lưu — bấm Lưu để cập nhật nhóm.
        </p>
      ) : null}

      <div className='space-y-1'>
        <Label
          htmlFor={`inline-meta-title-${rowId}`}
          className='text-[10px] md:text-[11px] font-bold text-gray-500'
        >
          Tiêu đề nhóm
        </Label>
        <Input
          id={`inline-meta-title-${rowId}`}
          placeholder={`Nhóm nội dung ${labelIdx}`}
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          disabled={disabled || isSaving}
          className='h-9 text-[13px] md:text-[14px] border-gray-200 bg-white'
          autoFocus
        />
      </div>

      <div className='flex flex-wrap gap-3 items-end'>
        <div className='space-y-1 min-w-[6rem] max-w-[8rem]'>
          <Label
            htmlFor={`inline-meta-count-${rowId}`}
            className='text-[10px] md:text-[11px] font-bold text-gray-500 flex items-center gap-1'
          >
            <Hash className='w-3 h-3 text-blue-600' strokeWidth={2.5} />
            Số câu
          </Label>
          <Input
            id={`inline-meta-count-${rowId}`}
            type='number'
            min={1}
            max={50}
            value={draftCount}
            onChange={(e) => setDraftCount(e.target.value)}
            disabled={disabled || isSaving}
            className='h-9 text-[13px] font-semibold border-gray-200 bg-white'
          />
        </div>
      </div>

      <div className='space-y-1'>
        <Label
          htmlFor={`inline-meta-hint-${rowId}`}
          className='text-[10px] md:text-[11px] font-bold text-gray-500 flex items-center gap-1.5'
        >
          <PenLine className='w-3 h-3 text-blue-600' strokeWidth={2.5} />
          Cách ra đề (gợi ý cho AI)
        </Label>
        <Textarea
          id={`inline-meta-hint-${rowId}`}
          rows={2}
          placeholder='Ví dụ: ưu tiên trắc nghiệm; cô đọng…'
          value={draftInstruction}
          onChange={(e) => setDraftInstruction(e.target.value)}
          disabled={disabled || isSaving}
          className='w-full min-h-[72px] text-[13px] leading-relaxed border-gray-200 bg-white resize-y placeholder:text-gray-400'
        />
      </div>

      <div className='flex flex-wrap gap-2 justify-end items-center pt-0.5'>
        <CustomButton
          type='button'
          label='Huỷ'
          variant='ghost'
          className='text-gray-500 hover:text-gray-700 text-[11px] font-bold px-3 h-8'
          onClick={onCancel}
          disabled={isSaving}
        />
        <CustomButton
          type='button'
          label={isSaving ? 'Đang lưu…' : hasServerGroup ? 'Lưu nhóm' : 'Áp dụng'}
          icon={!isSaving ? <Check className='w-3.5 h-3.5' /> : undefined}
          className='bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-4 h-8 rounded-lg shadow-sm'
          onClick={() => void handleSave()}
          disabled={disabled || isSaving}
          isLoader={isSaving}
        />
      </div>
    </div>
  )
}

export default LessonExamBlueprintRowMetaInlineEditor
