import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import CustomButton from '@/components/common/Button'
import { CreationLessonFormValues, CreationLessonSchema } from '@/utils/create-course/curriculum'
import { HandleAddLesson } from '@/components/TC_CreateCourse/CurriculumForm/index'
import { cn } from '@/lib/utils'
import Step1MediaUpload from './Step1MediaUpload'
import Step2DetailsForm from './Step2DetailsForm'
import Step0TypeSelection from './Step0TypeSelection'

import { MultiUploadItem } from '@/hooks/useMultiUpload'
import { Lesson } from '@/utils/create-course/curriculum'
import lessonService from '@/services/course/lesson.service'
import { toast } from 'sonner'
import useLoading from '@/hooks/useLoading.hook'
import { Upload, ArrowRight, ArrowLeft, X, Trash2 } from 'lucide-react'

interface AddVideoFormProps {
    lessonId?: string
    chapterId: string
    handleAddLesson?: HandleAddLesson
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    uploads?: MultiUploadItem[]
    startUpload?: (file: File, fd: FormData, titlePost: string, uri: string, isCallCallback: boolean) => string
    fetchChapters: () => Promise<void>
    initialData?: Lesson
    mode?: 'create' | 'edit'
    initialType?: 'video' | 'document'
    handleDelLesson?: (lessonId: string) => Promise<void>
}

const AddVideoForm: React.FC<AddVideoFormProps> = ({
    lessonId,
    chapterId,
    handleAddLesson,
    setOpen,
    uploads = [],
    startUpload = () => '',
    fetchChapters,
    initialData,
    mode = 'create',
    initialType = 'video',
    handleDelLesson
}) => {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors }
    } = useForm<CreationLessonFormValues>({
        resolver: yupResolver(CreationLessonSchema) as any,
        defaultValues: {
            isPublic: initialData?.isPublic || false,
            title: initialData?.title || '',
            content: initialData?.content || '',
            duration: initialData?.duration ? Number(initialData.duration) : null
        }
    })

    const { loading, startLoading, stopLoading } = useLoading()
    const [videoSrc, setVideoSrc] = useState<string | null>(initialData?.url || null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [contentType, setContentType] = useState<'video' | 'document'>(mode === 'edit' ? initialType : 'video')
    const [step, setStep] = useState<0 | 1 | 2>(mode === 'edit' ? 2 : 0)

    // Track the upload ID for this specific form instance
    const [currentUploadId, setCurrentUploadId] = useState<string | null>(null)

    // Find the upload item in the list
    const currentUpload = uploads.find(u => u.id === currentUploadId)
    const isUploading = currentUpload?.status === 'uploading'
    const uploadProgress = currentUpload?.progress || 0

    const handleSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            // Validate file type
            if (contentType === 'video' && !file.type.startsWith('video/')) {
                toast.error('Vui lòng chọn file video')
                return
            }
            if (contentType === 'document' && file.type !== 'application/pdf') {
                toast.error('Vui lòng chọn file PDF')
                return
            }

            // Validate file size
            const maxSize = contentType === 'video' ? 500 * 1024 * 1024 : 50 * 1024 * 1024
            if (file.size > maxSize) {
                toast.error(`File quá lớn. Dung lượng tối đa: ${contentType === 'video' ? '500MB' : '50MB'}`)
                return
            }

            const url = URL.createObjectURL(file)
            setVideoSrc(url)
            setSelectedFile(file)
        }
    }

    const handleLoadedMetadata = () => {
        if (!videoRef.current) return
        const seconds = Math.floor(videoRef.current.duration || 0)
        setValue('duration', seconds)
    }

    const handleRemoveFile = () => {
        if (videoSrc) URL.revokeObjectURL(videoSrc)
        setVideoSrc(null)
        setSelectedFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        setValue('duration', null)
    }

    useEffect(() => {
        return () => {
            if (videoSrc && !videoSrc.startsWith('http')) URL.revokeObjectURL(videoSrc)
        }
    }, [videoSrc])

    const handleCloseForm: React.Dispatch<React.SetStateAction<boolean>> = (value) => {
        setOpen(value)
        if (value === false) {
            fetchChapters()
        }
    }

    // Quick save: Upload and close modal
    const handleQuickSave = () => {
        if (!selectedFile) return

        const currentTitle = watch('title')
        const currentContent = watch('content')

        const submitData: CreationLessonFormValues = {
            title: currentTitle || selectedFile.name || 'Bài giảng chưa có tiêu đề',
            content: currentContent || '',
            isPublic: false,
            duration: watch('duration')
        }

        if (handleAddLesson) {
            const uri = contentType === 'video' ? 'learning/lessons/video' : 'learning/lessons/article'
            handleAddLesson(selectedFile, chapterId, handleCloseForm, uri)(submitData)
        }
    }

    // Continue editing: Start upload but keep modal open and move to step 2
    const handleContinueEditing = () => {
        if (!selectedFile) return

        // If already uploading, do nothing else
        if (currentUploadId) {
            setStep(2) // If already uploading, just move to step 2
            return
        }

        const currentTitle = watch('title')
        const currentContent = watch('content')

        const submitData: CreationLessonFormValues = {
            title: currentTitle || selectedFile.name || 'Bài giảng chưa có tiêu đề',
            content: currentContent || '',
            isPublic: false,
            duration: watch('duration')
        }

        // Prepare FormData manually since we are bypassing handleAddLesson's default behavior
        const formData = new FormData()
        formData.append(
            'lesson',
            new Blob(
                [
                    JSON.stringify({
                        title: submitData.title,
                        content: submitData.content,
                        isPublic: submitData.isPublic,
                        duration: submitData.duration,
                        chapterId: chapterId
                    })
                ],
                { type: 'application/json' }
            )
        )
        formData.append('file', selectedFile)

        // Start upload and store ID
        const uri = contentType === 'video' ? 'learning/lessons/video' : 'learning/lessons/article'
        const id = startUpload(selectedFile, formData, submitData.title, uri, false)
        setCurrentUploadId(id)
    }

    // for step 2 - update metadata form
    const handleUpdateLesson = async (data: CreationLessonFormValues, startLoading?: () => void, stopLoading?: () => void) => {
        try {
            startLoading && startLoading()
            const result = await lessonService.updateMetaLesson({
                id: lessonId as string,
                title: data.title,
                content: data.content,
                isPublic: data.isPublic
            })

            if (result && result.code === 200) {
                toast.success('Cập nhật thông tin bài giảng thành công')
                await fetchChapters()
                handleCloseForm(false)
            } else {
                toast.error(result?.message || 'Cập nhật thất bại. Vui lòng thử lại')
            }
        }
        catch (e: any) {
            toast.error('Cập nhật thất bại. Vui lòng thử lại')
        }
        finally {
            stopLoading && stopLoading()
        }
    }

    useEffect(() => {
        if (currentUploadId && currentUpload?.status === 'done' && step === 1) {
            setStep(2)
        }
    }, [currentUploadId, currentUpload?.status, step])

    return (
        <div className="w-full h-full bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
                <button
                    type="button"
                    onClick={() => handleCloseForm(false)}
                    className="text-gray-500 hover:text-gray-800 font-medium text-sm transition-colors flex items-center gap-1"
                >
                    <X className="w-4 h-4" />
                    Hủy
                </button>

                {/* Stepper */}
                <div className="flex items-center gap-4">
                    {/* Step 1: Type Selection */}
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                            step >= 0 ? "bg-black text-white" : "bg-gray-200 text-gray-500"
                        )}>
                            {step > 0 ? "✓" : "1"}
                        </div>
                        <span className={cn(
                            "text-sm font-medium",
                            step >= 0 ? "text-black" : "text-gray-400"
                        )}>Chọn kiểu bài giảng</span>
                    </div>

                    <div className="w-8 h-[1px] bg-gray-200" />

                    {/* Step 2: Upload */}
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                            step >= 1 ? "bg-black text-white" : "bg-gray-200 text-gray-500"
                        )}>
                            {step > 1 ? "✓" : "2"}
                        </div>
                        <span className={cn(
                            "text-sm font-medium",
                            step >= 1 ? "text-black" : "text-gray-400"
                        )}>Tải lên bài giảng</span>
                    </div>

                    <div className="w-8 h-[1px] bg-gray-200" />

                    {/* Step 3: Details */}
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                            step >= 2 ? "bg-black text-white" : "bg-gray-200 text-gray-500"
                        )}>
                            3
                        </div>
                        <span className={cn(
                            "text-sm font-medium",
                            step >= 2 ? "text-black" : "text-gray-400"
                        )}>Thông tin chi tiết</span>
                    </div>
                </div>

                {/* Right Actions - Hide on Step 0 */}
                <div className="flex items-center gap-3">
                    {step === 1 && (
                        <CustomButton
                            label="Lưu và tiếp tục"
                            icon={<ArrowRight className="w-4 h-4 ml-2" />}
                            iconPosition="right"
                            onClick={handleContinueEditing}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-6 py-2 h-9 rounded-lg shadow-sm"
                            disabled={!selectedFile}
                            type="button"
                        />
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto">
                    <form
                        onSubmit={handleSubmit(async (data) => {
                            if (mode === 'edit' && handleUpdateLesson) {
                                await handleUpdateLesson(data)
                                handleCloseForm(false)
                            } else if (handleAddLesson && selectedFile) {
                                const uri = contentType === 'video' ? 'learning/lessons/video' : 'learning/lessons/article'
                                await handleAddLesson(selectedFile, chapterId, handleCloseForm, uri)(data)
                            }
                        })}
                        className="w-full"
                    >
                        {step === 0 && (
                            <Step0TypeSelection
                                onSelectType={(type) => {
                                    setContentType(type)
                                    setStep(1)
                                }}
                            />
                        )}

                        {step === 1 && (
                            <Step1MediaUpload
                                videoSrc={videoSrc}
                                selectedFile={selectedFile}
                                videoRef={videoRef}
                                fileInputRef={fileInputRef}
                                handleSelectFile={handleSelectFile}
                                handleRemoveFile={handleRemoveFile}
                                handleLoadedMetadata={handleLoadedMetadata}
                                setStep={setStep}
                                onQuickSave={handleQuickSave}
                                onContinueEditing={handleContinueEditing}
                                isUploading={isUploading}
                                uploadProgress={uploadProgress}
                                contentType={contentType}
                            />
                        )}

                        {step === 2 && (
                            <Step2DetailsForm
                                lessonId={lessonId}
                                videoSrc={videoSrc}
                                selectedFile={selectedFile}
                                setStep={setStep}
                                register={register}
                                watch={watch}
                                setValue={setValue}
                                errors={errors}
                                isUploading={isUploading}
                                uploadProgress={uploadProgress}
                                handleSubmit={handleSubmit}
                                handleUpdateLesson={handleUpdateLesson}
                                contentType={contentType}
                                handleDelLesson={handleDelLesson}
                            />
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AddVideoForm
