import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import CustomButton from '@/components/common/Button'
import { CreationLessonFormValues, CreationLessonSchema } from '@/utils/create-course/curriculum'
import { HandleAddLesson } from '@/components/TC_CreateCourse/CurriculumForm/index'
import { cn } from '@/lib/utils'
import Step1MediaUpload from './Step1MediaUpload'
import Step2DetailsForm from './Step2DetailsForm'

import { MultiUploadItem } from '@/hooks/useMultiUpload'

interface AddVideoFormProps {
    chapterId: string
    handleAddLesson: HandleAddLesson
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    uploads: MultiUploadItem[]
    startUpload: (file: File, fd: FormData, titlePost: string, uri: string) => string
}

const AddVideoForm: React.FC<AddVideoFormProps> = ({ chapterId, handleAddLesson, setOpen, uploads, startUpload }) => {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors }
    } = useForm<CreationLessonFormValues>({
        resolver: yupResolver(CreationLessonSchema) as any,
        defaultValues: {
            isPublic: false,
            title: '',
            content: ''
        }
    })

    const [videoSrc, setVideoSrc] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    // Track the upload ID for this specific form instance
    const [currentUploadId, setCurrentUploadId] = useState<string | null>(null)

    // Find the upload item in the list
    const currentUpload = uploads.find(u => u.id === currentUploadId)
    const isUploading = currentUpload?.status === 'uploading'
    const uploadProgress = currentUpload?.progress || 0

    const handleSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
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
            if (videoSrc) URL.revokeObjectURL(videoSrc)
        }
    }, [videoSrc])

    const [step, setStep] = useState<1 | 2>(1)

    // Quick save: Upload and close modal
    const handleQuickSave = () => {
        if (!selectedFile) return

        const currentTitle = watch('title')
        const currentContent = watch('content')

        const submitData: CreationLessonFormValues = {
            title: currentTitle || 'Bài giảng chưa có tiêu đề',
            content: currentContent || '',
            isPublic: false,
            duration: watch('duration')
        }

        handleAddLesson(selectedFile, chapterId, setOpen, 'learning/lessons/video')(submitData)
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
            title: currentTitle || 'Bài giảng chưa có tiêu đề',
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
        const id = startUpload(selectedFile, formData, submitData.title, 'learning/lessons/video')
        setCurrentUploadId(id)
    }

    // When upload finishes, we might want to do something?
    // The user said "tải xong mới chuyển qua step 2" (finish upload then move to step 2)
    // BUT also "vẫn hiển thị form và form chuyển qua hiển thị progress... tải xong mới chuyển qua step 2"
    // Wait, if we are showing progress, we are likely IN step 2 or a special progress step.
    // My previous interpretation was: Step 1 -> Click Continue -> Step 2 (with progress bar) -> Upload finishes -> Enable Save.

    // Let's stick to: Click Continue -> Go to Step 2 -> Show Progress in Step 2 -> When done, enable Save.

    // However, if the user meant "Stay on Step 1 showing progress, THEN go to Step 2", I should adjust.
    // "form chuyển qua hiển thị progress tải lên video đó. tải xong mới chuyển qua step 2"
    // This literally means: Form switches to show upload progress. Upload done -> Move to Step 2.

    // So: Step 1 -> Click Continue -> Show Progress (in Step 1 or special view) -> Upload Done -> Step 2.

    // Let's modify Step 1 to show progress if uploading.
    // And use an effect to move to Step 2 when upload is done.

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
                    onClick={() => setOpen(false)}
                    className="text-gray-500 hover:text-gray-800 font-medium text-sm transition-colors"
                >
                    Cancel
                </button>

                {/* Stepper */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                            step >= 1 ? "bg-black text-white" : "bg-gray-200 text-gray-500"
                        )}>
                            {step > 1 ? "✓" : "1"}
                        </div>
                        <span className={cn(
                            "text-sm font-medium",
                            step >= 1 ? "text-black" : "text-gray-400"
                        )}>Upload Video</span>
                    </div>

                    <div className="w-12 h-[1px] bg-gray-200" />

                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                            step >= 2 ? "bg-black text-white" : "bg-gray-200 text-gray-500"
                        )}>
                            2
                        </div>
                        <span className={cn(
                            "text-sm font-medium",
                            step >= 2 ? "text-black" : "text-gray-400"
                        )}>Details</span>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    {step === 2 && (
                        <CustomButton
                            label="Back"
                            onClick={() => setStep(1)}
                            className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm px-4 py-2 h-9 rounded-lg"
                            disabled={isUploading}
                            type="button"
                        />
                    )}
                    {step === 1 ? (
                        <CustomButton
                            label="Next"
                            onClick={handleContinueEditing}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-6 py-2 h-9 rounded-lg shadow-sm"
                            disabled={!selectedFile}
                            type="button"
                        />
                    ) : (
                        <CustomButton
                            label={isUploading ? "Uploading..." : "Save"}
                            onClick={handleSubmit(handleAddLesson(selectedFile as File, chapterId, setOpen, 'learning/lessons/video'))}
                            className={cn(
                                "text-white text-sm px-6 py-2 h-9 rounded-lg shadow-sm",
                                isUploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                            )}
                            disabled={isUploading}
                            type="submit"
                        />
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto">
                    <form
                        onSubmit={handleSubmit(handleAddLesson(selectedFile as File, chapterId, setOpen, 'learning/lessons/video'))}
                        className="w-full"
                    >
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
                            />
                        )}

                        {step === 2 && (
                            <Step2DetailsForm
                                videoSrc={videoSrc}
                                selectedFile={selectedFile}
                                setStep={setStep}
                                register={register}
                                watch={watch}
                                setValue={setValue}
                                errors={errors}
                                isUploading={isUploading}
                                uploadProgress={uploadProgress}
                            />
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AddVideoForm
