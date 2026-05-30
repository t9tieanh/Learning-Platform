import React from 'react'
import { ClipboardList, Sparkles } from 'lucide-react'
import HighGlossBackground from '@/components/common/HighGlossBackground'

export const LessonTestHero: React.FC = () => (
  <HighGlossBackground className='rounded-xl shadow-md shadow-blue-900/10 overflow-hidden'>
    <div className='px-4 py-3.5 md:px-5 md:py-4 flex flex-col gap-3 sm:flex-row sm:items-center'>
      <div className='flex items-start gap-3 min-w-0'>
        <div className='w-9 h-9 mt-0.5 shrink-0 bg-white/10 rounded-lg flex items-center justify-center text-white border border-white/15'>
          <ClipboardList className='w-[18px] h-[18px]' strokeWidth={2} />
        </div>
        <div className='min-w-0 flex flex-col pt-0.5'>
          <h2 className='text-white font-black text-[15px] tracking-tight leading-snug flex items-center gap-1.5 flex-wrap'>
            Bài kiểm tra theo từng mảng nội dung
            <Sparkles className='w-3 h-3 text-white/70 shrink-0' aria-hidden />
          </h2>
          <p className='text-[11px] text-blue-100/80 mt-0.5 font-medium leading-snug'>
            Các nhóm câu theo phần nội dung — nộp một lần sau khi làm xong.
          </p>
        </div>
      </div>
    </div>
  </HighGlossBackground>
)
