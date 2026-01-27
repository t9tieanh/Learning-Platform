import React from 'react'
import { Video, FileText, BookOpen, HelpCircle, PlusCircle, MousePointerClick } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step0TypeSelectionProps {
    onSelectType: (type: 'video' | 'document') => void
}

const Step0TypeSelection: React.FC<Step0TypeSelectionProps> = ({ onSelectType }) => {
    const types = [
        {
            id: 'video',
            title: 'Bài giảng video',
            description: 'Tạo và xuất bản bài giảng Video cho người học.',
            icon: <Video className="w-6 h-6 text-white" />,
            color: 'bg-purple-500',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200'
        },
        {
            id: 'document',
            title: 'Bài giảng tài liệu (PDF)',
            description: 'Tạo và xuất bản bài giảng dạng tài liệu (PDF) cho người học.',
            icon: <FileText className="w-6 h-6 text-white" />,
            color: 'bg-green-500',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200'
        },
    ]

    return (
        <div className="p-8 w-full h-full flex flex-col items-center justify-center">
            <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
                    <PlusCircle className="w-6 h-6 text-blue-600" />
                    Tạo bài giảng mới
                </h2>
                <p className="text-gray-500 mt-2 text-base flex items-center justify-center gap-2">
                    <MousePointerClick className="w-4 h-4" />
                    Chọn loại nội dung bạn muốn tạo
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
                {types.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => onSelectType(type.id as 'video' | 'document')}
                        className={cn(
                            "flex flex-col text-left p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg group",
                            "bg-white border-gray-100 hover:border-blue-500"
                        )}
                    >
                        <div className={cn(
                            "w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-sm transition-transform group-hover:scale-110",
                            type.color
                        )}>
                            {type.icon}
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                            {type.title}
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            {type.description}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    )
}

export default Step0TypeSelection
