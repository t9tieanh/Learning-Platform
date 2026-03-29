import React, { useState } from 'react'
import { ChevronDown, Clock, Hash, Pencil, Check, X, PlayCircle, RefreshCw } from 'lucide-react'
import CustomButton from '@/components/common/Button'
import CustomTextarea from '@/components/common/Textarea'
import { LessonChunk } from '@/types/ai'

interface ChunkCardProps {
  chunk: LessonChunk
  onSaveSummary: (id: string, newSummary: string) => Promise<void> | void
  /** Seek the video preview to this chunk's start time */
  onSeek?: (startTime: string | null) => void
}

const ChunkCard: React.FC<ChunkCardProps> = ({ chunk, onSaveSummary, onSeek }) => {
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

  return (
    <div className='border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow'>
      {/* Card Header */}
      <div
        className='flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer select-none'
        onClick={() => {
          if (!isEditing) setIsExpanded((v) => !v)
        }}
      >
        <div className='flex items-center gap-3 flex-1 min-w-0 pr-4'>
          {/* Index badge */}
          <div className='flex-shrink-0 flex items-center gap-1 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full'>
            <Hash className='w-3 h-3' />
            {chunk.chunkIndex + 1}
          </div>

          <div className='flex flex-col flex-1 min-w-0 pr-4'>
            {/* Chunk Title (Truncated if too long) */}
            {chunk.title && (
              <div className='text-[15px] font-semibold text-gray-800 truncate mb-0.5' title={chunk.title}>
                {chunk.title}
              </div>
            )}

            {/* Timestamp + Seek button */}
            {chunk.timestamp && (
              <div className='flex-shrink-0 flex items-center gap-1'>
                <div className='flex items-center gap-1 text-xs text-indigo-600 font-medium'>
                  <Clock className='w-3 h-3' />
                  {chunk.timestamp}
                </div>
                {onSeek && (
                  <CustomButton
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation()
                      onSeek(chunk.startTime)
                    }}
                    className='p-0.5 h-4 w-4 rounded bg-indigo-100 hover:bg-indigo-200 border-0 text-indigo-600 transition-colors shadow-none ml-0.5'
                    title='Tua video tới phân đoạn này'
                  >
                    <PlayCircle className='w-3 h-3' />
                  </CustomButton>
                )}
              </div>
            )}
          </div>

          {/* Sentence count badge (hidden on very small screens) */}
          {chunk.sentenceCount && (
            <span className='flex-shrink-0 text-xs text-gray-400 hidden sm:inline'>{chunk.sentenceCount} câu</span>
          )}
        </div>

        <div className='flex items-center gap-2'>
          {/* Edit button */}
          {!isEditing && (
            <CustomButton
              type='button'
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(true)
                setIsEditing(true)
              }}
              className='p-1 h-7 w-7 rounded-md hover:bg-blue-100 bg-transparent border-0 text-blue-500 transition-colors shadow-none'
              title='Chỉnh sửa tóm tắt'
            >
              <Pencil className='w-3.5 h-3.5' />
            </CustomButton>
          )}
          {/* Animated chevron */}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-300 ease-in-out ${
              isExpanded ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </div>
      </div>

      {/* Smooth expand/collapse via CSS grid-rows transition */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className='overflow-hidden'>
          <div className='px-4 pb-4 pt-2 space-y-3'>
            {isEditing ? (
              <>
                <CustomTextarea
                  value={draftSummary}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDraftSummary(e.target.value)}
                  rows={4}
                  className='text-sm w-full'
                  autoFocus
                />
                <div className='flex gap-2 justify-end'>
                  <CustomButton
                    type='button'
                    label='Hủy'
                    icon={<X className='w-3.5 h-3.5 mr-1' />}
                    className='rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-xs px-3 h-8'
                    onClick={handleCancel}
                  />
                  <CustomButton
                    type='button'
                    label={isSaving ? 'Đang lưu' : 'Lưu'}
                    icon={
                      isSaving ? (
                        <RefreshCw className='w-3.5 h-3.5 mr-1 animate-spin' />
                      ) : (
                        <Check className='w-3.5 h-3.5 mr-1' />
                      )
                    }
                    className='rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs px-3 h-8'
                    onClick={handleSave}
                    disabled={isSaving}
                  />
                </div>
              </>
            ) : (
              <p className='text-sm text-gray-700 leading-relaxed whitespace-pre-wrap'>
                {chunk.summary ?? <span className='text-gray-400 italic'>Chưa có tóm tắt</span>}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChunkCard
