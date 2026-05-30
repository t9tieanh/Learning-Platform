import { useNavigate } from 'react-router-dom'
import CustomButton from '@/components/common/Button'
import { Play, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuth.stores'
import { motion } from 'framer-motion'

const LearnNow = ({ courseId, instructorId }: { courseId: string; instructorId: string }) => {
  const { data } = useAuthStore()
  const navigate = useNavigate()

  const handleStart = () => {
    if (!courseId) return
    navigate(`/course-page/${courseId}`)
  }

  const isInstructor = data && data.userId === instructorId

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className='w-full max-w-sm mx-auto sticky z-20 shadow-md rounded-2xl'
      style={{ top: 'calc(var(--main-header-height, 64px) + 32px)' }}
    >
      <div className='bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 flex flex-col gap-6'>
        <div className='space-y-2'>
          <h3 className='text-xl font-bold text-gray-900 tracking-tight'>
            {isInstructor ? 'Hệ thống Quản trị' : 'Bắt đầu hành trình'}
          </h3>
          <p className='text-sm text-gray-500 font-medium leading-relaxed'>
            {isInstructor
              ? 'Quản lý bài giảng và theo dõi tiến độ học viên của bạn ngay bây giờ.'
              : 'Truy cập toàn bộ bài giảng và bài tập để bắt đầu học ngay lập tức.'}
          </p>
        </div>

        <div className='pt-2'>
          <CustomButton
            className='w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 shadow-lg shadow-blue-500/20'
            icon={isInstructor ? <ArrowRight className='w-4 h-4' /> : <Play className='w-4 h-4 fill-white' />}
            label={isInstructor ? 'Truy cập Quản lý' : 'Học ngay bây giờ'}
            onClick={handleStart}
          />
        </div>

        <div className='flex items-center gap-3 text-[11px] font-bold text-gray-400'>
          <div className='flex-1 h-px bg-gray-50' />
          <span className='tracking-widest'>Learnova - Học nữa học mãi</span>
          <div className='flex-1 h-px bg-gray-50' />
        </div>
      </div>
    </motion.div>
  )
}

export default LearnNow
