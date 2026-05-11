import React, { useState } from 'react'
import { ChevronDown, Hash, Pencil, PlayCircle, Check } from 'lucide-react'
import CustomButton from '@/components/common/Button'
import { LessonChunk } from '@/types/ai'
import { cn } from '@/lib/utils'
import { LessonType } from '@/types/lesson'

interface ChunkCardProps {
  chunk: LessonChunk
  onSaveSummary: (id: string, newSummary: string) => Promise<void> | void
  onSeek?: (startTime: string | null) => void
  lessonType?: LessonType
}

const ChunkCard: React.FC<ChunkCardProps> = ({ chunk, onSaveSummary, onSeek, lessonType }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [draftSummary, setDraftSummary] = useState(chunk.summary ?? '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await onSaveSummary(chunk.id, draftSummary)
      setIsEditing(false)
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setDraftSummary(chunk.summary ?? '')
    setIsEditing(false)
  }

  const seekTime = chunk.startTime ?? chunk.timestamp

  return (
    <div
      className={cn(
        'rounded-xl border border-blue-200/50 shadow-md shadow-blue-100/20',
        'border-l-[4px] border-l-blue-600 ring-1 ring-blue-100/40',
        'overflow-hidden bg-gradient-to-b from-blue-50/45 via-white to-indigo-50/20',
        'transition-shadow duration-300 hover:shadow-lg hover:shadow-blue-100/30'
      )}
    >
      <div
        className='flex items-center justify-between gap-2 px-3 py-3 md:px-4 bg-blue-50/50 cursor-pointer select-none group/header'
        onClick={() => {
          if (!isEditing) setIsExpanded((v) => !v)
        }}
      >
        <div className='flex items-center gap-3 flex-1 min-w-0 pr-2'>
          <div
            className={cn(
              'w-9 h-9 md:w-10 md:h-10 shrink-0 flex items-center justify-center rounded-2xl',
              'bg-white/95 text-blue-700 font-bold text-[12px] md:text-[13px] tabular-nums',
              'border border-blue-200/80 shadow-sm ring-1 ring-blue-100/30',
              'group-hover/header:scale-[1.02] transition-transform'
            )}
          >
            {chunk.chunkIndex + 1}
          </div>

          <div className='flex flex-col flex-1 min-w-0 gap-0.5'>
            {chunk.title && (
              <div
                className='text-[12px] md:text-[13px] font-semibold text-gray-800 [overflow-wrap:anywhere] line-clamp-2 group-hover/header:text-blue-800 transition-colors'
                title={chunk.title}
              >
                {chunk.title}
              </div>
            )}

            <div className='flex items-center flex-wrap gap-x-2 gap-y-0.5'>
              {lessonType === LessonType.VIDEO ? (
                <>
                  {(chunk.timestamp || seekTime) && (
                    <span className='inline-flex items-center gap-1 text-[10px] md:text-[11px] text-gray-500 font-medium tabular-nums bg-white/80 px-1.5 py-0.5 rounded-md border border-blue-100/80'>
                      <Hash className='w-3 h-3 text-blue-500 shrink-0' strokeWidth={2.5} />
                      {chunk.timestamp ?? seekTime}
                    </span>
                  )}
                  {onSeek && seekTime && (
                    <CustomButton
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation()
                        onSeek(seekTime)
                      }}
                      title='Tua tới đoạn này trong video'
                      icon={<PlayCircle className='w-3.5 h-3.5' strokeWidth={2.25} />}
                      className='h-7 min-w-7 px-1.5 bg-white/90 border border-blue-200/80 text-blue-600 hover:text-blue-800 hover:bg-blue-50/80 rounded-lg shadow-sm'
                    />
                  )}
                </>
              ) : (
                chunk.summary && !isExpanded && (
                  <div className='flex items-center gap-2 min-w-0 flex-1 pr-4'>
                    <p className='text-[11px] text-gray-500 line-clamp-1 italic'>
                      {chunk.summary}
                    </p>
                    <button
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsExpanded(true)
                      }}
                      className='text-[10px] font-bold text-blue-600 hover:text-blue-800 shrink-0'
                    >
                      Xem thêm
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        <div className='flex items-center gap-1 shrink-0'>
          {!isEditing && (
            <CustomButton
              type='button'
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(true)
                setIsEditing(true)
              }}
              variant='ghost'
              size='sm'
              icon={<Pencil className='w-3.5 h-3.5' strokeWidth={2.25} />}
              className='h-8 w-8 p-0 text-gray-400 hover:text-blue-600 hover:bg-white/80 border border-transparent hover:border-blue-100 rounded-lg shadow-none'
            />
          )}
          <ChevronDown
            className={cn(
              'w-4 h-4 text-blue-500/80 transition-transform duration-200 shrink-0',
              isExpanded ? 'rotate-180' : 'rotate-0'
            )}
            strokeWidth={2.25}
            aria-hidden
          />
        </div>
      </div>

      <div
        className={cn(
          'grid transition-all duration-300 ease-in-out',
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className='overflow-hidden min-h-0'>
          <div className='px-3 md:px-4 pb-3 md:pb-4 pt-2 space-y-4 border-t border-blue-100/70 bg-gradient-to-b from-white/90 to-slate-50/40'>
            {isEditing ? (
              <div className='space-y-4 animate-in fade-in slide-in-from-top-1 duration-200'>
                <div className='flex flex-col gap-1.5'>
                  <label className='text-[10px] font-bold text-gray-500 px-0.5'>Tóm tắt kiến thức</label>
                  <textarea
                    value={draftSummary}
                    onChange={(e) => setDraftSummary(e.target.value)}
                    className='w-full text-[12px] font-medium text-gray-700 leading-relaxed bg-white p-3.5 rounded-xl border border-gray-200 focus:border-blue-200 focus:ring-1 focus:ring-blue-100 outline-none transition-all min-h-[110px] shadow-sm placeholder:text-gray-400'
                    autoFocus
                    placeholder='Ghi lại những ý chính quan trọng của phân đoạn bài học này...'
                  />
                </div>
                <div className='flex gap-3 justify-end items-center'>
                  <CustomButton
                    type='button'
                    label='Huỷ bỏ'
                    variant='ghost'
                    className='text-gray-400 hover:text-gray-600 text-[10px] font-bold px-4 h-8 transition-all'
                    onClick={handleCancel}
                  />
                  <CustomButton
                    type='button'
                    label={isSaving ? 'Đang lưu...' : 'Lưu tóm tắt'}
                    icon={!isSaving ? <Check className='w-4 h-4' /> : null}
                    className='bg-blue-600 hover:bg-blue-700 text-white text-[10.5px] font-bold px-6 h-8.5 rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95'
                    onClick={handleSave}
                    disabled={isSaving}
                  />
                </div>
              </div>
            ) : (
              <div className='border-l-2 border-blue-200/60 pl-3 py-0.5'>
                <p className='text-[12px] md:text-[13px] text-gray-700 leading-relaxed font-normal'>
                  {chunk.summary || (
                    <span className='text-gray-400 italic font-normal'>Chưa có nội dung tóm tắt cho phân đoạn này.</span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChunkCard
