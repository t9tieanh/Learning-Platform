import React from 'react'
import { Upload, Clock, Eye } from 'lucide-react'
import CustomInput from '@/components/common/Input'
import CustomButton from '@/components/common/Button'
import QuillEditor from '@/components/common/Input/QuillEditor'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form'
import { CreationLessonFormValues } from '@/utils/create-course/curriculum'

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
    uploadProgress = 0
}) => {
    const duration = watch('duration')
    const isPublic = watch('isPublic')

    const formatDuration = (seconds: number) => {
        if (!seconds || seconds <= 0) return '0:00'
        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        if (hrs > 0) return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
        return `${mins}:${String(secs).padStart(2, '0')}`
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Left: Mini Preview */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-700 mb-3 text-sm">Video đã chọn</h3>
                    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                        <video
                            src={videoSrc || ''}
                            className="w-full h-full object-contain"
                        />
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
                        {!isUploading && (
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-blue-600 hover:underline"
                            >
                                Thay đổi
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Right: Form Fields */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label htmlFor="title" className="text-base font-semibold text-gray-700">
                                Tiêu đề của video <span className="text-red-500">*</span>
                            </Label>
                        </div>
                        <CustomInput
                            id="title"
                            placeholder="Nhập tiêu đề video..."
                            className="w-full text-sm"
                            {...register('title')}
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label htmlFor="content" className="text-base font-semibold text-gray-700">
                                Mô tả video
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
                    </div>
                </div>

                {/* Options & Visibility */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-700 mb-4">Tùy chọn</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Clock className="w-5 h-5" />
                                    <span>Thời lượng</span>
                                </div>
                                <span className="font-medium text-gray-800">
                                    {duration ? formatDuration(duration) : '--:--'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-700 mb-4">Hiển thị</h3>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Eye className="w-5 h-5 text-gray-500" />
                                <div>
                                    <p className="font-medium text-gray-700">Xem trước miễn phí</p>
                                    <p className="text-xs text-gray-500">Cho phép học viên xem thử</p>
                                </div>
                            </div>
                            <Switch
                                checked={isPublic}
                                onCheckedChange={(checked: boolean) => setValue('isPublic', checked)}
                            />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between pt-4">
                    <CustomButton
                        type="button"
                        label="Quay lại"
                        className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 bg-white"
                        onClick={() => setStep(1)}
                        disabled={isUploading}
                    />
                    <CustomButton
                        type="submit"
                        label={isUploading ? "Đang tải lên..." : "Lưu bài giảng"}
                        className={`rounded-xl px-8 shadow-lg shadow-blue-600/20 ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                        icon={!isUploading ? <Upload className="w-5 h-5 mr-2" /> : undefined}
                        disabled={isUploading}
                    />
                </div>
            </div>
        </div>
    )
}

export default Step2DetailsForm
