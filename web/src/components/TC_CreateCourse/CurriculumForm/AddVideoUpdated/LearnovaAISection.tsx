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
    // Trạng thái tải dữ liệu
    const infoMap = {
      idle: { icon: <RefreshCw className='w-4 h-4 animate-spin text-blue-500' />, message: 'Đang khởi tạo...' },
      loading: { icon: <RefreshCw className='w-4 h-4 animate-spin text-blue-500' />, message: 'Đang tải dữ liệu phân tích...' },
      processing: {
        icon: <RefreshCw className='w-4 h-4 animate-spin text-indigo-500' />,
        message: state.status === 'processing' ? state.message : 'Đang xử lý nội dung...'
      },
      not_found: {
        icon: <AlertCircle className='w-5 h-5 text-amber-500' />,
        message: state.status === 'not_found' ? state.message : 'Không tìm thấy dữ liệu phân tích.'
      }
    } as const

    if (state.status in infoMap) {
      const { icon, message } = infoMap[state.status as keyof typeof infoMap]
      return (
        <div className='flex flex-col items-center justify-center gap-4 py-12 text-sm text-gray-400 animate-pulse'>
          <div className='p-3 bg-gray-50 rounded-2xl shadow-inner'>{icon}</div>
          <span className='font-medium'>{message}</span>
        </div>
      )
    }

    if (state.status === 'error') {
      return (
        <div className='flex flex-col items-center justify-center gap-5 py-12 px-6 text-sm bg-red-50/30'>
          <div className='p-3 bg-white rounded-2xl shadow-sm border border-red-100'>
            <AlertCircle className='w-6 h-6 text-red-500' />
          </div>
          <div className='text-center space-y-1'>
            <p className='text-gray-900 font-bold'>Đã xảy ra lỗi</p>
            <p className='text-gray-500 max-w-[200px] leading-relaxed'>{state.message}</p>
          </div>
          <CustomButton
            type='button'
            label='Thử lại ngay'
            variant='outline'
            icon={<RefreshCw className='w-3.5 h-3.5' />}
            className='bg-white text-red-600 border-red-100 hover:bg-red-50 rounded-xl px-5 h-10 text-xs font-bold transition-all shadow-sm'
            onClick={refetch}
          />
        </div>
      )
    }

    // completed or showing mock
    return (
      <div className='p-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-500'>
        {/* Tóm tắt tổng thể - Modern Card */}
        {summary && (
          <div className='relative group'>
            <div className='absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000'></div>
            <div className='relative bg-white border border-blue-50 rounded-2xl p-5 shadow-sm space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.1em]'>
                  <div className='p-1 bg-blue-600 rounded-md shadow-lg shadow-blue-100'>
                    <Brain className='w-3 h-3 text-white' />
                  </div>
                  Trí tuệ nhân tạo tóm tắt
                </div>
                {suggestedTitle && (
                  <div className='bg-amber-50 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-100 flex items-center gap-1 uppercase tracking-wider'>
                    <Sparkles className='w-2.5 h-2.5 shrink-0' /> Gợi ý tiêu đề
                  </div>
                )}
              </div>
              <p className='text-[14px] text-gray-700 leading-relaxed font-medium italic px-1'>
                "{summary}"
              </p>
              {suggestedTitle && (
                <div className='pt-1 px-1'>
                  <p className='text-xs text-gray-400 font-medium'>
                    💡 Bạn có thể đặt tên cho bài học là: <span className='text-blue-600 font-bold'>"{suggestedTitle}"</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info banner - Minimalist */}
        <div className='flex items-center gap-3 text-xs text-gray-500 bg-gray-50/80 px-4 py-3 rounded-xl border border-gray-100 transition-colors hover:bg-gray-50'>
          <div className='p-1.5 bg-white rounded-lg shadow-sm border border-gray-100'>
            <FileSearch className='w-3.5 h-3.5 text-blue-500' />
          </div>
          <span className='font-medium'>
            Nội dung được chia thành <strong className='text-gray-900'>{chunks.length} phân đoạn</strong> thông minh.
          </span>
        </div>

        {/* Chunk cards - Vertical list */}
        <div className='space-y-4'>
          {chunks.map((chunk) => (
            <ChunkCard key={chunk.id} chunk={chunk} onSaveSummary={handleSaveSummary} onSeek={onSeek} />
          ))}
        </div>

        {/* View Detail Button - Premium CTA */}
        {onViewDetails && (
          <div className='pt-2 flex justify-center'>
            <CustomButton
              type='button'
              label='Tùy chỉnh & Xem chi tiết phân tích'
              icon={<Search className='w-4 h-4 mr-2' />}
              className='bg-white text-blue-600 hover:bg-blue-600 hover:text-white border-2 border-blue-50 hover:border-blue-600 rounded-2xl px-10 py-3 h-12 text-sm font-black transition-all shadow-xl shadow-blue-100/50 hover:shadow-blue-200 active:scale-95'
              onClick={onViewDetails}
            />
          </div>
        )}
      </div>
    )
  }

  const chunkCount = chunks.length

  return (
    <div className='bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)]'>
      {/* Header - Cleaner Gradient */}
      <div
        className='flex items-center justify-between px-6 py-5 bg-gradient-to-br from-gray-900 to-slate-800 cursor-pointer group relative overflow-hidden'
        onClick={() => setIsCollapsed((v) => !v)}
      >
        {/* Subtle background decoration */}
        <div className='absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-10 -mt-10'></div>

        <div className='flex items-center gap-4 relative z-10'>
          <div className='w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all duration-300 shadow-lg shadow-black/20'>
            <Brain className='w-5 h-5 text-white' />
          </div>
          <div>
            <div className='flex items-center gap-2.5'>
              <h3 className='text-white font-bold text-[15px] tracking-tight'>Tóm tắt nội dung bởi</h3>
              <img src={learnovaLogo} alt='Learnova AI' className='h-4 w-auto object-contain brightness-0 invert' />
            </div>
            <div className='flex items-center gap-2 mt-1'>
              <span className='w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse'></span>
              <p className='text-gray-400 text-[11px] font-bold uppercase tracking-[0.05em]'>
                {state.status === 'completed' ? (
                  `${chunkCount} phân đoạn kiến thức`
                ) : state.status === 'loading' || state.status === 'processing' ? (
                  <LoadingDots text='Đang xử lý nội dung' className='text-blue-300 text-[11px]' />
                ) : (
                  'Chưa có dữ liệu phân tích'
                )}
              </p>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-3 relative z-10'>
          <div className={`p-1.5 rounded-full bg-white/10 border border-white/10 transition-all duration-300 ${isCollapsed ? '' : 'bg-white/20'}`}>
            <ChevronDown
              className={`w-4 h-4 text-white transition-transform duration-500 ease-in-out ${isCollapsed ? 'rotate-0' : 'rotate-180'
                }`}
            />
          </div>
        </div>
      </div>

      <div
        className={`grid transition-all duration-500 ease-in-out ${isCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'
          }`}
      >
        <div className='overflow-hidden bg-white/50 backdrop-blur-sm'>{renderBody()}</div>
      </div>
    </div>
  )
}

export default LearnovaAISection
