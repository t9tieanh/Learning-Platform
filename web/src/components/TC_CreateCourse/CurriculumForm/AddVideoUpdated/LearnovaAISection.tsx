import React, { useState } from 'react'
import { Sparkles, ChevronDown, Brain, FileSearch, RefreshCw, AlertCircle, Search } from 'lucide-react'
import learnovaLogo from '@/assets/images/logo1.png'
import CustomButton from '@/components/common/Button'
import ChunkCard from './ChunkCard'
import { LessonChunk } from '@/types/ai'
import { AnalysisState } from '@/hooks/useAnalysis.hook'
import { LoadingDots } from '@/components/common/Loading/LoadingDots'
import AssistantAnalysisService from '@/services/assistant/analysis.service'
import { toast } from 'sonner'

interface LearnovaAISectionProps {
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

  const state = analysisState
  const refetch = refetchAnalysis ?? (() => { })

  const apiChunks = state.status === 'completed' ? state.data.chunks : null
  const chunks: LessonChunk[] = localChunks ?? apiChunks ?? []

  const summary = state.status === 'completed' ? state.data.summary : null
  const suggestedTitle = state.status === 'completed' ? state.data.suggestedTitle : null

  const handleSaveSummary = async (id: string, newSummary: string) => {
    try {
      if (state.status === 'completed' && state.data) {
        const data = await AssistantAnalysisService.updateChunkSummary(state.data.lessonId, id, newSummary)

        if (data.code !== 200) {
          throw new Error(data?.message || 'Không thể cập nhật tóm tắt')
        }

        toast.success(data.message || 'Đã cập nhật tóm tắt')

        const base = localChunks ?? apiChunks ?? []
        setLocalChunks(base.map((c) => (c.id === id ? { ...c, summary: newSummary } : c)))
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Cập nhật thất bại, vui lòng thử lại sau'
      toast.error(msg)
      throw error
    }
  }

  const renderBody = () => {
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
        <div className='flex flex-col items-center justify-center gap-4 py-12 px-6 text-sm bg-red-50/20'>
          <div className='p-2.5 bg-white rounded-xl shadow-sm border border-red-100'>
            <AlertCircle className='w-5 h-5 text-red-500' />
          </div>
          <div className='text-center space-y-1'>
            <p className='text-gray-900 font-bold text-sm'>Đã xảy ra lỗi</p>
            <p className='text-gray-500 max-w-[200px] leading-relaxed text-xs'>{state.message}</p>
          </div>
          <CustomButton
            type='button'
            label='Thử lại ngay'
            variant='outline'
            icon={<RefreshCw className='w-3 h-3' />}
            className='bg-white text-red-600 border-red-200 hover:bg-red-50 rounded-lg px-4 h-8 text-[11px] font-bold transition-all'
            onClick={refetch}
          />
        </div>
      )
    }

    return (
      <div className='p-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-500'>
        {summary && (
          <div className='bg-gradient-to-br from-blue-100/50 to-cyan-100/50 border border-blue-200/40 rounded-2xl p-6 space-y-4 shadow-md shadow-blue-100/20'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2.5 text-[10px] font-black text-blue-700 uppercase tracking-[0.15em]'>
                <div className='p-1.5 bg-white rounded-lg shadow-sm border border-blue-50'>
                  <Brain className='w-3.5 h-3.5 text-blue-600' />
                </div>
                AI Tóm tắt nội dung
              </div>
              {suggestedTitle && (
                <div className='bg-white/90 backdrop-blur-sm text-amber-700 text-[9px] font-black px-2.5 py-1 rounded-lg border border-amber-200/50 flex items-center gap-1.5 uppercase tracking-wider shadow-sm'>
                  <Sparkles className='w-2.5 h-2.5 shrink-0' /> Gợi ý tiêu đề
                </div>
              )}
            </div>
            <p className='text-[13px] text-gray-800 leading-relaxed font-bold italic px-1'>
              "{summary}"
            </p>
          </div>
        )}

        <div className='flex items-center gap-3 text-xs text-gray-400 bg-gray-50/50 px-4 py-2.5 rounded-xl border border-gray-100'>
          <FileSearch className='w-3.5 h-3.5 text-blue-500' />
          <span className='font-bold'>
            {chunks.length} phân đoạn kiến thức
          </span>
        </div>

        <div className='space-y-4'>
          {chunks.map((chunk) => (
            <ChunkCard key={chunk.id} chunk={chunk} onSaveSummary={handleSaveSummary} onSeek={onSeek} />
          ))}
        </div>

        {onViewDetails && (
          <div className='pt-2 flex justify-center'>
            <CustomButton
              type='button'
              label='Tùy chỉnh & Xem chi tiết Quiz'
              icon={<Search className='w-3.5 h-3.5 mr-2' />}
              className='bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 h-9 text-xs font-bold transition-all shadow-md shadow-blue-100 active:scale-95'
              onClick={onViewDetails}
            />
          </div>
        )}
      </div>
    )
  }

  const chunkCount = chunks.length

  return (
    <div className='bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md'>
      <div
        className='flex items-center justify-between px-6 py-4 bg-gray-50/80 border-b border-gray-100 cursor-pointer group hover:bg-gray-50 transition-colors'
        onClick={() => setIsCollapsed((v) => !v)}
      >
        <div className='flex items-center gap-4'>
          <div className='w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100'>
            <Brain className='w-4.5 h-4.5' />
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <h3 className='text-gray-900 font-bold text-sm tracking-tight'>Trí tuệ nhân tạo</h3>
              <img src={learnovaLogo} alt='Learnova AI' className='h-3 w-auto object-contain brightness-0' />
            </div>
            <div className='flex items-center gap-2 mt-0.5'>
              <span className='w-1 h-1 rounded-full bg-blue-500'></span>
              <p className='text-gray-400 text-[10px] font-bold uppercase tracking-widest'>
                {state.status === 'completed' ? (
                  `${chunkCount} phân đoạn bài học`
                ) : state.status === 'loading' || state.status === 'processing' ? (
                  'Đang xử lý nội dung...'
                ) : (
                  'Chưa có dữ liệu'
                )}
              </p>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <div className={`p-1 rounded-full border border-gray-200 transition-all duration-300 ${isCollapsed ? '' : 'bg-white'}`}>
            <ChevronDown
              className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 ${isCollapsed ? 'rotate-0' : 'rotate-180'
                }`}
            />
          </div>
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
