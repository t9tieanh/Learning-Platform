import React, { useState } from 'react'
import { ChevronDown, Clock, Hash, Pencil, PlayCircle, Check, X } from 'lucide-react'
import CustomButton from '@/components/common/Button'
import { LessonChunk } from '@/types/ai'

interface ChunkCardProps {
  chunk: LessonChunk
  onSaveSummary: (id: string, newSummary: string) => Promise<void> | void
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
    <div className='border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300'>
      <div
        className='flex items-center justify-between px-4 py-3 bg-gray-50/50 cursor-pointer select-none group/header'
        onClick={() => {
          if (!isEditing) setIsExpanded((v) => !v)
        }}
      >
        <div className='flex items-center gap-3 flex-1 min-w-0 pr-4'>
          <div className='flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg border border-blue-100 shadow-sm'>
            {chunk.chunkIndex + 1}
          </div>

          <div className='flex flex-col flex-1 min-w-0 pr-4'>
            {chunk.title && (
              <div className='text-[13px] font-bold text-gray-900 truncate mb-0.5' title={chunk.title}>
                {chunk.title}
              </div>
            )}

            {chunk.timestamp && (
              <div className='flex items-center gap-2'>
                <div className='flex items-center gap-1.5 text-[10px] text-gray-400 font-bold'>
                  <span className='bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded'>
                    {chunk.timestamp}
                  </span>
                </div>
                {onSeek && (
                  <CustomButton
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation()
                      onSeek(chunk.startTime)
                    }}
                    icon={<PlayCircle className='w-3 h-3' />}
                    className='p-0 h-4 w-4 bg-transparent border-none text-blue-500 hover:text-blue-700 shadow-none'
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <div className='flex items-center gap-2'>
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
              icon={<Pencil className='w-3 h-3' />}
              className='h-7 w-7 p-0 text-gray-300 hover:text-blue-600 hover:bg-white border-none shadow-none'
            />
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'
              }`}
          />
        </div>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className='overflow-hidden'>
          <div className='px-4 pb-4 pt-2 space-y-4'>
            {isEditing ? (
              <div className='space-y-4 animate-in fade-in slide-in-from-top-1 duration-200'>
                <div className='flex flex-col gap-1.5'>
                  <label className='text-[10px] font-bold text-gray-400 px-1'>Tóm tắt kiến thức</label>
                  <textarea
                    value={draftSummary}
                    onChange={(e) => setDraftSummary(e.target.value)}
                    className='w-full text-[11px] font-medium text-gray-700 leading-relaxed bg-gray-50/20 p-4 rounded-xl border border-gray-100 focus:border-blue-200 focus:bg-white outline-none transition-all min-h-[110px] shadow-none placeholder:text-[11px]'
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
              <div className='border-l-2 border-blue-50/50 pl-4 py-1 mt-1'>
                <p className='text-[13px] text-gray-700 leading-relaxed font-normal italic opacity-90'>
                  {chunk.summary || <span className='text-gray-300 not-italic font-normal'>Chưa có nội dung tóm tắt cho phân đoạn này.</span>}
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
