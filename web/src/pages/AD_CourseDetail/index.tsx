import { useEffect, useState } from 'react'
import { ArrowLeft, Check, X } from 'lucide-react'
import { Lesson } from '@/types/course.type'
import { CourseHero } from '@/components/TC_CourseDetail/CourseHero'
import { CourseSummary } from '@/components/TC_CourseDetail/CourseSummary'
import { AD_CurriculumAccordion } from '@/components/AD_CourseDetail/AD_CurriculumAccordion'
import { LearningOutcomes } from '@/components/TC_CourseDetail/LearningOutcomes'
import { Prerequisites } from '@/components/TC_CourseDetail/Prerequisites'
import { FullDescription } from '@/components/TC_CourseDetail/FullDescription'
import { ReviewsList } from '@/components/TC_CourseDetail/ReviewsList'
import { StatsSidebar } from '@/components/TC_CourseDetail/StatsSidebar'
import { VideoModal } from '@/components/TC_CourseDetail/VideoModal'
import {
  LessonPreviewModal,
  type AdminPreviewLesson,
} from '@/components/AD_CourseDetail/LessonPreviewModal'
import { CourseReviewModal } from '@/components/AD_CourseDetail/CourseReviewModal'
import { Button } from '@/components/ui/button'
import { useParams, useNavigate } from 'react-router-dom'
import courseAdminService from '@/services/course/course-admin.service'
import { CourseHeroSkeleton } from '@/components/TC_CourseDetail/Skeleton/CourseHeroSkeleton'
import { CourseContentSkeleton } from '@/components/TC_CourseDetail/Skeleton/CourseContentSkeleton'
import { StatsSidebarSkeleton } from '@/components/TC_CourseDetail/Skeleton/StatsSidebarSkeleton'
import noPhotoImage from '@/assets/images/no-photo.avif'
import { toast } from 'sonner'

interface CourseResponseDTO {
  id: string
  title: string
  thumbnailUrl?: string
  shortDescription?: string
  description?: string
  status: string
  reason?: string
  price?: number
  introductoryVideo?: string
  createdAt?: string
  tagNames?: string[]
  categories?: string[]
  chapters?: Array<{
    id: string
    title: string
    order?: number
    position?: number
    lessons?: Array<{
      id: string
      title: string
      type?: string
      duration?: string | number
      url?: string
      content?: string
      isPublic?: boolean
    }>
  }>
  reviews?: Array<{
    id: string
    reviewerName: string
    reviewerAvatar?: string
    rating: number
    comment: string
    date: string
  }>
  learningOutcomes?: string[]
  prerequisites?: string[]
  instructor?: {
    id: string
    name: string
    avatarUrl?: string
    bio?: string
  }
  totalEnrollments?: number
}

import { normalizeLessonType } from '@/utils/lessonType.utils'
import type { LessonType } from '@/types/course.type'

function mapCourseFromApi(data: Record<string, unknown>): CourseResponseDTO {
  const outcomes = data.outcomes as Set<string> | string[] | undefined
  const requirements = data.requirements as Set<string> | string[] | undefined
  const rawChapters = (data.chapters as CourseResponseDTO['chapters']) || []

  const chapters = rawChapters.map((chapter) => ({
    ...chapter,
    lessons: (chapter.lessons || []).map((lesson) => ({
      ...lesson,
      type: normalizeLessonType(lesson.type, {
        url: lesson.url,
        content: lesson.content,
      }),
    })),
  }))

  return {
    id: String(data.id),
    title: String(data.title || ''),
    thumbnailUrl: (data.thumbnailUrl as string) || undefined,
    shortDescription: (data.shortDescription as string) || undefined,
    description: (data.longDescription as string) || (data.description as string) || '',
    status: String(data.status || 'DRAFT'),
    reason: (data.reason as string) || undefined,
    price: (data.finalPrice as number) ?? (data.price as number),
    introductoryVideo: (data.introductoryVideo as string) || '',
    createdAt: data.createdAt ? String(data.createdAt) : undefined,
    tagNames: (data.tags as string[]) || (data.tagNames as string[]) || [],
    categories: data.category ? [String(data.category)] : (data.categories as string[]) || [],
    learningOutcomes: outcomes
      ? Array.isArray(outcomes)
        ? outcomes
        : Array.from(outcomes)
      : (data.learningOutcomes as string[]) || [],
    prerequisites: requirements
      ? Array.isArray(requirements)
        ? requirements
        : Array.from(requirements)
      : (data.prerequisites as string[]) || [],
    totalEnrollments: Array.isArray(data.enrollments)
      ? data.enrollments.length
      : (data.totalEnrollments as number) || 0,
    chapters,
    reviews: (data.reviews as CourseResponseDTO['reviews']) || [],
    instructor: data.instructor as CourseResponseDTO['instructor'],
  }
}

function mapLessonToSectionItem(lesson: NonNullable<NonNullable<CourseResponseDTO['chapters']>[number]['lessons']>[number]) {
  const type = normalizeLessonType(lesson.type, {
    url: lesson.url,
    content: lesson.content,
  }) as LessonType

  return {
    id: lesson.id,
    title: lesson.title,
    type,
    duration: String(lesson.duration ?? 0),
    videoUrl: lesson.url,
    completed: false,
  }
}

export default function AD_CourseDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [course, setCourse] = useState<CourseResponseDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [previewLesson, setPreviewLesson] = useState<AdminPreviewLesson | null>(null)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null)

  const fetchCourse = async () => {
    if (!id) return
    try {
      setLoading(true)
      const response = await courseAdminService.getCourseDetailAdmin(id)
      if (response.code === 200 && response.result) {
        setCourse(mapCourseFromApi(response.result as Record<string, unknown>))
      }
    } catch (error) {
      console.error('Failed to fetch course:', error)
      toast.error('Không thể tải thông tin khóa học')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourse()
  }, [id])

  const openReviewModal = (action: 'approve' | 'reject') => {
    setReviewAction(action)
    setReviewModalOpen(true)
  }

  const handleApprove = async () => {
    if (!id) return
    const res = await courseAdminService.aprovalCourse(id)
    if (res?.code === 200) {
      toast.success('Khóa học đã được phê duyệt')
      navigate('/admin/courses')
      return
    }
    toast.error(res?.message || 'Phê duyệt thất bại')
    throw new Error('approve failed')
  }

  const handleReject = async (reason: string) => {
    if (!id) return
    const res = await courseAdminService.rejectCourse(id, reason)
    if (res?.code === 200) {
      toast.success('Đã từ chối khóa học')
      navigate('/admin/courses')
      return
    }
    toast.error(res?.message || 'Từ chối thất bại')
    throw new Error('reject failed')
  }

  const handleBack = () => {
    navigate('/admin/courses')
  }

  const handleViewLesson = (lesson: Lesson) => {
    const raw = course?.chapters
      ?.flatMap((ch) => ch.lessons || [])
      .find((l) => l.id === lesson.id)

    setPreviewLesson({
      id: lesson.id,
      title: lesson.title,
      type: normalizeLessonType(raw?.type ?? lesson.type, {
        url: raw?.url ?? lesson.videoUrl,
        content: raw?.content,
      }),
      duration: lesson.duration,
      videoUrl: lesson.videoUrl,
      content: raw?.content,
      isPublic: raw?.isPublic,
    })
  }

  if (loading) {
    return (
      <div className="space-y-5 lg:space-y-8">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
          <div className="space-y-5 lg:col-span-2 lg:space-y-6">
            <CourseHeroSkeleton />
            <CourseContentSkeleton />
          </div>
          <aside className="hidden lg:col-span-1 lg:block">
            <StatsSidebarSkeleton />
          </aside>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-slate-500">Không tìm thấy khóa học</p>
      </div>
    )
  }

  const normalizedStatus = course.status.toLowerCase()
  const canReview = normalizedStatus === 'pending_review' || normalizedStatus === 'rejected'
  const mappedSections = (course.chapters || []).map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    order: chapter.order ?? chapter.position ?? 0,
    lessons: (chapter.lessons || []).map(mapLessonToSectionItem),
  }))

  return (
    <div className="space-y-5 lg:space-y-8">
      {canReview && (
        <div className="flex justify-end gap-2">
          <Button
            onClick={() => openReviewModal('approve')}
            className="rounded-full bg-emerald-600 hover:bg-emerald-700"
          >
            <Check className="mr-1.5 h-4 w-4" />
            Phê duyệt
          </Button>
          <Button
            variant="destructive"
            onClick={() => openReviewModal('reject')}
            className="rounded-full"
          >
            <X className="mr-1.5 h-4 w-4" />
            Từ chối
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        <div className="space-y-5 lg:col-span-2 lg:space-y-6">
          <CourseHero
            title={course.title}
            coverImage={course.thumbnailUrl || noPhotoImage}
            status={normalizedStatus}
            publishedAt={course.createdAt || ''}
            price={course.price}
            courseStatus={normalizedStatus}
            onPlayIntro={() => setIsVideoModalOpen(true)}
            onEdit={() => {}}
            introductoryVideo={course.introductoryVideo || ''}
            rejectionReason={course.reason}
          />

          {course.learningOutcomes && course.learningOutcomes.length > 0 && (
            <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.22)]">
              <LearningOutcomes outcomes={course.learningOutcomes} />
            </div>
          )}

          {course.prerequisites && course.prerequisites.length > 0 && (
            <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.22)]">
              <Prerequisites prerequisites={course.prerequisites} />
            </div>
          )}

          <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_18px_40px_-30px_rgba(15,23,42,0.22)]">
            <AD_CurriculumAccordion
              sections={mappedSections}
              courseId={course.id}
              onViewLesson={handleViewLesson}
            />
          </div>

          {course.reviews && course.reviews.length > 0 && (
            <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.22)]">
              <ReviewsList reviews={course.reviews} />
            </div>
          )}
        </div>

        <div className="space-y-5 lg:col-span-1 lg:space-y-6">
          <div className="sticky top-6 space-y-5 self-start lg:space-y-6">
            <StatsSidebar
              revenue={0}
              studentsCount={course.totalEnrollments || 0}
              rating={0}
              status={course.status === 'PUBLISHED' ? 'published' : 'draft'}
            />
            <CourseSummary
              shortDescription={course.shortDescription || ''}
              studentsCount={course.totalEnrollments || 0}
              rating={0}
              reviewsCount={course.reviews?.length || 0}
              category={course.categories?.[0]}
              tags={course.tagNames || []}
            />
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={handleBack}
        className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Quay lại danh sách
      </Button>

      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl={course.introductoryVideo || ''}
        title={course.title}
      />

      <LessonPreviewModal
        open={previewLesson !== null}
        onClose={() => setPreviewLesson(null)}
        lesson={previewLesson}
      />

      <CourseReviewModal
        open={reviewModalOpen}
        onOpenChange={setReviewModalOpen}
        initialAction={reviewAction}
        courseTitle={course.title}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  )
}
