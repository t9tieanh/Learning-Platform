import React from 'react'
import { AlignLeft, ScanEye } from 'lucide-react'
import QuillEditor from '@/components/common/Input/QuillEditor'
import { LessonChunk } from '@/types/ai'

interface TranscriptEditorProps {
    chunks: LessonChunk[]
}

const TranscriptEditor: React.FC<TranscriptEditorProps> = ({ chunks }) => {
    return (
        <div className='space-y-8 pt-10'>
            <div className='flex items-center gap-4 px-2'>
                <div className='p-3 bg-blue-600 rounded-2xl shadow-sm'>
                    <AlignLeft className='w-6 h-6 text-white' />
                </div>
                <div>
                    <h3 className='text-2xl font-black text-gray-900'>Biên tập <span className='text-blue-600'>Transcript</span> (SRT)</h3>
                    <p className='text-xs font-bold text-gray-400 uppercase tracking-widest'>Chỉnh sửa nội dung ngữ nghĩa</p>
                </div>
            </div>

            <div className='relative group'>
                <div className='absolute -inset-1 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-[3rem] blur opacity-10'></div>
                <div className='bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-lg relative'>
                    <div className='relative min-h-[500px]'>
                        <QuillEditor
                            initialHtml={chunks.map((c) => `<p><strong style="color: #2563eb;">[${c.timestamp}]</strong> ${c.summary}</p>`).join('<br/>')}
                            className='min-h-[500px] text-lg leading-loose font-medium'
                        />
                    </div>
                    <div className='mt-8 flex items-center gap-4 bg-blue-50/50 p-6 rounded-3xl border border-blue-100 shadow-inner'>
                        <div className='p-2 bg-white rounded-xl shadow-sm border border-blue-100'>
                            <ScanEye className='w-5 h-5 text-blue-600' />
                        </div>
                        <p className='text-sm text-blue-900 font-medium leading-relaxed italic'>
                            <strong>Lưu ý quan trọng:</strong> Chỉnh sửa Transcript không chỉ cập nhật phụ đề mà còn giúp thuật toán tìm kiếm của hệ thống hiểu sâu hơn về nội dung khóa học của bạn.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TranscriptEditor
