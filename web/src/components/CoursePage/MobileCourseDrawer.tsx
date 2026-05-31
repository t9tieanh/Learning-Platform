import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TableOfContents, Sparkles } from 'lucide-react'
import Button from '@/components/common/Button'
import { CourseSidebar } from './CourseSidebar'
import { CourseSidebarSkeleton } from './CourseSidebarSkeleton'
import { CertificateJourneyProgress } from './CertificateJourneyProgress'
import { CertificateJourney } from '@/types/course-student'

interface MobileCourseDrawerProps {
  activeMobileTab: 'content' | 'ai' | null
  setActiveMobileTab: (tab: 'content' | 'ai' | null) => void
  uiSections: any[]
  currentLectureId: string
  onSelectLecture: (lecture: any) => void
  onSeek: (timestamp: string) => void
  isLoading: boolean
  subtitlesRaw?: string | null
  certificateJourney?: CertificateJourney | null
  onNavigateToLessonTest?: (lessonId: string) => void
}

export const MobileCourseDrawer: React.FC<MobileCourseDrawerProps> = ({
  activeMobileTab,
  setActiveMobileTab,
  uiSections,
  currentLectureId,
  onSelectLecture,
  onSeek,
  isLoading,
  subtitlesRaw,
  certificateJourney,
  onNavigateToLessonTest,
}) => {
  return (
    <div className='lg:hidden fixed bottom-0 left-0 right-0 z-[60]'>
      {/* Backdrop */}
      <AnimatePresence>
        {activeMobileTab && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveMobileTab(null)}
            className='fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[-1]'
          />
        )}
      </AnimatePresence>

      {/* Drawer Content */}
      <motion.div
        initial={false}
        animate={{ 
          y: activeMobileTab ? 0 : 'calc(100% - 60px)'
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className='bg-white shadow-[0_-8px_30px_rgb(0,0,0,0.12)] rounded-t-[32px] overflow-hidden border-t border-border flex flex-col'
        style={{ height: activeMobileTab ? '85vh' : '60px' }}
      >
        {/* Header/Tabs (The part that stays visible) */}
        <div className='h-[60px] flex items-center justify-around px-2 border-b border-gray-50 bg-white cursor-pointer relative shadow-sm shrink-0'>
          {/* Drag Handle */}
          <div className='absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-200 rounded-full' />

          <div className='flex-1 flex justify-center h-full'>
            <Button
              variant='ghost'
              onClick={(e) => {
                e.stopPropagation()
                setActiveMobileTab(activeMobileTab === 'content' ? null : 'content')
              }}
              className={`flex-1 h-full flex flex-col items-center justify-center gap-1 rounded-none !bg-transparent hover:!bg-gray-50 transition-all relative ${activeMobileTab === 'content' ? '!text-blue-600' : '!text-gray-500'}`}
            >
              <TableOfContents className={`w-5 h-5 transition-transform ${activeMobileTab === 'content' ? 'scale-110' : ''}`} />
              <span className='text-[10px] font-bold tracking-wider'>Chương học</span>
              {activeMobileTab === 'content' && (
                <motion.div layoutId='mobileTabUnderline' className='absolute bottom-0 h-1 w-16 bg-blue-600 rounded-t-full' />
              )}
            </Button>
          </div>

          {currentLectureId !== 'introduction' && (
            <div className='flex-1 flex justify-center h-full'>
              <Button
                variant='ghost'
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveMobileTab(activeMobileTab === 'ai' ? null : 'ai')
                }}
                className={`flex-1 h-full flex flex-col items-center justify-center gap-1 rounded-none !bg-transparent hover:!bg-gray-50 transition-all relative ${activeMobileTab === 'ai' ? '!text-blue-600' : '!text-gray-500'}`}
              >
                <Sparkles className={`w-5 h-5 transition-transform ${activeMobileTab === 'ai' ? 'scale-110' : ''}`} />
                <span className='text-[10px] font-bold tracking-wider'>Trợ lý AI</span>
                {activeMobileTab === 'ai' && (
                  <motion.div layoutId='mobileTabUnderline' className='absolute bottom-0 h-1 w-16 bg-blue-600 rounded-t-full' />
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className='flex-1 overflow-hidden min-h-0 flex flex-col'>
          {isLoading ? (
            <CourseSidebarSkeleton />
          ) : (
            <>
              {certificateJourney && (
                <div className='p-3 border-b border-border shrink-0'>
                  <CertificateJourneyProgress
                    journey={certificateJourney}
                    onNavigateToLessonTest={onNavigateToLessonTest}
                  />
                </div>
              )}
              <div className='flex-1 min-h-0 overflow-hidden'>
                <CourseSidebar
                  sections={uiSections}
                  currentLectureId={currentLectureId}
                  onSelectLecture={(l) => {
                    onSelectLecture(l)
                    setActiveMobileTab(null)
                  }}
                  onSeek={onSeek}
                  hideHeader={true}
                  initialTab={activeMobileTab === 'ai' ? 'ai' : 'content'}
                  subtitlesRaw={subtitlesRaw}
                />
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
