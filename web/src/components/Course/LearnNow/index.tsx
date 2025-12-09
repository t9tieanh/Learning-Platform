import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import CustomButton from '@/components/common/Button'
import { Play, Send } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuth.stores'

const LearnNow = ({ courseId, instructorId }: { courseId: string; instructorId: string }) => {
  const { data } = useAuthStore()
  const navigate = useNavigate()

  const handleStart = () => {
    if (!courseId) return
    navigate(`/course-page/${courseId}`)
  }

  // If still loading, show a compact placeholder
  return (
    <div className='flex justify-center min-h-screen bg-gradient-to-br py-8'>
      <div className='w-full max-w-md'>
        <Card
          className='sticky bg-gradient-card shadow-lg border-0 rounded-2xl overflow-hidden backdrop-blur-sm'
          style={{ top: 'calc(var(--main-header-height, 64px) + 100px)' }}
        >
          <CardHeader className=''>
            <div className='text-start space-y-2'>
              <h3 className='text-lg font-semibold flex items-center gap-1'>
                <Send size={18} />
                Bắt đầu học
              </h3>
              <p className='text-sm text-muted-foreground'>Truy cập nội dung khoá học và bắt đầu học ngay lập tức.</p>
            </div>
          </CardHeader>
          <CardContent className='pt-2'>
            <div className='space-y-3'>
              <CustomButton
                className='w-full h-12 bg-[#0C356A] text-base'
                icon={<Play className='w-4 h-4' />}
                label={data && data.userId === instructorId ? 'Quản lý khóa học' : 'Bắt đầu học ngay'}
                onClick={handleStart}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LearnNow
