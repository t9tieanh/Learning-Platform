import React, { useState, useEffect } from 'react'
import { Upload, ScanEye, Eye, Video, FileText, AlignLeft, ExternalLink, Trash2 } from 'lucide-react'
import { fetchMockAiSuggestions } from './mock/aiSuggestions'
import AiSuggestion from './AiSuggestion'
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
    handleClose?: (value: boolean) => void,
    handleUpdateLesson: (data: CreationLessonFormValues, startLoading?: () => void, stopLoading?: () => void) => void
    contentType: 'video' | 'document'
    handleDelLesson?: (lessonId: string) => Promise<void>
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
    handleDelLesson
}) => {
    const duration = watch('duration')
    const isPublic = watch('isPublic')
    const { loading, startLoading, stopLoading } = useLoading()

    const formatDuration = (seconds: number) => {
        if (!seconds || seconds <= 0) return '0:00'
        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        if (hrs > 0) return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
        return `${mins}:${String(secs).padStart(2, '0')}`
    }

    const [suggestions, setSuggestions] = useState<{ title: string; content: string } | null>(null)
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
    const [isVideoLoading, setIsVideoLoading] = useState(true)

    useEffect(() => {
        setIsVideoLoading(true)
    }, [videoSrc])

    const handleMediaLoad = () => {
        setIsVideoLoading(false)
    }

    useEffect(() => {
        const loadSuggestions = async () => {
            setIsLoadingSuggestions(true)
            try {
                const data = await fetchMockAiSuggestions()
                setSuggestions(data)
            } catch (error) {
                console.error("Failed to load AI suggestions", error)
            } finally {
                setIsLoadingSuggestions(false)
            }
        }
        loadSuggestions()
    }, [])

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Left: Mini Preview */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-700 mb-3 text-sm flex items-center gap-2">
                        {contentType === 'video' ? <Video className="w-4 h-4 text-blue-600" /> : <FileText className="w-4 h-4 text-blue-600" />}
                        {contentType === 'video' ? 'Video đã chọn' : 'Tài liệu đã chọn'}
                    </h3>
                    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group">
                        {contentType === 'video' ? (
                            <video
                                src={videoSrc || ''}
                                className="w-full h-full object-contain"
                                autoPlay
                                muted
                                controls
                                onLoadedData={handleMediaLoad}
                            />
                        ) : (
                            <iframe
                                src={videoSrc || ''}
                                className="w-full h-full bg-white"
                                title="PDF Preview"
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
                                    <LoadingDots text={contentType === 'video' ? 'Đang tải video...' : 'Đang tải tài liệu...'} className='text-blue-600 text-xs font-sm' />
                                </div>
                            </div>
                        )}

                        {/* View Detail Button */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <CustomButton
                                type="button"
                                onClick={() => window.open(videoSrc || '', '_blank')}
                                className="bg-white/90 text-blue-600 hover:bg-white p-2 rounded-full h-8 w-8 flex items-center justify-center shadow-sm backdrop-blur-sm"
                                icon={<ExternalLink className="w-4 h-4" />}
                                title="Xem chi tiết"
                            />
                        </div>

                        {isUploading && (
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-4">
                                <div className="w-full max-w-[80%] h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
                                    <div
                                        className="h-full bg-blue-500 transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                                <p className="text-sm font-medium">Đang tải lên {uploadProgress}%</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <span className="truncate max-w-[150px]">{selectedFile?.name}</span>
                    </div>
                </div>
            </div>

            {/* Right: Form Fields */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label htmlFor="title" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-600" />
                                {contentType === 'video' ? 'Tiêu đề của video' : 'Tiêu đề tài liệu'} <span className="text-red-500">*</span>
                            </Label>
                        </div>
                        <CustomInput
                            id="title"
                            placeholder={contentType === 'video' ? "Nhập tiêu đề video..." : "Nhập tiêu đề tài liệu..."}
                            className="w-full text-sm"
                            {...register('title')}
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}

                        {/* AI Suggestion for Title */}
                        <AiSuggestion
                            isLoading={isLoadingSuggestions}
                            suggestion={suggestions?.title}
                            onApply={() => setValue('title', suggestions?.title || '')}
                            type="title"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label htmlFor="content" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                                <AlignLeft className="w-4 h-4 text-blue-600" />
                                {contentType === 'video' ? 'Mô tả video' : 'Mô tả tài liệu'}
                            </Label>
                        </div>
                        <div className="min-h-[200px]">
                            <QuillEditor
                                initialHtml={watch('content')}
                                onChange={(html) => setValue('content', html)}
                                className="min-h-[180px] text-sm"
                            />
                        </div>
                        {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}

                        {/* AI Suggestion for Content */}
                        <AiSuggestion
                            isLoading={isLoadingSuggestions}
                            suggestion={suggestions?.content}
                            onApply={() => setValue('content', suggestions?.content || '')}
                            type="content"
                        />
                    </div>
                </div>

                {/* Options & Visibility */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="flex items-center gap-2 font-semibold text-base text-gray-700 mb-4"><ScanEye />Hiển thị</h3>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Eye className="w-5 h-5 text-gray-500" />
                            <div>
                                <p className="font-medium text-sm text-gray-700">Xem trước miễn phí</p>
                                <p className="text-sm text-gray-500">Cho phép học viên xem thử</p>
                            </div>
                        </div>
                        <Switch
                            checked={isPublic}
                            onCheckedChange={(checked: boolean) => setValue('isPublic', checked)}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end pt-4 gap-3">
                    {handleDelLesson && lessonId && (
                        <CustomButton
                            type="button"
                            label="Xóa bài giảng"
                            className="bg-red-500 rounded-xl hover:bg-red-50 border border-red-200 shadow-sm px-6"
                            icon={<Trash2 className="w-4 h-4 mr-2" />}
                            onClick={async () => {
                                await handleDelLesson(lessonId)
                                if (handleClose) handleClose(false)
                            }}
                        />
                    )}
                    <CustomButton
                        type="button"
                        label={loading ? "Đang tải lên..." : (contentType === 'video' ? "Lưu bài giảng" : "Lưu tài liệu")}
                        className={`rounded-xl px-8 shadow-lg shadow-blue-600/20 ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                        icon={!isUploading ? <Upload className="w-5 h-5 mr-2" /> : undefined}
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
