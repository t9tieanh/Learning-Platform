import { useState } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import { mockCourse } from '@/lib/mockCourse'
import { Lesson } from '@/types/course.type'
import { CourseHero } from '@/components/TC_CourseDetail/CourseHero'
import { CourseSummary } from '@/components/TC_CourseDetail/CourseSummary'
import { CurriculumAccordion } from '@/components/TC_CourseDetail/CurriculumAccordion'
import { LearningOutcomes } from '@/components/TC_CourseDetail/LearningOutcomes'
import { Prerequisites } from '@/components/TC_CourseDetail/Prerequisites'
import { FullDescription } from '@/components/TC_CourseDetail/FullDescription'
import { ReviewsList } from '@/components/TC_CourseDetail/ReviewsList'
import { StatsSidebar } from '@/components/TC_CourseDetail/StatsSidebar'
import { VideoModal } from '@/components/TC_CourseDetail/VideoModal'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'
import { Separator } from '@/components/ui/separator'

export default function CourseDetailPage() {
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [currentVideo, setCurrentVideo] = useState<{
    url: string
    title: string
  } | null>(null)

  const handlePlayIntro = () => {
    if (mockCourse.introVideo) {
      setCurrentVideo({
        url: mockCourse.introVideo,
        title: `Video giới thiệu - ${mockCourse.title}`
      })
      setVideoModalOpen(true)
    }
  }

  const handlePlayLesson = (lesson: Lesson) => {
    if (lesson.videoUrl) {
      setCurrentVideo({
        url: lesson.videoUrl,
        title: lesson.title
      })
      setVideoModalOpen(true)
    }
  }

  const handleEdit = () => {
    toast.success('Đang chuyển đến trang chỉnh sửa...')
  }

  const handlePublish = () => {
    toast.success('Khóa học đã được xuất bản!')
  }

  const handleUnpublish = () => {
    toast.info('Khóa học đã được gỡ xuất bản')
  }

  const handleShare = () => {
    toast.success('Link chia sẻ đã được sao chép!')
  }

  const handleAddSection = () => {
    toast.success('Thêm phần mới')
  }

  const handleAddLesson = () => {
    toast.success('Thêm bài học mới')
  }

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <header className='sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <Button variant='ghost' size='sm' className='gap-2'>
              <ArrowLeft className='h-4 w-4' />
              Quay lại
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='container mx-auto px-4 py-8'>
        <div className='grid gap-8 lg:grid-cols-[1fr_320px]'>
          {/* Left Column - Main Content */}
          <div className='space-y-8'>
            <CourseHero
              title={mockCourse.title}
              coverImage={mockCourse.coverImage}
              status={mockCourse.status}
              publishedAt={mockCourse.stats.publishedAt}
              price={mockCourse.price}
              onPlayIntro={handlePlayIntro}
              onEdit={handleEdit}
            />

            <CourseSummary
              shortDescription={mockCourse.shortDescription}
              studentsCount={mockCourse.studentsCount}
              rating={mockCourse.rating}
              reviewsCount={mockCourse.reviewsCount}
              category={mockCourse.category}
              tags={mockCourse.tags}
            />

            <LearningOutcomes outcomes={mockCourse.learningOutcomes} />

            <Prerequisites prerequisites={mockCourse.prerequisites} />

            <CurriculumAccordion
              sections={mockCourse.sections}
              courseId={mockCourse.id}
              onPlayLesson={handlePlayLesson}
            />

            <FullDescription description={mockCourse.longDescription} />

            <ReviewsList reviews={mockCourse.reviews} reviewsPerPage={5} />
          </div>

          {/* Right Column - Sidebar */}
          <aside className='hidden lg:block'>
            <StatsSidebar
              revenue={mockCourse.stats.revenue}
              studentsCount={mockCourse.studentsCount}
              rating={mockCourse.rating}
              status={mockCourse.status}
              onPublish={handlePublish}
              onUnpublish={handleUnpublish}
              onShare={handleShare}
            />
          </aside>
        </div>

        {/* Footer Actions */}
        <div className='mt-12 mb-8'>
          <Separator className='mb-8' />
          <div className='flex flex-wrap gap-3 justify-center'>
            <Button variant='outline' onClick={handleAddSection} className='gap-2'>
              <Plus className='h-4 w-4' />
              Thêm phần mới
            </Button>
            <Button variant='outline' onClick={handleAddLesson} className='gap-2'>
              <Plus className='h-4 w-4' />
              Thêm bài học
            </Button>
            <Button variant='outline' onClick={handleEdit} className='gap-2'>
              Chỉnh sửa khóa học
            </Button>
          </div>
        </div>
      </main>

      {/* Video Modal */}
      {currentVideo && (
        <VideoModal
          isOpen={videoModalOpen}
          onClose={() => setVideoModalOpen(false)}
          videoUrl={currentVideo.url}
          title={currentVideo.title}
        />
      )}

      {/* Mobile Sticky CTA */}
      <div className='fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur p-4 lg:hidden'>
        <Button
          onClick={mockCourse.status === 'published' ? handleUnpublish : handlePublish}
          className='w-full shadow-primary'
          size='lg'
        >
          {mockCourse.status === 'published' ? 'Gỡ xuất bản' : 'Xuất bản khóa học'}
        </Button>
      </div>
    </div>
  )
}
