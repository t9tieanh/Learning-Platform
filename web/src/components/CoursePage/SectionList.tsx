import { ChevronDown, CheckCircle2, Circle } from 'lucide-react'
import { LectureItem } from './LectureItem'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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

interface SectionListProps {
  sections: Section[]
  currentLectureId: string
  onSelectLecture: (lecture: Lecture) => void
}

export const SectionList = ({ sections, currentLectureId, onSelectLecture }: SectionListProps) => {
  const [openSections, setOpenSections] = useState<number[]>([0])

  const toggleSection = (index: number) => {
    setOpenSections(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    )
  }

  return (
    <div className='space-y-3 px-1'>
      {sections.map((section, index) => {
        const totalCount = section.lectures.length
        const completedCount = section.lectures.filter((lecture) => lecture.completionStatus === 'COMPLETED').length
        const isOpen = openSections.includes(index)
        const isFullyCompleted = completedCount === totalCount && totalCount > 0

        return (
          <div key={index} className='group overflow-hidden'>
            <button
              onClick={() => toggleSection(index)}
              className={`w-full p-4 flex items-center justify-between rounded-2xl border transition-all duration-300 ${isOpen
                  ? 'bg-[#F8FAFF] border-blue-200 shadow-sm'
                  : 'bg-white border-gray-100 hover:border-blue-100 hover:bg-blue-50/30'
                }`}
            >
              <div className='flex items-center gap-4 text-left'>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isOpen ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-500'
                  }`}>
                  <span className='text-[13px] font-black'>{index + 1}</span>
                </div>
                <div>
                  <h3 className={`font-bold text-[14px] leading-tight transition-colors ${isOpen ? 'text-[#0C356A]' : 'text-gray-700 group-hover:text-blue-600'
                    }`}>
                    {section.title}
                  </h3>
                  <div className='flex items-center gap-2 mt-1.5'>
                    <div className='flex items-center gap-1.5'>
                      {isFullyCompleted ? (
                        <CheckCircle2 className='w-3 h-3 text-green-500' />
                      ) : (
                        <Circle className='w-3 h-3 text-gray-300' />
                      )}
                      <span className={`text-[10px] font-black uppercase tracking-wider ${isFullyCompleted ? 'text-green-600' : 'text-gray-400'
                        }`}>
                        {completedCount}/{totalCount} Bài học
                      </span>
                    </div>
                    <span className='text-[10px] text-gray-300 font-bold px-1'>•</span>
                    <span className='text-[10px] text-blue-400 font-black uppercase tracking-wider'>
                      {section.duration}
                    </span>
                  </div>
                </div>
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <ChevronDown className={`w-5 h-5 ${isOpen ? 'text-blue-600' : 'text-gray-300'}`} />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                  className='overflow-hidden'
                >
                  <div className='pt-2 pb-4 space-y-1 pl-14 pr-2'>
                    {section.lectures.map((lecture) => (
                      <LectureItem
                        key={lecture.id}
                        lecture={lecture}
                        isActive={currentLectureId === lecture.id}
                        onSelect={() => onSelectLecture(lecture)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
