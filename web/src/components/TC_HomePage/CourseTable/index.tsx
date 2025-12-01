import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Layers, Activity } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import courseService from '@/services/course/course.service'
import { Course } from '@/components/TC_Courses/CourseTypes'
import CourseProgressStep from '@/types/courseProgressStep'
import { ScrollArea } from '@/components/ui/scroll-area'

// Map backend status to Vietnamese label
const toVietnameseStatus = (status?: string | null) => {
  switch (status) {
    case 'PUBLISHED':
      return 'Hoạt động'
    case 'DRAFT':
      return 'Bản nháp'
    case 'PENDING_REVIEW':
      return 'Chờ xử lý'
    default:
      return status || 'Khác'
  }
}

// helper màu trạng thái (theo label đã map)
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Hoạt động':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'Bản nháp':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'Chờ xử lý':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    default:
      return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
  }
}

// Tính % hoàn thành dựa vào progressStep
const calcProgressPercent = (step?: string | null) => {
  const order = [
    CourseProgressStep.INTRO,
    CourseProgressStep.CURRICULUM,
    CourseProgressStep.PRICING,
    CourseProgressStep.SETTINGS,
    CourseProgressStep.COMPLETED
  ]
  if (!step) return 0
  const idx = order.indexOf(step as CourseProgressStep)
  if (idx < 0) return 0
  const percent = Math.round(((idx + 1) / order.length) * 100)
  return Math.min(100, Math.max(0, percent))
}

const CourseTable = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    const fetch = async () => {
      setLoading(true)
      try {
        const res = await courseService.getTeacherCourses(undefined, { page: 1, limit: 10 })
        const payload = res.result
        const list = (payload?.items as any[]) || []
        const mapped: Course[] = list.map((c, idx) => ({
          id: String(c.id ?? `temp-${idx}`),
          title: c.title ?? 'Chưa có tiêu đề',
          shortDescription: c.shortDescription ?? null,
          longDescription: c.longDescription ?? null,
          thumbnailUrl: c.thumbnailUrl ?? null,
          language: c.language ?? null,
          originalPrice: c.originalPrice ?? null,
          finalPrice: c.finalPrice ?? null,
          status: (c.status as Course['status']) ?? 'DRAFT',
          instructorId: c.instructorId ?? null,
          chapterIds: c.chapterIds ?? null,
          enrollmentIds: c.enrollmentIds ?? null,
          tagNames: c.tagNames ?? null,
          categoryName: c.category ?? null,
          progressStep: c.progressStep ?? null,
          outcomes: c.outcomes ?? null,
          requirements: c.requirements ?? null
        }))
        if (mounted) setCourses(mapped)
      } catch (e) {
        console.error('Failed to load teacher courses', e)
        if (mounted) setCourses([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetch()
    return () => {
      mounted = false
    }
  }, [])

  const rows = useMemo(() => {
    return courses.map((c) => ({
      name: c.title,
      type: c.categoryName || '—',
      statusLabel: toVietnameseStatus(c.status),
      progress: calcProgressPercent(c.progressStep),
      thumbnail: c.thumbnailUrl || undefined
    }))
  }, [courses])

  return (
    <Card className='shadow-xl border-0 rounded-2xl overflow-hidden mb-4'>
      <CardHeader className='bg-gradient-to-r from-primary to-indigo-500 text-white rounded-lg mt-0'>
        <CardTitle className='flex items-center gap-2 text-lg md:text-xl font-bold py-2'>
          <BookOpen size={22} className='mt-2' />
          <p className='text-lg opacity-90 mt-1'>Quản lý và theo dõi tiến độ học tập</p>
        </CardTitle>
      </CardHeader>

      <CardContent className='p-4 md:p-6'>
        <div className='space-y-2 md:space-y-3'>
          {/* Headers */}
          <div className='grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 py-2 text-xs md:text-sm font-semibold text-zinc-600 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700'>
            <div className='pl-3'>Tên khóa</div>
            <div>Thể loại</div>
            <div className='hidden md:block'>Trạng thái</div>
            <div className='hidden md:block'>Hoàn thành</div>
            <div></div>
          </div>

          {/* Rows with overlay scrollbar to avoid layout shift */}
          <ScrollArea className='max-h-[380px] md:max-h-[460px] overflow-hidden'>
            {loading && (
              <div className='py-6 text-center text-sm text-zinc-500 dark:text-zinc-400'>Đang tải dữ liệu…</div>
            )}
            {!loading && rows.length === 0 && (
              <div className='py-6 text-center text-sm text-zinc-500 dark:text-zinc-400'>Chưa có khóa học</div>
            )}
            {!loading &&
              rows.map((course, index) => (
                <div
                  key={index}
                  className='grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 py-3 items-center rounded-lg bg-white dark:bg-zinc-900 hover:shadow-md hover:scale-[1.01] transition-all duration-300 border border-zinc-100 dark:border-zinc-800'
                >
                  {/* Tên khóa */}
                  <div className='flex items-center gap-2 pl-3'>
                    <Layers className='text-primary' size={18} />
                    <span className='font-semibold text-primary text-base line-clamp-1'>{course.name}</span>
                  </div>

                  {/* Loại */}
                  <div>
                    <Badge
                      variant='outline'
                      className='text-xs px-2 py-0.5 rounded-md text-zinc-600 dark:text-zinc-300'
                    >
                      {course.type}
                    </Badge>
                  </div>

                  {/* Trạng thái */}
                  <div className='hidden md:block'>
                    <Badge className={`${getStatusColor(course.statusLabel)} px-2 md:px-3 py-1 rounded-lg`}>
                      {course.statusLabel}
                    </Badge>
                  </div>

                  {/* Progress */}
                  <div className='hidden md:flex items-center gap-3'>
                    <div className='flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full'
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <span className='text-xs md:text-sm font-medium text-zinc-600 dark:text-zinc-300'>
                      {course.progress}%
                    </span>
                  </div>

                  <div className='flex justify-end pr-3'>
                    <Activity className='text-zinc-400 hover:text-primary cursor-pointer' size={18} />
                  </div>
                </div>
              ))}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}

export default CourseTable
