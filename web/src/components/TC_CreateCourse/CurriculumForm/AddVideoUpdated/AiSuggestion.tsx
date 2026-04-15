import React, { useState } from 'react'
import { Sparkles, MousePointerClick, ChevronDown, ChevronUp } from 'lucide-react'
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
  const shouldShowToggle = suggestion && suggestion.length > 200 && type === 'content'

  if (!suggestion && !isLoading) return null

  return (
    <div className='mt-3 flex items-start gap-4 text-sm bg-gradient-to-br from-blue-100/50 to-cyan-100/50 p-5 rounded-2xl border border-blue-200/50 transition-all shadow-md shadow-blue-100/20'>
      <div className='p-2 bg-white rounded-xl shadow-md border border-blue-50'>
        <Sparkles className='w-4 h-4 text-blue-600' />
      </div>

      <div className='flex-1 min-w-0'>
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center gap-2.5'>
            <span className='text-[10px] font-medium text-blue-700 tracking-wide'>AI Learnova</span>
            <div className='h-3 w-px bg-blue-200' />
            <img src={learnovaLogo} alt='Logo Learnova' className='h-2.5 w-auto object-contain brightness-0 opacity-30' />
          </div>
          {!isLoading && (
            <CustomButton
              type='button'
              onClick={onApply}
              variant='ghost'
              size='sm'
              label='Áp dụng'
              icon={<MousePointerClick className='w-3 h-3' />}
              className='h-7 text-[10px] font-bold text-blue-700 hover:bg-white hover:shadow-md px-3 rounded-lg border border-transparent hover:border-blue-100'
            />
          )}
        </div>

        {isLoading ? (
          <div className='space-y-3 animate-pulse'>
            <div className='h-3 bg-blue-200/40 rounded-lg w-4/5' />
            {type === 'content' && <div className='h-3 bg-blue-200/40 rounded-lg w-full' />}
          </div>
        ) : (
          <div className='relative'>
            <p className={`text-[13px] text-gray-800 leading-relaxed font-medium italic ${!isExpanded && type === 'content' ? 'line-clamp-2' : ''}`}>
              "{suggestion}"
            </p>
            {shouldShowToggle && (
              <button
                type='button'
                onClick={() => setIsExpanded(!isExpanded)}
                className='text-[10px] font-medium text-blue-600 hover:text-blue-800 mt-2.5 flex items-center gap-1 tracking-wider'
              >
                {isExpanded ? (
                  <>
                    Thu gọn <ChevronUp className='w-3 h-3' />
                  </>
                ) : (
                  <>
                    Xem thêm <ChevronDown className='w-3 h-3' />
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
