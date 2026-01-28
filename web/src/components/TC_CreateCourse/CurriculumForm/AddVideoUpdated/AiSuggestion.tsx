import React, { useState } from 'react'
import { Sparkles, Loader2, MousePointerClick, ChevronDown, ChevronUp } from 'lucide-react'
import learnovaLogo from '@/assets/images/logo1.png'
import CustomButton from '@/components/common/Button'

interface AiSuggestionProps {
    isLoading: boolean
    suggestion: string | undefined
    onApply: () => void
    type?: 'title' | 'content'
}

const AiSuggestion: React.FC<AiSuggestionProps> = ({ isLoading, suggestion, onApply, type = 'title' }) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const shouldShowToggle = suggestion && suggestion.length > 100 && type === 'content'
    return (
        <div className="mt-2 flex items-start gap-2 text-sm bg-blue-50 p-3 rounded-lg border border-blue-100 shadow-md">
            <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1 font-medium text-blue-800 text-xs uppercase tracking-wide">
                        <span>Gợi ý từ</span>
                        <img src={learnovaLogo} alt="Learnova AI" className="h-4 w-auto object-contain rounded-sm mb-1" />
                    </div>
                    {isLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                    ) : (
                        <button
                            type="button"
                            onClick={onApply}
                            className="flex items-center text-xs bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-700 transition-colors"
                        >
                            <MousePointerClick className="w-3 h-3 mr-1" />
                            Áp dụng
                        </button>
                    )}
                </div>
                {isLoading ? (
                    type === 'title' ? (
                        <div className="h-4 w-3/4 bg-blue-200/50 rounded animate-pulse" />
                    ) : (
                        <div className="space-y-1">
                            <div className="h-3 w-full bg-blue-200/50 rounded animate-pulse" />
                            <div className="h-3 w-5/6 bg-blue-200/50 rounded animate-pulse" />
                        </div>
                    )
                ) : (
                    <div>
                        <p className={`text-blue-900 ${isExpanded ? '' : (type === 'title' ? 'line-clamp-1' : 'line-clamp-2')}`}>
                            {suggestion}
                        </p>
                        {shouldShowToggle && (
                            <button
                                type="button"
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-1 flex items-center gap-0.5"
                            >
                                {isExpanded ? (
                                    <>
                                        Thu gọn <ChevronUp className="w-3 h-3" />
                                    </>
                                ) : (
                                    <>
                                        Xem thêm <ChevronDown className="w-3 h-3" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default AiSuggestion
