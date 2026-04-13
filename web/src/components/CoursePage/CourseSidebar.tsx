import { X, TableOfContents, Sparkles, Send, Brain } from 'lucide-react'
import { SectionList } from './SectionList'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HighGlossBackground from '@/components/common/HighGlossBackground'
import CustomInput from '@/components/common/Input'
import CustomButton from '@/components/common/Button'

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
}

export const CourseSidebar = ({ sections, currentLectureId, onSelectLecture, onClose }: CourseSidebarProps) => {
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
              <div className='flex-1 p-5 space-y-6 overflow-y-auto custom-scrollbar overflow-x-hidden'>
                {/* AI MESSAGE */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className='flex flex-col gap-1.5 max-w-[85%]'
                >
                  <div className='bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm'>
                    <p className='text-[13.5px] text-gray-700 leading-relaxed font-medium'>
                      Chào bạn! Tôi là Learnova AI. Bạn có thắc mắc gì về bài giảng này không? Tôi đã sẵn sàng hỗ trợ bạn hiểu rõ mọi khái niệm!
                    </p>
                  </div>
                  <div className='flex items-center gap-1.5 ml-1'>
                    <div className='w-1 h-1 rounded-full bg-blue-500' />
                    <span className='text-[9px] text-gray-400 font-black uppercase tracking-widest'>Learnova AI • 12:45</span>
                  </div>
                </motion.div>

                {/* USER MESSAGE */}
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className='flex flex-col items-end gap-1.5 max-w-[85%] ml-auto'
                >
                  <div className='bg-blue-600 p-4 rounded-2xl rounded-tr-none shadow-lg shadow-blue-100'>
                    <p className='text-[13.5px] text-white leading-relaxed font-bold tracking-tight'>
                      Giải thích cho mình phần kiến thức quan trọng nhất của chương này nhé?
                    </p>
                  </div>
                  <span className='text-[9px] text-gray-400 font-black uppercase tracking-widest mr-1'>Bạn • 12:46</span>
                </motion.div>

                {/* AI RESPONSE */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className='flex flex-col gap-1.5 max-w-[88%]'
                >
                  <div className='bg-white p-4 rounded-2xl rounded-tl-none border border-blue-50 shadow-sm border-l-4 border-l-blue-500'>
                    <p className='text-[13.5px] text-gray-700 leading-relaxed font-medium'>
                      Dựa vào nội dung bài giảng, phần cốt lõi nhất là <b>Cơ chế đồng bộ hóa dữ liệu</b>. Tôi đã chuẩn bị một bản tóm tắt nhanh cho bạn ở tab "Learnova AI" bên dưới video nhé!
                    </p>
                    <div className='mt-3 flex gap-2'>
                      <button className='text-[9px] bg-blue-50 text-blue-600 px-2.5 py-1.5 rounded-lg font-black uppercase tracking-tighter hover:bg-blue-600 hover:text-white transition-all'>Chi tiết hơn</button>
                      <button className='text-[9px] bg-gray-50 text-gray-400 px-2.5 py-1.5 rounded-lg font-black uppercase tracking-tighter'>Đã hiểu</button>
                    </div>
                  </div>
                  <span className='text-[9px] text-gray-400 font-black uppercase tracking-widest ml-1'>Learnova AI • 12:46</span>
                </motion.div>
              </div>

              {/* Chat Input Modernized */}
              <div className='p-4 border-t border-gray-100 bg-white/80 backdrop-blur-md'>
                <div className='relative flex items-center group'>
                  <div className='absolute inset-0 bg-blue-500/5 blur-xl group-focus-within:bg-blue-500/10 transition-all rounded-full' />
                  <CustomInput
                    placeholder='Hỏi Learnova AI bất cứ điều gì...'
                    className='!pl-5 !pr-14 !py-7 !bg-gray-50/50 !border-gray-100 !rounded-[1.5rem] !text-[14px] !focus:ring-0 !focus:border-blue-400/50 transition-all font-semibold italic placeholder:text-gray-300 relative z-10 w-full'
                  />
                  <CustomButton
                    className='absolute right-2.5 p-3 h-10 w-10 bg-blue-600 text-white rounded-[1.2rem] shadow-lg shadow-blue-500/20 hover:scale-110 active:scale-90 transition-all z-20 flex items-center justify-center'
                    icon={<Send className='w-4 h-4' />}
                  />
                </div>
                <p className='text-[9px] text-gray-300 text-center mt-4 font-bold uppercase tracking-[0.2em]'>
                  Powered by Learnova Intelligence
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  )
}
