import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
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
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import courseService from '@/services/course/course.service'
import { ApiResponse } from '@/types/response.type'
import { Loader } from '@/components/ui/loader'
import courseAdminService from '@/services/course/course-admin.service'

interface CourseResponseDTO {
  id: string
  title: string
  thumbnailUrl?: string
  shortDescription?: string
  description?: string
  status: string
  price?: number
  introductoryVideo?: string
  createdAt?: string
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
      url?: string
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
  const location = useLocation()
  const isAdminPage = location.pathname.startsWith('/admin')

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
        let res: ApiResponse<any>
        if (isAdminPage) {
          res = await courseAdminService.getCourseDetailAdmin(id)
        } else {
          res = await courseService.getCourseDetail(id)
        }
        if (!mounted) return
        const data = res.result
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
          introductoryVideo: data.introductoryVideo || data.videoIntro || '',
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
              url: l.url || l.url || undefined
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
  }, [id, isAdminPage])

  const goBack = () => navigate(-1)

  return (
    <div className='min-h-screen bg-white-200'>
      {/* Header */}
      {!isAdminPage && (
        <>
          <header className='sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
            <div className='container mx-auto px-4 py-4'>
              <div className='flex items-center justify-between'>
                <Button variant='ghost' size='sm' className='gap-2' onClick={goBack}>
                  <ArrowLeft className='h-4 w-4' /> Quay lại
                </Button>
              </div>
            </div>
          </header>
        </>
      )}

      {/* Main Content */}
      <main className='container mx-auto px-4 py-8'>
        {loading && <Loader />}
        {!loading && error && (
          <div className='flex flex-col items-center justify-center py-20 gap-4'>
            <p className='text-destructive font-medium'>Không tải được khoá học: {error}</p>
            <Button variant='outline' onClick={() => window.location.reload()}>
              Thử lại
            </Button>
          </div>
        )}
        {!loading && !error && course && (
          <div className={isAdminPage ? 'grid gap-8 lg:grid-cols-1' : 'grid gap-8 lg:grid-cols-[1fr_320px]'}>
            {/* Left Column - Main Content */}
            <div className='space-y-8'>
              <CourseHero
                title={course.title}
                coverImage={course.thumbnailUrl || '/placeholder.png'}
                introductoryVideo={course?.introductoryVideo || ''}
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
                    videoUrl: l.url || undefined
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
            {!isAdminPage && (
              <aside className='hidden lg:block'>
                <StatsSidebar
                  revenue={(course.price || 0) * (course.students || 0)}
                  studentsCount={course.students || 0}
                  rating={course.rating || 5}
                  status={course.status === 'published' ? 'published' : 'draft'}
                />
              </aside>
            )}
          </div>
        )}
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
    </div>
  )
}
