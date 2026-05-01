import React, { useEffect, useState } from 'react'
import { Check, Hash, Pencil, PenLine } from 'lucide-react'
import CustomButton from '@/components/common/Button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { ExamBlueprintRow } from '../utils/lessonExamBlueprint.utils'
import { clampQuestionCount } from '../utils/lessonExamBlueprint.utils'

export type GroupMetaSnapshot = Pick<ExamBlueprintRow, 'groupTitle' | 'instruction' | 'questionCount'>

export interface LessonExamBlueprintGroupMetaPanelProps {
  rowId: string
  labelIdx: number
  meta: GroupMetaSnapshot
  hasServerGroup: boolean
  disabled: boolean
  isSaving: boolean
  onCommit: (rowId: string, next: GroupMetaSnapshot) => Promise<void>
}

/**
 * Tiêu đề nhóm, số câu và gợi ý ra đề — giống ChunkCard: xem text mặc định, bút chì để vào chế độ sửa.
 */
const LessonExamBlueprintGroupMetaPanel: React.FC<LessonExamBlueprintGroupMetaPanelProps> = ({
  rowId,
  labelIdx,
  meta,
  hasServerGroup,
  disabled,
  isSaving,
  onCommit,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(meta.groupTitle)
  const [draftInstruction, setDraftInstruction] = useState(meta.instruction)
  const [draftCount, setDraftCount] = useState(String(meta.questionCount))

  useEffect(() => {
    if (!isEditing) {
      setDraftTitle(meta.groupTitle)
      setDraftInstruction(meta.instruction)
      setDraftCount(String(meta.questionCount))
    }
  }, [meta.groupTitle, meta.instruction, meta.questionCount, isEditing])

  const displayTitle = meta.groupTitle.trim() || `Nhóm nội dung ${labelIdx}`

  const handleCancel = () => {
    setDraftTitle(meta.groupTitle)
    setDraftInstruction(meta.instruction)
    setDraftCount(String(meta.questionCount))
    setIsEditing(false)
  }

  const handleSave = async () => {
    const n = parseInt(draftCount, 10)
    const questionCount = clampQuestionCount(Number.isNaN(n) ? meta.questionCount : n)
    try {
      await onCommit(rowId, {
        groupTitle: draftTitle,
        instruction: draftInstruction,
        questionCount,
      })
      setIsEditing(false)
    } catch {
      /* Giữ form mở; parent đã toast lỗi khi cần */
    }
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-blue-100/85 bg-gradient-to-b from-white/95 to-slate-50/30',
        'shadow-sm ring-1 ring-blue-100/40 overflow-hidden'
      )}
    >
      <div className='flex items-center justify-between gap-2 px-3 py-2 md:px-3.5 bg-blue-50/40 border-b border-blue-100/70'>
        <span className='text-[11px] md:text-[12px] font-bold text-gray-600 tracking-tight'>
          Thông tin nhóm
          {hasServerGroup ? (
            <span className='ml-2 font-normal text-emerald-700/90'>· đã đồng bộ</span>
          ) : null}
        </span>
        {!disabled && !isEditing && (
          <CustomButton
            type='button'
            variant='ghost'
            size='sm'
            icon={<Pencil className='w-3.5 h-3.5' strokeWidth={2.25} />}
            className='h-8 w-8 p-0 text-gray-400 hover:text-blue-600 hover:bg-white/90 border border-transparent hover:border-blue-100 rounded-lg shadow-none shrink-0'
            onClick={(e) => {
              e.stopPropagation()
              setDraftTitle(meta.groupTitle)
              setDraftInstruction(meta.instruction)
              setDraftCount(String(meta.questionCount))
              setIsEditing(true)
            }}
            aria-label='Chỉnh thông tin nhóm'
          />
        )}
      </div>

      <div className='px-3 py-2.5 md:px-3.5 md:py-3'>
        {isEditing ? (
          <div className='space-y-3 animate-in fade-in slide-in-from-top-1 duration-200'>
            <div className='space-y-1.5'>
              <Label
                htmlFor={`meta-title-${rowId}`}
                className='text-[10px] md:text-[11px] font-bold text-gray-500'
              >
                Tiêu đề nhóm
              </Label>
              <Input
                id={`meta-title-${rowId}`}
                placeholder={`Nhóm nội dung ${labelIdx}`}
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                disabled={disabled || isSaving}
                className='h-10 text-[13px] md:text-[14px] border-gray-200 bg-white'
                autoFocus
              />
            </div>
            <div className='space-y-1.5 max-w-full sm:max-w-[200px]'>
              <Label
                htmlFor={`meta-count-${rowId}`}
                className='text-[10px] md:text-[11px] font-bold text-gray-500 flex items-center gap-1'
              >
                <Hash className='w-3 h-3 text-violet-500' strokeWidth={2.5} />
                Số câu nhóm này
              </Label>
              <Input
                id={`meta-count-${rowId}`}
                type='number'
                min={1}
                max={50}
                value={draftCount}
                onChange={(e) => setDraftCount(e.target.value)}
                disabled={disabled || isSaving}
                className='h-10 text-[13px] font-semibold border-gray-200 bg-white'
              />
            </div>
            <div className='space-y-1.5'>
              <Label
                htmlFor={`meta-hint-${rowId}`}
                className='text-[10px] md:text-[11px] font-bold text-gray-500 flex items-center gap-1.5'
              >
                <PenLine className='w-3 h-3 text-emerald-500' strokeWidth={2.5} />
                Cách ra đề (gợi ý cho AI)
              </Label>
              <Textarea
                id={`meta-hint-${rowId}`}
                rows={3}
                placeholder='Ví dụ: ưu tiên trắc nghiệm; cô đọng; gắn mục tiêu [G1.1]…'
                value={draftInstruction}
                onChange={(e) => setDraftInstruction(e.target.value)}
                disabled={disabled || isSaving}
                className='w-full min-h-[88px] text-[13px] leading-relaxed border-gray-200 bg-white resize-y placeholder:text-gray-400'
              />
            </div>
            <div className='flex gap-2 justify-end items-center pt-1'>
              <CustomButton
                type='button'
                label='Huỷ bỏ'
                variant='ghost'
                className='text-gray-500 hover:text-gray-700 text-[11px] font-bold px-4 h-9'
                onClick={handleCancel}
                disabled={isSaving}
              />
              <CustomButton
                type='button'
                label={
                  isSaving ? 'Đang lưu…' : hasServerGroup ? 'Lưu nhóm' : 'Áp dụng'
                }
                icon={!isSaving ? <Check className='w-4 h-4' /> : undefined}
                className='bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-5 h-9 rounded-xl shadow-md shadow-emerald-100/80'
                onClick={() => void handleSave()}
                disabled={disabled || isSaving}
                isLoader={isSaving}
              />
            </div>
          </div>
        ) : (
          <div className='border-l-2 border-blue-200/60 pl-3 py-0.5'>
            <p className='text-[12px] md:text-[13px] font-semibold text-gray-800 [overflow-wrap:anywhere]'>
              {displayTitle}
            </p>
            <p className='mt-1.5 flex flex-wrap items-center gap-2 text-[11px] md:text-[12px]'>
              <span className='inline-flex items-center gap-1 tabular-nums font-medium text-violet-700 bg-violet-50/90 px-1.5 py-0.5 rounded-md border border-violet-100'>
                <Hash className='w-3 h-3 shrink-0' strokeWidth={2.5} />
                {meta.questionCount} câu
              </span>
            </p>
            <p className='mt-2 text-[11px] md:text-[12px] text-gray-700 leading-relaxed [overflow-wrap:anywhere]'>
              <span className='font-semibold text-emerald-800/90'>Gợi ý ra đề: </span>
              {meta.instruction.trim() ? (
                meta.instruction.trim()
              ) : (
                <span className='text-gray-400 italic font-normal'>
                  Chưa có gợi ý — bấm bút chì để thêm.
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default LessonExamBlueprintGroupMetaPanel
