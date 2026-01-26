import React from 'react'
import { Upload, Trash2, FileVideo } from 'lucide-react'
import CustomButton from '@/components/common/Button'
import { cn } from '@/lib/utils'

interface Step1MediaUploadProps {
    videoSrc: string | null
    selectedFile: File | null
    videoRef: React.RefObject<HTMLVideoElement | null>
    fileInputRef: React.RefObject<HTMLInputElement | null>
    handleSelectFile: (event: React.ChangeEvent<HTMLInputElement>) => void
    handleRemoveFile: () => void
    handleLoadedMetadata: () => void
    setStep: (step: 1 | 2) => void
    onQuickSave: () => void
    onContinueEditing: () => void
    isUploading: boolean
    uploadProgress?: number
}

const Step1MediaUpload: React.FC<Step1MediaUploadProps> = ({
    videoSrc,
    selectedFile,
    videoRef,
    fileInputRef,
    handleSelectFile,
    handleRemoveFile,
    handleLoadedMetadata,
    setStep,
    onQuickSave,
    onContinueEditing,
    isUploading,
    uploadProgress = 0
}) => {
    return (
        <div className="space-y-6 w-full">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">

                {/* Upload Area */}
                <div
                    className={cn(
                        "relative flex flex-col items-center justify-center w-full min-h-[320px] rounded-xl border-2 border-dashed transition-all duration-200 bg-gray-50/50",
                        videoSrc ? "border-blue-200 bg-blue-50/30" : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/30"
                    )}
                >
                    {videoSrc ? (
                        <div className="relative w-full h-full flex items-center justify-center group p-4">
                            <video
                                ref={videoRef}
                                src={videoSrc}
                                controls
                                onLoadedMetadata={handleLoadedMetadata}
                                className="w-full h-full max-h-[300px] object-contain rounded-lg shadow-sm"
                            />
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <CustomButton
                                    type="button"
                                    onClick={handleRemoveFile}
                                    className="bg-white text-red-500 hover:bg-red-50 p-2 rounded-full h-9 w-9 flex items-center justify-center shadow-md border border-gray-100"
                                    icon={<Trash2 className="w-4 h-4" />}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-8 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Upload className="w-8 h-8" />
                            </div>
                            <h4 className="text-base font-semibold text-gray-900 mb-2">Upload video lesson</h4>
                            <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                                Drag and drop your video here, or click to browse.
                                <br />Maximum file size: 500MB.
                            </p>
                            <CustomButton
                                type="button"
                                label="Browse files"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    fileInputRef.current?.click()
                                }}
                                className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg px-6 py-2 text-sm font-medium shadow-sm"
                            />
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleSelectFile}
                    />
                </div>

                {/* File List Item (Selected or Uploading) */}
                {selectedFile && (
                    <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">File to upload</h4>
                        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 shadow-sm relative overflow-hidden">
                            {/* Progress Bar Background (if uploading) */}
                            {isUploading && (
                                <div
                                    className="absolute bottom-0 left-0 h-1 bg-blue-600 transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            )}

                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                                <FileVideo className="w-5 h-5" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-medium text-gray-900 truncate pr-4">{selectedFile.name}</p>
                                    {!isUploading && (
                                        <button
                                            onClick={handleRemoveFile}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                                    {isUploading && <span>{uploadProgress}% • Uploading...</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Step1MediaUpload
