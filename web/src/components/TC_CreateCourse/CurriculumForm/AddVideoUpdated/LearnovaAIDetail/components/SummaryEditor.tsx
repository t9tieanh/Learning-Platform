import React from 'react'
import { Check, RefreshCw } from 'lucide-react'
import CustomButton from '@/components/common/Button'
import CustomTextarea from '@/components/common/Textarea'

interface SummaryEditorProps {
    value: string
    isSaving: boolean
    onChange: (value: string) => void
    onSave: () => void
    onCancel: () => void
}

const SummaryEditor: React.FC<SummaryEditorProps> = ({
    value,
    isSaving,
    onChange,
    onSave,
    onCancel
}) => {
    return (
        <div className='space-y-3 p-1 animate-in fade-in slide-in-from-top-1 duration-200'>
            <CustomTextarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className='w-full text-sm text-gray-800 leading-relaxed bg-white rounded-2xl border-blue-200 focus:border-blue-400 min-h-[140px] font-medium'
                placeholder='Nhập tóm tắt nội dung...'
                autoFocus
            />
            <div className='flex justify-end gap-3'>
                <CustomButton
                    onClick={onCancel}
                    variant='ghost'
                    size='sm'
                    label='Hủy'
                    className='text-[11px] font-bold text-gray-400 px-5'
                />
                <CustomButton
                    onClick={onSave}
                    disabled={isSaving}
                    variant='default'
                    size='sm'
                    icon={isSaving ? <RefreshCw className='w-3.5 h-3.5 animate-spin' /> : <Check className='w-3.5 h-3.5' />}
                    label={isSaving ? 'Lưu...' : 'Lưu tóm tắt'}
                    className='bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-8.5 px-6 text-[11px] font-bold shadow-md shadow-blue-100 transition-all'
                />
            </div>
        </div>
    )
}

export default SummaryEditor
