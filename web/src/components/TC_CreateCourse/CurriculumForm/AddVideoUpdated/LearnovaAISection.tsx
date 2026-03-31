import React, { useState } from 'react'
import { Sparkles, Crown, ChevronDown, Brain, FileSearch, Pencil, RefreshCw, AlertCircle, Search } from 'lucide-react'
import learnovaLogo from '@/assets/images/logo1.png'
import CustomButton from '@/components/common/Button'
import ChunkCard from './ChunkCard'
import { LessonChunk } from '@/types/ai'
import { AnalysisState } from '@/hooks/useAnalysis.hook'
import { LoadingDots } from '@/components/common/Loading/LoadingDots'
import AssistantAnalysisService from '@/services/assistant/analysis.service'
import { toast } from 'sonner'

interface LearnovaAISectionProps {
  /** Analysis state lifted from parent (AddVideoForm) */
  analysisState: AnalysisState
  refetchAnalysis?: () => void
  onSeek?: (startTime: string | null) => void
  onViewDetails?: () => void
}

const LearnovaAISection: React.FC<LearnovaAISectionProps> = ({
  analysisState,
  refetchAnalysis,
  onSeek,
  onViewDetails
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [localChunks, setLocalChunks] = useState<LessonChunk[] | null>(null)

  // Use the injected state (no internal hook call)
  const state = analysisState
  const refetch = refetchAnalysis ?? (() => { })

  // Decide which chunks to display: local edits > API data
  const apiChunks = state.status === 'completed' ? state.data.chunks : null
  const chunks: LessonChunk[] = localChunks ?? apiChunks ?? []

  const summary = state.status === 'completed' ? state.data.summary : null
  const suggestedTitle = state.status === 'completed' ? state.data.suggestedTitle : null

  const handleSaveSummary = async (id: string, newSummary: string) => {
    try {
      // Note: API is only called if we have a real lessonId from the state
      if (state.status === 'completed' && state.data) {
        const data = await AssistantAnalysisService.updateChunkSummary(state.data.lessonId, id, newSummary)

        if (data.code !== 200) {
          throw new Error(data?.message || 'Không thể cập nhật tóm tắt')
        }

        toast.success(data.message || 'Đã cập nhật tóm tắt')

        // Update local state ONLY on success
        const base = localChunks ?? apiChunks ?? []
        setLocalChunks(base.map((c) => (c.id === id ? { ...c, summary: newSummary } : c)))
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Cập nhật thất bại, vui lòng thử lại sau'
      toast.error(msg)
      throw error // rethrow to stop ChunkCard loading spinner
    }
  }

  // ── Loading / Error states ─────────────────────────────────────────────

  const renderBody = () => {

    // loading / processing / not_found — unified info block
    const infoMap = {
      idle: { icon: <RefreshCw className='w-4 h-4 animate-spin text-blue-500' />, message: 'Đang tải…' },
      loading: { icon: <RefreshCw className='w-4 h-4 animate-spin text-blue-500' />, message: 'Đang tải…' },
      processing: {
        icon: <RefreshCw className='w-4 h-4 animate-spin text-indigo-500' />,
        message: state.status === 'processing' ? state.message : ''
      },
      not_found: {
        icon: <AlertCircle className='w-5 h-5 text-yellow-500' />,
        message: state.status === 'not_found' ? state.message : ''
      }
    } as const

    if (state.status in infoMap) {
      const { icon, message } = infoMap[state.status as keyof typeof infoMap]
      return (
        <div className='flex items-center justify-center gap-3 py-10 text-sm text-gray-500'>
          {icon}
          <span>{message}</span>
        </div>
      )
    }

    if (state.status === 'error') {
      return (
        <div className='flex flex-col items-center justify-center gap-3 py-10 text-sm'>
          <AlertCircle className='w-5 h-5 text-red-400' />
          <p className='text-gray-500 text-center'>{state.message}</p>
          <CustomButton
            type='button'
            label='Thử lại'
            icon={<RefreshCw className='w-3.5 h-3.5' />}
            className='bg-blue-600 text-white rounded-lg px-4 h-8 text-xs'
            onClick={refetch}
          />
        </div>
      )
    }

    // completed or showing mock
    return (
      <div className='p-4 space-y-3'>
        {/* Summary banner */}
        {summary && (
          <div className='bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 space-y-1'>
            <div className='flex items-center gap-1.5 text-xs font-semibold text-blue-700 uppercase tracking-wide'>
              <Brain className='w-3.5 h-3.5' />
              Tóm tắt tổng thể
            </div>
            <p className='text-sm text-blue-900 leading-relaxed'>{summary}</p>
            {suggestedTitle && (
              <p className='text-xs text-blue-600 font-medium'>
                💡 Gợi ý tiêu đề: <span className='italic'>{suggestedTitle}</span>
              </p>
            )}
          </div>
        )}

        {/* Info banner */}
        <div className='flex items-start gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-100 px-3 py-2 rounded-lg'>
          <FileSearch className='w-3.5 h-3.5 mt-0.5 flex-shrink-0' />
          <span>
            Learnova AI đã chia nội dung thành <strong>{chunks.length} phân đoạn</strong> ngữ nghĩa. Nhấn{' '}
            <Pencil className='w-3 h-3 inline mx-0.5' /> để chỉnh sửa tóm tắt nếu có sai sót.
          </span>
        </div>

        {/* Chunk cards */}
        {chunks.map((chunk) => (
          <ChunkCard key={chunk.id} chunk={chunk} onSaveSummary={handleSaveSummary} onSeek={onSeek} />
        ))}

        {/* View Detail Button - Bottom of completed view */}
        {onViewDetails && (
          <div className='pt-2 flex justify-center'>
            <CustomButton
              type='button'
              label='Xem phân tích chi tiết'
              icon={<Search className='w-4 h-4 mr-2' />}
              className='bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 rounded-xl px-6 py-2 h-10 text-sm font-medium transition-all shadow-sm'
              onClick={onViewDetails}
            />
          </div>
        )}
      </div>
    )
  }

  const chunkCount = chunks.length

  return (
    <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300'>
      {/* Header */}
      <div
        className='flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 cursor-pointer group'
        onClick={() => setIsCollapsed((v) => !v)}
      >
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors'>
            <Brain className='w-4 h-4 text-white' />
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <h3 className='text-white font-semibold text-sm tracking-wide'>Phân tích từ</h3>
              <img src={learnovaLogo} alt='Learnova AI' className='h-4 w-auto object-contain brightness-0 invert' />
            </div>
            <p className='text-blue-100 text-xs mt-0.5'>
              {state.status === 'completed' ? (
                `${chunkCount} phân đoạn đã được phân tích`
              ) : state.status === 'loading' || state.status === 'processing' ? (
                <LoadingDots text='Đang xử lý' className='text-blue-100 text-xs' />
              ) : state.status === 'idle' ? (
                `Chưa có dữ liệu`
              ) : (
                '—'
              )}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-3'>

          <ChevronDown
            className={`w-5 h-5 text-white/70 transition-transform duration-300 ease-in-out ${isCollapsed ? 'rotate-0' : 'rotate-180'
              }`}
          />
        </div>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${isCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'
          }`}
      >
        <div className='overflow-hidden'>{renderBody()}</div>
      </div>
    </div>
  )
}

export default LearnovaAISection
