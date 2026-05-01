import React, { useState, useEffect, useRef } from 'react'
import {
  Upload,
  ScanEye,
  Eye,
  Video,
  FileText,
  AlignLeft,
  ExternalLink,
  Trash2,
} from 'lucide-react'
import AiSuggestion from './AiSuggestion'
import LearnovaAISection from './LearnovaAISection'
import learnovaLogo from '@/assets/images/logo1.png'
import { LoadingDots } from '@/components/common/Loading/LoadingDots'
import CustomInput from '@/components/common/Input'
import CustomButton from '@/components/common/Button'
import QuillEditor from '@/components/common/Input/QuillEditor'
import AssistantAnalysisService from '@/services/assistant/analysis.service'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors, UseFormHandleSubmit } from 'react-hook-form'
import { CreationLessonFormValues } from '@/utils/create-course/curriculum'
import useLoading from '@/hooks/useLoading.hook'
import { AnalysisState } from '@/hooks/useAnalysis.hook'
import { LessonChunk } from '@/types/ai'
import { toast } from 'sonner'

import LearnovaDetailedView from './LearnovaAIDetail/LearnovaDetailedView'

interface Step2DetailsFormProps {
  videoSrc: string | null
  selectedFile: File | null
  setStep: (step: 1 | 2) => void
  register: UseFormRegister<CreationLessonFormValues>
  watch: UseFormWatch<CreationLessonFormValues>
  setValue: UseFormSetValue<CreationLessonFormValues>
  errors: FieldErrors<CreationLessonFormValues>
  isUploading?: boolean
  uploadProgress?: number
  handleSubmit: UseFormHandleSubmit<CreationLessonFormValues>
  lessonId?: string
  handleClose?: (value: boolean) => void
  handleUpdateLesson: (data: CreationLessonFormValues, startLoading?: () => void, stopLoading?: () => void) => void
  contentType: 'video' | 'document'
  handleDelLesson?: (lessonId: string) => Promise<void>
  analysisState: AnalysisState
  refetchAnalysis: () => void
}

const Step2DetailsForm: React.FC<Step2DetailsFormProps> = ({
  videoSrc,
  selectedFile,
  setStep,
  register,
  watch,
  setValue,
  errors,
  isUploading,
  uploadProgress = 0,
  handleSubmit,
  lessonId,
  handleClose,
  handleUpdateLesson,
  contentType,
  handleDelLesson,
  analysisState,
  refetchAnalysis
}) => {
  const [isDetailedView, setIsDetailedView] = useState(false)
  const duration = watch('duration')
  const isPublic = watch('isPublic')
  const { loading, startLoading, stopLoading } = useLoading()
  const videoRef = useRef<HTMLVideoElement>(null)
  const detailedVideoRef = useRef<HTMLVideoElement>(null)

  const isAnalysisFailed = analysisState.status === 'failed'
  const analysisData = (analysisState.status === 'completed' || analysisState.status === 'failed') ? (analysisState as any).data : null
  const isAnalysisLoading = analysisState.status === 'loading' || analysisState.status === 'processing'

  const [isVideoLoading, setIsVideoLoading] = useState(true)

  const handleMediaLoad = () => {
    setIsVideoLoading(false)
  }

  const [chunkQuestions, setChunkQuestions] = useState<Record<string, string[]>>({})
  const [newQuestionInputs, setNewQuestionInputs] = useState<Record<string, string>>({})

  const handleAddQuestion = (chunkId: string) => {
    const q = newQuestionInputs[chunkId]?.trim()
    if (!q) return
    setChunkQuestions((prev) => ({
      ...prev,
      [chunkId]: [...(prev[chunkId] || []), q]
    }))
    setNewQuestionInputs((prev) => ({ ...prev, [chunkId]: '' }))
    toast.success('Đã thêm câu hỏi')
  }

  const handleRemoveQuestion = (chunkId: string, index: number) => {
    setChunkQuestions((prev) => ({
      ...prev,
      [chunkId]: prev[chunkId].filter((_, i) => i !== index)
    }))
  }

  const handleSaveChunkSummary = async (chunkId: string, newSummary: string) => {
    try {
      if (analysisState.status === 'completed' && analysisState.data) {
        const res = await AssistantAnalysisService.updateChunkSummary(
          analysisState.data.lessonId,
          chunkId,
          newSummary
        )
        if (res.code === 200) {
          toast.success(res.message || 'Đã cập nhật tóm tắt thành công')
          refetchAnalysis()
        } else {
          throw new Error(res.message)
        }
      }
    } catch (error: any) {
      toast.error(error?.message || 'Không thể cập nhật tóm tắt')
      throw error
    }
  }

  const handleSeek = (startTime: string | null) => {
    // Step-2 main layout uses `videoRef`; full detail view uses `detailedVideoRef`.
    const targetVideo = videoRef.current ?? detailedVideoRef.current
    if (!targetVideo || !startTime) return

    const clean = startTime.split(',')[0].trim()
    const parts = clean.split(':').map(Number)
    let seconds = 0
    if (parts.length === 2) seconds = parts[0] * 60 + parts[1]
    if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2]

    targetVideo.currentTime = seconds
    targetVideo.play()
  }

  const mainWrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (mainWrapperRef.current) {
      mainWrapperRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [isDetailedView])

  const chunks: LessonChunk[] = analysisData?.chunks || []

  if (isDetailedView) {
    return (
      <LearnovaDetailedView
        analysisData={analysisData}
        videoSrc={videoSrc}
        onBack={() => setIsDetailedView(false)}
        detailedVideoRef={detailedVideoRef}
        chunkQuestions={chunkQuestions}
        newQuestionInputs={newQuestionInputs}
        handleAddQuestion={handleAddQuestion}
        handleRemoveQuestion={handleRemoveQuestion}
        setNewQuestionInputs={setNewQuestionInputs}
        handleSeek={handleSeek}
        mainWrapperRef={mainWrapperRef}
        onSaveSummary={handleSaveChunkSummary}
        onAfterExamGenerate={refetchAnalysis}
      />
    )
  }

  return (
    <div ref={mainWrapperRef} className='grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-right-4 duration-300'>
      <div className='lg:col-span-1 space-y-6 sticky top-4 self-start'>
        <div className='bg-white p-4 rounded-2xl shadow-sm border border-gray-100'>
          <h3 className='font-semibold text-gray-700 mb-3 text-sm flex items-center gap-2'>
            {contentType === 'video' ? (
              <Video className='w-4 h-4 text-blue-600' />
            ) : (
              <FileText className='w-4 h-4 text-blue-600' />
            )}
            {contentType === 'video' ? 'Video đã chọn' : 'Tài liệu đã chọn'}
          </h3>
          <div className='relative w-full aspect-video bg-black rounded-lg overflow-hidden group'>
            {contentType === 'video' ? (
              <video
                src={videoSrc || ''}
                ref={videoRef}
                className='w-full h-full object-contain'
                autoPlay
                muted
                controls
                onLoadedData={handleMediaLoad}
              />
            ) : (
              <iframe
                src={videoSrc || ''}
                className='w-full h-full bg-white'
                title='PDF Preview'
                onLoad={handleMediaLoad}
              />
            )}

            {isVideoLoading && !isUploading && (
              <div className='absolute inset-0 flex items-center justify-center bg-gray-50 z-20'>
                <div className='flex flex-col items-center gap-3'>
                  <div className='relative w-12 h-12'>
                    <img src={learnovaLogo} alt='Loading' className='w-full h-full object-contain animate-bounce' />
                  </div>
                  <LoadingDots
                    text={contentType === 'video' ? 'Đang tải video...' : 'Đang tải tài liệu...'}
                    className='text-blue-600 text-xs font-sm'
                  />
                </div>
              </div>
            )}

            <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10'>
              <CustomButton
                type='button'
                onClick={() => window.open(videoSrc || '', '_blank')}
                className='bg-white/90 text-blue-600 hover:bg-white p-2 rounded-full h-8 w-8 flex items-center justify-center shadow-sm backdrop-blur-sm'
                icon={<ExternalLink className='w-4 h-4' />}
              />
            </div>
          </div>
          <div className='mt-3 flex items-center justify-between text-xs text-gray-500'>
            <span className='truncate max-w-[150px]'>{selectedFile?.name}</span>
          </div>
        </div>
      </div>

      <div className='lg:col-span-2 space-y-6'>
        <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6'>
          <div>
            <div className='flex items-center justify-between mb-2'>
              <Label htmlFor='title' className='text-base font-semibold text-gray-700 flex items-center gap-2'>
                <FileText className='w-4 h-4 text-blue-600' />
                {contentType === 'video' ? 'Tiêu đề của video' : 'Tiêu đề tài liệu'}{' '}
                <span className='text-red-500'>*</span>
              </Label>
            </div>
            <CustomInput
              id='title'
              placeholder={contentType === 'video' ? 'Nhập tiêu đề video...' : 'Nhập tiêu đề tài liệu...'}
              className='w-full text-sm'
              {...register('title')}
            />
            {errors.title && <p className='text-red-500 text-sm mt-1'>{errors.title.message}</p>}

            <AiSuggestion
              isLoading={isAnalysisLoading}
              suggestion={analysisData?.suggestedTitle ?? undefined}
              onApply={() => setValue('title', analysisData?.suggestedTitle || '')}
              type='title'
            />
          </div>

          <div>
            <div className='flex items-center justify-between mb-2'>
              <Label htmlFor='content' className='text-base font-semibold text-gray-700 flex items-center gap-2'>
                <AlignLeft className='w-4 h-4 text-blue-600' />
                {contentType === 'video' ? 'Mô tả video' : 'Mô tả tài liệu'}
              </Label>
            </div>
            <div className='min-h-[200px]'>
              <QuillEditor
                initialHtml={watch('content')}
                onChange={(html) => setValue('content', html)}
                className='min-h-[180px] text-sm'
              />
            </div>
            {errors.content && <p className='text-red-500 text-sm mt-1'>{errors.content.message}</p>}

            <AiSuggestion
              isLoading={isAnalysisLoading}
              suggestion={analysisData?.summary ?? undefined}
              onApply={() => setValue('content', analysisData?.summary || '')}
              type='content'
            />
          </div>
        </div>

        {!isAnalysisFailed && (
          <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
            <h3 className='flex items-center gap-2 font-semibold text-base text-gray-700 mb-4'>
              <ScanEye />
              Hiển thị
            </h3>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Eye className='w-5 h-5 text-gray-500' />
                <div>
                  <p className='font-medium text-sm text-gray-700'>Xem trước miễn phí</p>
                  <p className='text-sm text-gray-500'>Cho phép học viên xem thử</p>
                </div>
              </div>
              <Switch checked={isPublic} onCheckedChange={(checked: boolean) => setValue('isPublic', checked)} />
            </div>
          </div>
        )}

        <LearnovaAISection
          analysisState={analysisState}
          refetchAnalysis={refetchAnalysis}
          onSeek={contentType === 'video' ? handleSeek : undefined}
          onViewDetails={() => setIsDetailedView(true)}
        />

        <div className='flex justify-end pt-4 gap-3'>
          {handleDelLesson && lessonId && (
            <CustomButton
              type='button'
              label='Xóa bài'
              variant='ghost'
              className='text-gray-400 hover:text-red-500 hover:bg-red-50 px-4 h-7.5 text-[10.5px] font-bold transition-all'
              icon={<Trash2 className='w-3.5 h-3.5 mr-2' />}
              onClick={async () => {
                await handleDelLesson(lessonId)
                if (handleClose) handleClose(false)
              }}
            />
          )}
          <CustomButton
            type='button'
            label={loading ? 'Đang tải lên...' : isAnalysisFailed ? 'Không thể lưu bài giảng lỗi' : contentType === 'video' ? 'Lưu bài giảng' : 'Lưu tài liệu'}
            className='bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 h-7.5 text-[10.5px] font-bold transition-all shadow-md shadow-blue-100 disabled:bg-gray-300'
            icon={!isUploading ? <Upload className='w-4 h-4 mr-2' /> : undefined}
            disabled={isUploading || loading || isAnalysisFailed}
            isLoader={loading}
            onClick={() => handleUpdateLesson(watch(), startLoading, stopLoading)}
          />
        </div>
      </div>
    </div>
  )
}

export default Step2DetailsForm
