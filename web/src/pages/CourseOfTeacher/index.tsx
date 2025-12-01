import { ProfileHeader } from '@/components/CourseOfTeacher/ProfileHeader'
import { ProfileStats } from '@/components/CourseOfTeacher/ProfileStats'
import { ProfileAbout } from '@/components/CourseOfTeacher/ProfileAbout'
import { ProfileSidebar } from '@/components/CourseOfTeacher/ProfileSidebar'
import { CourseCard } from '@/components/CourseOfTeacher/CourseCard'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import CourseService from '@/services/course/course.service'
import UserService from '@/services/user/user.service'
import CertificateService from '@/services/certificate/certificate.service'

type UICourse = {
  title: string
  image: string
  rating?: number
  hours?: string
}

const CourseOfTeacher = () => {
  const { id } = useParams<{ id: string }>()
  const [profile, setProfile] = useState<any | null>(null)
  const [courses, setCourses] = useState<UICourse[]>([])
  const [totalCourses, setTotalCourses] = useState(0)
  const [certificates, setCertificates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const pageSize = 4
  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCourses / pageSize)), [totalCourses, pageSize])

  useEffect(() => {
    let mounted = true
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        // 1) Profile
        const p = await UserService.getInstructorProfile(id ?? '')
        const prof = p.result
        if (!mounted) return
        setProfile(prof)

        const userId = id

        // 2) Certificates
        if (userId) {
          const certRes = await CertificateService.getCertificates(String(userId))
          if (!mounted) return
          setCertificates(certRes.result || [])
        } else {
          setCertificates([])
        }

        // 3) Courses (paginated)
        const courseRes = await CourseService.getTeacherCourses(String(userId), {
          page,
          limit: pageSize,
          isPublic: true
        })
        console.log('COURSE', courseRes)
        if (!mounted) return
        const items = courseRes.result?.items ?? []
        setTotalCourses(courseRes.result?.totalElements ?? items.length ?? 0)
        const uiItems: UICourse[] = items.map((c: any) => ({
          title: c?.title || 'Khóa học',
          image: c?.thumbnailUrl || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop',
          rating: c?.rating || undefined,
          hours: c?.duration ? `${c.videoDuration} giờ` : undefined
        }))
        setCourses(uiItems)
      } catch (e: any) {
        if (!mounted) return
        setError(e?.message || 'Đã xảy ra lỗi khi tải dữ liệu')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => {
      mounted = false
    }
    // Re-fetch when page changes
  }, [page])

  const stats = useMemo(() => {
    return [
      { value: String(totalCourses), label: 'Tổng số khóa học' },
      { value: String(certificates?.length ?? 0), label: 'Chứng chỉ' }
    ]
  }, [totalCourses, certificates])

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-12 max-w-7xl'>
        <button
          onClick={() => navigate(-1)}
          className='flex items-center gap-2 text-sm font-medium bg-primary p-2 rounded-md text-white mb-6 hover:bg-blue-800'
        >
          <ArrowLeft className='w-4 h-4' />
          Quay lại
        </button>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-8'>
            <ProfileHeader
              name={profile?.name || ''}
              expertise={profile?.expertises?.map((e: any) => e.name)}
              badges={
                certificates
                  ?.filter((b) => b.status === 'CONFIRMED')
                  ?.map((b) => ({
                    label: b.title,
                    image: b.imageUrl
                  })) ?? []
              }
            />

            <ProfileStats stats={stats} />

            <ProfileAbout content={profile?.description ?? ''} />

            {/* Courses Section */}
            <div className='space-y-6'>
              <h2 className='text-2xl font-bold text-foreground'>Khóa học ({totalCourses})</h2>

              {/* List course */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {loading && <div className='col-span-2 text-center text-muted-foreground'>Đang tải khóa học…</div>}
                {!loading && courses.length === 0 && (
                  <div className='col-span-2 text-center text-muted-foreground'>Chưa có khóa học nào</div>
                )}
                {!loading && courses.map((course, index) => <CourseCard key={index} {...course} />)}
              </div>

              {/* Pagination */}
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => page > 1 && setPage(page - 1)}
                      className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink isActive={page === i + 1} onClick={() => setPage(i + 1)}>
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => page < totalPages && setPage(page + 1)}
                      className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>

          <div className='lg:col-span-1'>
            <ProfileSidebar image={profile?.image} name={profile?.name || 'Giảng viên'} />
            {error && <div className='mt-4 text-sm text-red-600'>{error}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseOfTeacher
