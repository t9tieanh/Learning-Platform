import { PlayCircle, FileText, CheckCircle2 } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { htmlToPlainText } from '@/utils/htmlToPlainText.util'

interface LectureItemProps {
  lecture: {
    id: string
    title: string
    duration: string
    videoUrl?: string
    type: 'video' | 'article'
    content: string
    completionStatus?: 'NOT_STARTED' | 'COMPLETED'
  }
  isActive: boolean
  onSelect: () => void
}

export const LectureItem = ({ lecture, isActive, onSelect }: LectureItemProps) => {
  const isCompleted = lecture.completionStatus === 'COMPLETED'
  const articlePreview = lecture.type === 'article'
    ? htmlToPlainText(lecture.content) || 'Bài viết'
    : 'Bài viết'

  return (
    <button
      onClick={onSelect}
      className={`w-full group flex items-start gap-4 p-3.5 rounded-xl transition-all duration-300 text-left ${isActive
        ? 'bg-blue-600 shadow-lg shadow-blue-200'
        : 'hover:bg-blue-50/50'
        }`}
    >
      <div className='mt-0.5 shrink-0'>
        {lecture.type === 'video' ? (
          <PlayCircle className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-blue-500 group-hover:text-blue-600'
            }`} />
        ) : (
          <FileText className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'
            }`} />
        )}
      </div>

      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2'>
          <p className={`text-[12.5px] font-semibold leading-tight truncate transition-colors ${isActive ? 'text-white' : 'text-gray-700'
            }`}>
            {lecture.title}
          </p>
          {isCompleted && !isActive && (
            <CheckCircle2 className='w-3.5 h-3.5 text-green-500 shrink-0' />
          )}
        </div>

        <div className='flex items-center gap-2 mt-1'>
          {lecture.type === 'video' ? (
            <span className={`text-[10px] font-bold tracking-wider ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>
              Video
            </span>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={`text-[10px] font-bold  tracking-wider truncate max-w-[150px] inline-block align-bottom ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>
                    {articlePreview}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[300px] text-[11px] font-medium p-2">
                  {articlePreview}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <span className={`text-[10px] font-bold ${isActive ? 'text-blue-200/50' : 'text-gray-300'}`}>•</span>
          <span className={`text-[10px] font-bold  tracking-wider ${isActive ? 'text-blue-100' : 'text-blue-400/80'}`}>
            {lecture.duration || '0:00'}
          </span>
        </div>
      </div>
    </button>
  )
}
