import { useEffect, useState } from 'react'
import { ArrowLeft, Plus, Loader2 } from 'lucide-react'
// import { mockCourse } from '@/lib/mockCourse' // ĐÃ THAY BẰNG DỮ LIỆU THẬT
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
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import { useParams, useNavigate } from 'react-router-dom'
import courseService from '@/services/course.service'
import { ApiResponse } from '@/types/response.type'

// Kiểu tạm thời cho dữ liệu trả về từ API backend (CourseResponse)
// Bạn có thể tạo file riêng nếu backend ổn định
interface CourseResponseDTO {
  id: string
  title: string
  thumbnailUrl?: string
  shortDescription?: string
  description?: string
  status: string
  price?: number
  createdAt?: string
  // tuỳ backend: tags, sections, lessons...
  tagNames?: string[]
  categories?: string[]
  chapters?: Array<{
    id: string
    title: string
    order?: number
    lessons?: Array<{
      id: string
      title: string
      type?: string
      duration?: string
      videoUrl?: string
    }>
  }>
  reviews?: Array<{
    id: string
    reviewerName: string
    rating: number
    comment: string
    createdAt: string
    avatar?: string
  }>
  students?: number
  rating?: number
  revenue?: number
  publishedAt?: string
  learningOutcomes?: string[]
  requirements?: string[]
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  console.log('[CourseDetailPage] param id =', id)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [course, setCourse] = useState<CourseResponseDTO | null>(null)
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [currentVideo, setCurrentVideo] = useState<{
    url: string
    title: string
  } | null>(null)

  const handlePlayIntro = () => {
    if (!course) return
  }

  const handlePlayLesson = (lesson: Lesson) => {
    if (lesson.videoUrl) {
      setCurrentVideo({ url: lesson.videoUrl, title: lesson.title })
      setVideoModalOpen(true)
    }
  }

  const handleEdit = () => {
    navigate('/teacher/course/' + id)
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

  // Fetch data
  useEffect(() => {
    let mounted = true
    async function fetchCourse() {
      if (!id) {
        setError('Không có ID khoá học')
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const res: ApiResponse<any> = await courseService.getCourseDetail(id)
        if (!mounted) return
        const data = res.result
        console.log('data', data)
        if (!data) throw new Error('Không có dữ liệu trả về')
        const mapped: CourseResponseDTO = {
          id: data.id,
          title: data.title,
          // coverImage ưu tiên thumbnailUrl
          thumbnailUrl: data.thumbnailUrl || data.image || data.coverImage,
          shortDescription: data.shortDescription || data.description,
          description: data.longDescription || data.description || '',
          status: (data.status || 'DRAFT').toLowerCase(),
          price: data.finalPrice,
          createdAt: data.createdAt,
          tagNames: data.tagNames || data.tags || [],
          categories: data.categories || (data.category ? [data.category] : []),
          learningOutcomes: data.outcomes || [],
          requirements: data.requirements || [],
          chapters: (data.chapters || []).map((s: any, idx: number) => ({
            id: s.id || `sec-${idx}`,
            title: s.title || s.name || `Phần ${idx + 1}`,
            order: s.order ?? idx + 1,
            lessons: (s.lessons || []).map((l: any, lidx: number) => ({
              id: l.id || `lesson-${idx}-${lidx}`,
              title: l.title || l.name || `Bài học ${lidx + 1}`,
              type: (l.type || 'video').toLowerCase(),
              duration: l.duration || '0:00',
              videoUrl: l.videoUrl || l.video || undefined
            }))
          })),
          reviews: (data.reviews || []).map((r: any, ridx: number) => ({
            id: r.id || `rv-${ridx}`,
            reviewerName: r.reviewerName || r.userName || 'Học viên',
            rating: r.rating || 5,
            comment: r.comment || r.content || '',
            createdAt: r.createdAt || r.date || new Date().toISOString(),
            avatar: r.avatar || r.reviewerAvatar
          })),
          students: data.enrollments.length || data.students || 0,
          rating: data.rating || 5,
          revenue: data.revenue || data.stats?.revenue || 0,
          publishedAt: data.publishedAt || data.stats?.publishedAt || data.createdAt
        }
        setCourse(mapped)
      } catch (e: any) {
        if (!mounted) return
        setError(e.message || 'Lỗi tải dữ liệu')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchCourse()
    return () => {
      mounted = false
    }
  }, [id])

  const goBack = () => navigate(-1)

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <header className='sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <Button variant='ghost' size='sm' className='gap-2' onClick={goBack}>
              <ArrowLeft className='h-4 w-4' /> Quay lại
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='container mx-auto px-4 py-8'>
        {loading && (
          <div className='flex flex-col items-center justify-center py-20 gap-4'>
            <Loader2 className='h-10 w-10 animate-spin text-primary' />
            <p className='text-muted-foreground'>Đang tải dữ liệu khóa học...</p>
          </div>
        )}
        {!loading && error && (
          <div className='flex flex-col items-center justify-center py-20 gap-4'>
            <p className='text-destructive font-medium'>Không tải được khoá học: {error}</p>
            <Button variant='outline' onClick={() => window.location.reload()}>
              Thử lại
            </Button>
          </div>
        )}
        {!loading && !error && course && (
          <div className='grid gap-8 lg:grid-cols-[1fr_320px]'>
            {/* Left Column - Main Content */}
            <div className='space-y-8'>
              <CourseHero
                title={course.title}
                coverImage={course.thumbnailUrl || '/placeholder.png'}
                status={course.status.toLowerCase()}
                publishedAt={course.publishedAt || course.createdAt || new Date().toISOString()}
                price={course.price}
                onPlayIntro={handlePlayIntro}
                onEdit={handleEdit}
              />

              <CourseSummary
                shortDescription={course.shortDescription || ''}
                studentsCount={course.students || 0}
                rating={course.rating || 5}
                reviewsCount={(course.reviews || []).length}
                category={course.categories?.[0]}
                tags={course.tagNames}
              />

              <LearningOutcomes outcomes={course.learningOutcomes || []} />

              <Prerequisites prerequisites={course.requirements || []} />

              <CurriculumAccordion
                sections={(course.chapters || []).map((s) => ({
                  id: s.id,
                  title: s.title,
                  order: s.order || 0,
                  lessons: (s.lessons || []).map((l) => ({
                    id: l.id,
                    title: l.title,
                    type: (l.type as any) || 'video',
                    duration: l.duration || '0:00',
                    videoUrl: l.videoUrl
                  }))
                }))}
                courseId={course.id}
                onPlayLesson={handlePlayLesson}
              />

              <FullDescription description={course.description || ''} />

              <ReviewsList
                reviews={(course.reviews || []).map((r) => ({
                  id: r.id,
                  reviewerName: r.reviewerName,
                  reviewerAvatar: r.avatar,
                  rating: r.rating,
                  comment: r.comment,
                  date: r.createdAt
                }))}
                reviewsPerPage={5}
                courseId={course.id}
              />
            </div>

            {/* Right Column - Sidebar */}
            <aside className='hidden lg:block'>
              <StatsSidebar
                revenue={(course.price || 0) * (course.students || 0)}
                studentsCount={course.students || 0}
                rating={course.rating || 5}
                status={course.status === 'published' ? 'published' : 'draft'}
                onPublish={handlePublish}
                onUnpublish={handleUnpublish}
                onShare={handleShare}
              />
            </aside>
          </div>
        )}

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
      {course && !loading && !error && (
        <div className='fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur p-4 lg:hidden'>
          <Button
            onClick={course.status === 'published' ? handleUnpublish : handlePublish}
            className='w-full shadow-primary'
            size='lg'
          >
            {course.status === 'published' ? 'Gỡ xuất bản' : 'Xuất bản khóa học'}
          </Button>
        </div>
      )}
    </div>
  )
}
