import { X, TableOfContents, Sparkles, Brain } from 'lucide-react'
import { SectionList } from './SectionList'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AIChatSection } from './AIChatSection'

interface Lecture {
  id: string
  title: string
  duration: string
  type: 'video' | 'article'
  url: string
  content: string
  completionStatus?: 'NOT_STARTED' | 'COMPLETED'
}

interface Section {
  title: string
  duration: string
  lectures: Lecture[]
}

interface CourseSidebarProps {
  sections: Section[]
  currentLectureId: string
  onSelectLecture: (lecture: Lecture) => void
  onClose?: () => void
  onSeek?: (timestamp: string) => void
}

export const CourseSidebar = ({ sections, currentLectureId, onSelectLecture, onClose, onSeek }: CourseSidebarProps) => {
  const [activeTab, setActiveTab] = useState<'content' | 'ai'>('content')

  return (
    <aside className='w-full lg:w-[400px] h-full bg-sidebar-background border-l border-sidebar-border flex flex-col'>
      <div className='flex flex-col border-b border-sidebar-border bg-white shadow-sm'>
        <div className='flex items-center justify-between p-4'>
          <h2 className='flex items-center gap-2 text-[15px] font-black tracking-tight text-[#0C356A]'>
            {activeTab === 'content' ? (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className='flex items-center gap-2 font-black'>
                <TableOfContents className='w-4 h-4 text-blue-600' /> Nội dung khóa học
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className='flex items-center gap-2 font-bold'>
                <Brain className='w-4 h-4 text-blue-600' /> Trợ lý Learnova AI
              </motion.div>
            )}
          </h2>
          {onClose && (
            <button onClick={onClose} className='lg:hidden p-1 hover:bg-sidebar-hover rounded transition-colors'>
              <X className='w-5 h-5' />
            </button>
          )}
        </div>

        {/* Modern Tabs with Motion */}
        <div className='flex px-4 gap-8 relative'>
          <button
            onClick={() => setActiveTab('content')}
            className={`pb-4 text-[11px] font-bold tracking-[0.1em] transition-all relative z-10 ${activeTab === 'content' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            Chương học
            {activeTab === 'content' && (
              <motion.div
                layoutId='activeTab'
                className='absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-full'
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`pb-4 text-[11px] font-bold tracking-[0.1em] transition-all relative z-10 flex items-center gap-2 ${activeTab === 'ai' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'ai' ? 'animate-pulse text-blue-500' : ''}`} />
            Hỏi đáp AI
            {activeTab === 'ai' && (
              <motion.div
                layoutId='activeTab'
                className='absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-full'
              />
            )}
          </button>
        </div>
      </div>

      <div className='flex-1 overflow-hidden relative'>
        <AnimatePresence mode='wait'>
          {activeTab === 'content' ? (
            <motion.div
              key='content'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className='h-full overflow-y-auto p-4'
            >
              <SectionList sections={sections} currentLectureId={currentLectureId} onSelectLecture={onSelectLecture} />
            </motion.div>
          ) : (
            <motion.div
              key='ai'
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.4, ease: [0.11, 0, 0, 1] }}
              className='h-full flex flex-col bg-[#fcfdfe]'
            >
              <AIChatSection lessonId={currentLectureId} onSeek={onSeek} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  )
}
