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
  ArrowLeft,
  Plus,
  MessageSquare,
  CheckCheck,
  Search,
  Check,
  X,
  PlayCircle
} from 'lucide-react'
import AiSuggestion from './AiSuggestion'
import LearnovaAISection from './LearnovaAISection'
import learnovaLogo from '@/assets/images/logo1.png'
import { LoadingDots } from '@/components/common/Loading/LoadingDots'
import CustomInput from '@/components/common/Input'
import CustomButton from '@/components/common/Button'
import QuillEditor from '@/components/common/Input/QuillEditor'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors, UseFormHandleSubmit } from 'react-hook-form'
import { CreationLessonFormValues } from '@/utils/create-course/curriculum'
import useLoading from '@/hooks/useLoading.hook'
import { AnalysisState } from '@/hooks/useAnalysis.hook'
import { useAuthStore } from '@/stores/useAuth.stores'
import { useVipUpgrade } from '@/contexts/VipUpgradeContext'
import { LessonChunk } from '@/types/ai'
import { toast } from 'sonner'

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
  /** Lifted from parent so analysis persists between steps */
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

  // Derived from injected analysis state
  const analysisData = analysisState.status === 'completed' ? analysisState.data : null
  const isAnalysisLoading = analysisState.status === 'loading' || analysisState.status === 'processing'

  // --- Questions State (Mock) ---
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
    toast.success('Đã thêm câu hỏi (Mock)')
  }

  const handleRemoveQuestion = (chunkId: string, index: number) => {
    setChunkQuestions((prev) => ({
      ...prev,
      [chunkId]: prev[chunkId].filter((_, i) => i !== index)
    }))
  }

  const handleSeek = (startTime: string | null) => {
    const targetVideo = isDetailedView ? detailedVideoRef.current : videoRef.current
    if (!targetVideo || !startTime) return

    // SRT: "00:00:18,831" → strip milliseconds first
    const clean = startTime.split(',')[0].trim()
    const parts = clean.split(':').map(Number)
    let seconds = 0
    if (parts.length === 2) seconds = parts[0] * 60 + parts[1]
    if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2]

    targetVideo.currentTime = seconds
    targetVideo.play()
  }

  const [isVideoLoading, setIsVideoLoading] = useState(true)
  const [activeSubtitle, setActiveSubtitle] = useState<string | null>(null)

  // --- Mock Subtitles Data (Detailed from 0 to 1m25s) ---
  const MOCK_SUBTITLES = [
    { start: 0, end: 3, text: 'Chào mừng bạn đến với Learnova AI!' },
    { start: 4, end: 7, text: 'Trong bài hướng dẫn này, chúng ta sẽ khám phá tính năng phân tích video.' },
    { start: 8, end: 11, text: 'Đầu tiên, hệ thống sẽ tự động quét toàn bộ bài giảng của bạn.' },
    { start: 12, end: 15, text: 'Nó sẽ nhận diện các khái niệm quan trọng nhất.' },
    { start: 16, end: 19, text: 'Sau đó, video được chia thành các phân đoạn nhỏ (chunks).' },
    { start: 20, end: 23, text: 'Giúp học viên dễ dàng theo dõi và nắm bắt kiến thức.' },
    { start: 24, end: 27, text: 'Mỗi phân đoạn sẽ đi kèm với một tóm tắt ngắn gọn.' },
    { start: 28, end: 31, text: 'Bạn cũng có thể tùy chỉnh các tóm tắt này theo ý muốn.' },
    { start: 32, end: 35, text: 'Tính năng này giúp tiết kiệm thời gian biên tập tối đa.' },
    { start: 36, end: 39, text: 'Tiếp theo, hãy cùng nhìn vào phần Câu hỏi ôn luyện.' },
    { start: 40, end: 43, text: 'Learnova AI sẽ gợi ý các câu hỏi dựa trên nội dung video.' },
    { start: 44, end: 47, text: 'Bạn có thể thêm mới hoặc xóa các câu hỏi không cần thiết.' },
    { start: 48, end: 51, text: 'Điều này tăng tính tương tác cực cao trong khóa học.' },
    { start: 52, end: 55, text: 'Học viên sẽ hiểu sâu hơn nhờ các bộ câu hỏi ôn tập này.' },
    { start: 56, end: 59, text: 'Bây giờ, chúng ta hãy xem qua trình biên tập SRT.' },
    { start: 60, end: 63, text: 'Toàn bộ lời thoại (Transcript) được hiển thị đầy đủ.' },
    { start: 64, end: 67, text: 'Bạn có thể chỉnh sửa ngay lập tức nếu AI nhận diện sai từ.' },
    { start: 68, end: 71, text: 'Mọi thay đổi sẽ được đồng bộ trực tiếp lên hệ thống.' },
    { start: 72, end: 75, text: 'Đảm bảo nội dung bài giảng của bạn luôn chuyên nghiệp nhất.' },
    { start: 76, end: 79, text: 'Vừa rồi là cái nhìn tổng quan về hệ thống phân tích.' },
    { start: 80, end: 85, text: 'Cảm ơn bạn đã lựa chọn Learnova AI cho bài giảng của mình!' }
  ]

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const time = e.currentTarget.currentTime
    const sub = MOCK_SUBTITLES.find((s) => time >= s.start && time <= s.end)
    setActiveSubtitle(sub ? sub.text : null)
  }

  const handleMediaLoad = () => {
    setIsVideoLoading(false)
  }

  const [isPiP, setIsPiP] = useState(false)
  const videoContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isDetailedView) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsPiP(!entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    if (videoContainerRef.current) {
      observer.observe(videoContainerRef.current)
    }

    return () => observer.disconnect()
  }, [isDetailedView])

  const chunks: LessonChunk[] = analysisData?.chunks || []

  if (isDetailedView) {
    return (
      <div className='animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 pb-12 relative'>
        {/* Header */}
        <div className='flex items-center justify-between bg-gray-50/90 backdrop-blur-md py-4 z-40 border-b border-gray-200'>
          <div className='flex items-center gap-4'>
            <button
              onClick={() => setIsDetailedView(false)}
              className='p-2 hover:bg-white rounded-full transition-colors text-gray-500 hover:text-blue-600 border border-transparent hover:border-gray-200'
            >
              <ArrowLeft className='w-5 h-5' />
            </button>
            <div>
              <h2 className='text-xl font-bold text-gray-800 flex items-center gap-2'>
                Phân tích chi tiết Learnova AI
                <img src={learnovaLogo} alt='Logo' className='h-5 w-auto object-contain' />
              </h2>
              <p className='text-sm text-gray-500'>Xem và tùy chỉnh nội dung phân đoạn, câu hỏi và SRT</p>
            </div>
          </div>
          <CustomButton
            label='Lưu tất cả thay đổi'
            icon={<CheckCheck className='w-4 h-4 mr-2' />}
            className='bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200'
          />
        </div>

        {/* Video Playback Section */}
        <div ref={videoContainerRef} className='bg-gray-50 pb-4 min-h-[300px]'>
          <div
            className={`transition-all duration-500 ease-in-out ${isPiP
                ? 'fixed bottom-6 right-6 w-80 z-[100] shadow-2xl scale-100'
                : 'relative w-full aspect-video scale-100'
              }`}
          >
            <div className='relative w-full h-full bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-white group'>
              <video
                src={videoSrc || ''}
                ref={detailedVideoRef}
                className='w-full h-full object-contain'
                controls
                onLoadedData={handleMediaLoad}
                onTimeUpdate={handleTimeUpdate}
              />

              {/* PiP Label */}
              {isPiP && (
                <div className='absolute top-2 left-2 bg-blue-600/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 animate-pulse'>
                  Đang xem chế độ thu nhỏ
                </div>
              )}

              {/* Manual Subtitles Overlay */}
              {activeSubtitle && (
                <div
                  className={`absolute left-0 right-0 flex justify-center px-4 z-10 pointer-events-none transition-all ${isPiP ? 'bottom-10' : 'bottom-16'
                    }`}
                >
                  <div
                    className={`bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-center font-medium shadow-lg animate-in slide-in-from-bottom-2 duration-300 ${isPiP ? 'text-[10px] max-w-[90%]' : 'text-sm md:text-base px-4 py-2'
                      }`}
                  >
                    {activeSubtitle}
                  </div>
                </div>
              )}

              {isVideoLoading && (
                <div className='absolute inset-0 flex items-center justify-center bg-gray-900'>
                  <div className='flex flex-col items-center gap-2'>
                    <img src={learnovaLogo} alt='Loading' className='w-12 h-12 object-contain animate-bounce' />
                    <LoadingDots text='Đang tải trình phát...' className='text-blue-400 text-xs' />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chunks & Questions Section */}
        <div className='space-y-6'>
          <h3 className='text-lg font-bold text-gray-800 flex items-center gap-2 px-1'>
            <MessageSquare className='w-5 h-5 text-indigo-500' />
            Danh sách phân đoạn & Câu hỏi tương ứng
          </h3>

          <div className='grid grid-cols-1 gap-6'>
            {chunks.map((chunk, idx) => (
              <div
                key={chunk.id}
                className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow'
              >
                <div className='bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100 flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm'>
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className='font-bold text-gray-800 text-[15px]'>{chunk.title || `Phân đoạn ${idx + 1}`}</h4>
                      <div className='flex items-center gap-3 text-xs text-gray-400 mt-0.5'>
                        <span className='flex items-center gap-1'>
                          Thời gian: <span className='text-indigo-600 font-semibold'>{chunk.timestamp}</span>
                        </span>
                        <button
                          type='button'
                          onClick={() => handleSeek(chunk.startTime)}
                          className='flex items-center gap-1 text-blue-500 hover:text-blue-700 transition-colors'
                        >
                          <PlayCircle className='w-3 h-3' /> Tua tới đây
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='p-6 space-y-6'>
                  {/* Chunk Summary */}
                  <div>
                    <label className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block'>
                      Tóm tắt nội dung
                    </label>
                    <p className='text-gray-700 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 italic'>
                      "{chunk.summary}"
                    </p>
                  </div>

                  {/* Questions Section */}
                  <div className='bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100/50'>
                    <div className='flex items-center justify-between mb-4'>
                      <label className='text-sm font-bold text-indigo-700 flex items-center gap-2'>
                        <Search className='w-4 h-4' />
                        Câu hỏi tự ôn luyện ({chunkQuestions[chunk.id]?.length || 0})
                      </label>
                    </div>

                    <div className='space-y-3'>
                      {(chunkQuestions[chunk.id] || []).map((q, qIndex) => (
                        <div
                          key={qIndex}
                          className='flex items-center gap-3 bg-white p-3 rounded-xl border border-indigo-100 shadow-sm animate-in slide-in-from-left-2 duration-300'
                        >
                          <div className='w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold'>
                            Q{qIndex + 1}
                          </div>
                          <span className='text-sm text-gray-700 flex-1'>{q}</span>
                          <button
                            type='button'
                            onClick={() => handleRemoveQuestion(chunk.id, qIndex)}
                            className='text-gray-400 hover:text-red-500 transition-colors'
                          >
                            <Trash2 className='w-4 h-4' />
                          </button>
                        </div>
                      ))}

                      {/* Add Question Input */}
                      <div className='relative mt-4'>
                        <CustomInput
                          placeholder='Nhập câu hỏi mới cho phân đoạn bài học này...'
                          className='pr-12'
                          value={newQuestionInputs[chunk.id] || ''}
                          onChange={(e) =>
                            setNewQuestionInputs((prev) => ({ ...prev, [chunk.id]: e.target.value }))
                          }
                          onKeyDown={(e) => e.key === 'Enter' && handleAddQuestion(chunk.id)}
                        />
                        <button
                          type='button'
                          onClick={() => handleAddQuestion(chunk.id)}
                          className='absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors'
                        >
                          <Plus className='w-4 h-4' />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SRT Editor Section */}
        <div className='space-y-6 pt-4'>
          <h3 className='text-lg font-bold text-gray-800 flex items-center gap-2 px-1'>
            <AlignLeft className='w-5 h-5 text-blue-500' />
            Biên tập SRT Content (Transcript)
          </h3>
          <div className='bg-white p-6 rounded-3xl border border-gray-100 shadow-xl'>
            <div className='relative min-h-[400px]'>
              <QuillEditor
                initialHtml={chunks.map((c) => `<p>[${c.timestamp}] ${c.summary}</p>`).join('')}
                className='min-h-[400px] text-base leading-loose'
              />
            </div>
            <div className='mt-4 flex items-start gap-3 bg-blue-50 p-4 rounded-2xl border border-blue-100'>
              <ScanEye className='w-5 h-5 text-blue-600 mt-0.5' />
              <p className='text-xs text-blue-700 leading-relaxed'>
                <strong>Lưu ý:</strong> Việc chỉnh sửa SRT Content sẽ ảnh hưởng đến kết quả tìm kiếm và phụ đề hiển thị
                trong khóa học. Hãy đảm bảo nội dung chính xác so với video.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-right-4 duration-300'>
      {/* Left: Mini Preview */}
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

            {/* Media Loading Overlay */}
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

            {/* View Detail Button */}
            <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10'>
              <CustomButton
                type='button'
                onClick={() => window.open(videoSrc || '', '_blank')}
                className='bg-white/90 text-blue-600 hover:bg-white p-2 rounded-full h-8 w-8 flex items-center justify-center shadow-sm backdrop-blur-sm'
                icon={<ExternalLink className='w-4 h-4' />}
                title='Xem chi tiết'
              />
            </div>

            {isUploading && (
              <div className='absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-4'>
                <div className='w-full max-w-[80%] h-2 bg-gray-700 rounded-full overflow-hidden mb-2'>
                  <div
                    className='h-full bg-blue-500 transition-all duration-300'
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className='text-sm font-medium'>Đang tải lên {uploadProgress}%</p>
              </div>
            )}
          </div>
          <div className='mt-3 flex items-center justify-between text-xs text-gray-500'>
            <span className='truncate max-w-[150px]'>{selectedFile?.name}</span>
          </div>
        </div>
      </div>

      {/* Right: Form Fields */}
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

        {/* Options & Visibility */}
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

        {/* LearnovaAI Analysis Section */}
        <LearnovaAISection
          analysisState={analysisState}
          refetchAnalysis={refetchAnalysis}
          onSeek={contentType === 'video' ? handleSeek : undefined}
          onViewDetails={() => setIsDetailedView(true)}
        />

        {/* Action Buttons */}
        <div className='flex justify-end pt-4 gap-3'>
          {handleDelLesson && lessonId && (
            <CustomButton
              type='button'
              label='Xóa bài giảng'
              className='bg-red-500 rounded-xl hover:bg-red-50 border border-red-200 shadow-sm px-6'
              icon={<Trash2 className='w-4 h-4 mr-2' />}
              onClick={async () => {
                await handleDelLesson(lessonId)
                if (handleClose) handleClose(false)
              }}
            />
          )}
          <CustomButton
            type='button'
            label={loading ? 'Đang tải lên...' : contentType === 'video' ? 'Lưu bài giảng' : 'Lưu tài liệu'}
            className={`rounded-xl px-8 shadow-lg shadow-blue-600/20 ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            icon={!isUploading ? <Upload className='w-5 h-5 mr-2' /> : undefined}
            disabled={isUploading}
            isLoader={loading}
            onClick={() => handleUpdateLesson(watch(), startLoading, stopLoading)}
          />
        </div>
      </div>
    </div>
  )
}

export default Step2DetailsForm
