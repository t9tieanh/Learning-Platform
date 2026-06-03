import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import courseAdminInstructorService from '@/services/course/course-admin-instructor.service'
import type { AdminInstructorCoursesResult, AdminInstructorSummaryResult } from '@/types/admin-instructor'
import {
  ArrowLeft,
  Award,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  GraduationCap,
  Mail,
  Star,
  Users
} from 'lucide-react'

const summaryCardClass =
  'rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.22)]'

const formatNumber = (value: number) => new Intl.NumberFormat('vi-VN').format(value)
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)

const courseStatusBadgeClass: Record<string, string> = {
  PUBLISHED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  DRAFT: 'border-slate-200 bg-slate-100 text-slate-700',
  PENDING_REVIEW: 'border-amber-200 bg-amber-50 text-amber-700',
  REJECTED: 'border-rose-200 bg-rose-50 text-rose-700'
}

const courseStatusText: Record<string, string> = {
  PUBLISHED: 'Đã xuất bản',
  DRAFT: 'Bản nháp',
  PENDING_REVIEW: 'Chờ duyệt',
  REJECTED: 'Bị từ chối'
}

const monthLabel = (month: number) => `T${month}`

export default function AD_InstructorDetail() {
  const { instructorId } = useParams()
  const navigate = useNavigate()
  const [summary, setSummary] = useState<AdminInstructorSummaryResult | null>(null)
  const [courses, setCourses] = useState<AdminInstructorCoursesResult | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [coursesError, setCoursesError] = useState<string | null>(null)
  const [coursePage, setCoursePage] = useState(1)

  useEffect(() => {
    let active = true
    const fetchSummary = async () => {
      if (!instructorId) return
      setSummaryLoading(true)
      setSummaryError(null)
      try {
        const res = await courseAdminInstructorService.getAdminInstructorSummary(instructorId, new Date().getFullYear())
        if (!active) return
        setSummary(res.result ?? null)
      } catch (e: any) {
        if (!active) return
        setSummaryError(e?.response?.data?.message || e?.message || 'Không thể tải tổng quan giảng viên')
        setSummary(null)
      } finally {
        if (active) setSummaryLoading(false)
      }
    }

    void fetchSummary()
    return () => {
      active = false
    }
  }, [instructorId])

  useEffect(() => {
    let active = true
    const fetchCourses = async () => {
      if (!instructorId) return
      setCoursesLoading(true)
      setCoursesError(null)
      try {
        const res = await courseAdminInstructorService.getAdminInstructorCourses(instructorId, {
          page: coursePage,
          limit: 5
        })
        if (!active) return
        setCourses(res.result ?? null)
      } catch (e: any) {
        if (!active) return
        setCoursesError(e?.response?.data?.message || e?.message || 'Không thể tải danh sách khóa học')
        setCourses(null)
      } finally {
        if (active) setCoursesLoading(false)
      }
    }

    void fetchCourses()
    return () => {
      active = false
    }
  }, [coursePage, instructorId])

  const maxMonthlyRevenue = useMemo(
    () => Math.max(...(summary?.revenueSnapshot.monthlyRevenue.map((item) => item.revenue) ?? [1])),
    [summary]
  )

  if (!instructorId) {
    return null
  }

  return (
    <div className='space-y-5 lg:space-y-8'>
      <section className='relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 px-4 py-6 text-white shadow-[0_24px_60px_-34px_rgba(15,23,42,0.55)] sm:rounded-[32px] sm:px-6 sm:py-7'>
        <div className='absolute -right-8 top-0 h-40 w-40 rounded-full bg-cyan-400/15 blur-3xl' />
        <div className='absolute bottom-0 left-10 h-28 w-28 rounded-full bg-blue-300/10 blur-3xl' />
        <div className='relative space-y-6'>
          <Button
            variant='outline'
            className='rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white'
            onClick={() => navigate('/admin/instructors')}
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Quay lại danh sách
          </Button>

          {summaryLoading && !summary ? (
            <div className='rounded-2xl border border-white/10 bg-white/5 px-5 py-8 text-sm text-slate-200'>
              Đang tải tổng quan giảng viên...
            </div>
          ) : summaryError && !summary ? (
            <div className='rounded-2xl border border-rose-300/30 bg-rose-500/10 px-5 py-8 text-sm text-rose-100'>
              {summaryError}
            </div>
          ) : summary ? (
            <div className='flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between'>
              <div className='flex flex-col gap-5 sm:flex-row sm:items-start'>
                <Avatar className='h-24 w-24 ring-4 ring-white/10'>
                  <AvatarImage src={summary.profile.avatar} alt={summary.profile.name} className='object-cover' />
                  <AvatarFallback>{summary.profile.name.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <div className='max-w-3xl'>
                  <div className='flex flex-wrap items-center gap-3'>
                    <p className='text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80'>
                      Hồ sơ giảng viên
                    </p>
                    <Badge className='rounded-full border-white/10 bg-white/10 px-3 py-1 text-white'>
                      {summary.metrics.courseCount >= 5
                        ? 'Giảng viên hàng đầu'
                        : summary.metrics.courseCount >= 3
                          ? 'Đang hoạt động'
                          : 'Đang tăng trưởng'}
                    </Badge>
                  </div>
                  <h1 className='mt-3 text-3xl font-semibold tracking-tight'>{summary.profile.name}</h1>
                  <p className='mt-2 text-sm font-medium text-cyan-100'>{summary.profile.headline}</p>
                  <div className='mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-300'>
                    <span className='inline-flex items-center gap-2'>
                      <Mail className='h-4 w-4' />
                      {summary.profile.email}
                    </span>
                  </div>
                  <p className='mt-4 max-w-2xl text-sm leading-6 text-slate-300'>
                    {summary.profile.description || 'Chưa cập nhật mô tả.'}
                  </p>
                  <div className='mt-4 flex flex-wrap gap-2'>
                    {summary.profile.expertise.map((item) => (
                      <Badge key={item} className='rounded-full border-white/10 bg-white/10 px-3 py-1 text-white'>
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <Card className={summaryCardClass}>
          <div className='flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600'>
              <BookOpen className='h-5 w-5' />
            </div>
            <div>
              <p className='text-sm font-medium text-slate-500'>Khóa học</p>
              <p className='mt-1 text-2xl font-semibold text-slate-950'>{summary?.metrics.courseCount ?? 0}</p>
            </div>
          </div>
        </Card>
        <Card className={summaryCardClass}>
          <div className='flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600'>
              <DollarSign className='h-5 w-5' />
            </div>
            <div>
              <p className='text-sm font-medium text-slate-500'>Tổng doanh thu</p>
              <p className='mt-1 text-2xl font-semibold text-slate-950'>
                {formatCurrency(summary?.metrics.totalRevenue ?? 0)}
              </p>
            </div>
          </div>
        </Card>
        <Card className={summaryCardClass}>
          <div className='flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600'>
              <Users className='h-5 w-5' />
            </div>
            <div>
              <p className='text-sm font-medium text-slate-500'>Học viên</p>
              <p className='mt-1 text-2xl font-semibold text-slate-950'>
                {formatNumber(summary?.metrics.studentsCount ?? 0)}
              </p>
            </div>
          </div>
        </Card>
        <Card className={summaryCardClass}>
          <div className='flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600'>
              <Award className='h-5 w-5' />
            </div>
            <div>
              <p className='text-sm font-medium text-slate-500'>Chứng chỉ cá nhân</p>
              <p className='mt-1 text-2xl font-semibold text-slate-950'>
                {formatNumber(summary?.personalCertificates.totalCertificates ?? 0)}
              </p>
            </div>
          </div>
        </Card>
      </section>

      <section className='grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]'>
        <Card className='rounded-[30px] border border-slate-200/80 bg-white/95 shadow-[0_22px_55px_-36px_rgba(15,23,42,0.24)]'>
          <div className='border-b border-slate-200/80 px-6 py-5'>
            <h2 className='text-lg font-semibold tracking-tight text-slate-950'>Khóa học phụ trách</h2>
            <p className='mt-1 text-sm text-slate-500'>
              Danh sách khóa học đã tách riêng thành API phân trang phía máy chủ.
            </p>
          </div>
          <div className='overflow-x-auto'>
            <Table className='min-w-[760px]'>
              <TableHeader>
                <TableRow className='border-b border-slate-200 bg-slate-50/70 hover:bg-slate-50/70'>
                  <TableHead className='px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>
                    Khóa học
                  </TableHead>
                  <TableHead className='px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>
                    Học viên
                  </TableHead>
                  <TableHead className='px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>
                    Doanh thu
                  </TableHead>
                  <TableHead className='px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>
                    Đánh giá
                  </TableHead>
                  <TableHead className='px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>
                    Trạng thái
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coursesLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className='px-6 py-12 text-center text-sm text-slate-500'>
                      Đang tải danh sách khóa học...
                    </TableCell>
                  </TableRow>
                ) : coursesError ? (
                  <TableRow>
                    <TableCell colSpan={5} className='px-6 py-12 text-center text-sm text-rose-600'>
                      {coursesError}
                    </TableCell>
                  </TableRow>
                ) : (courses?.items.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className='px-6 py-12 text-center text-sm text-slate-500'>
                      Chưa có khóa học nào để hiển thị.
                    </TableCell>
                  </TableRow>
                ) : (
                  courses?.items.map((course) => (
                    <TableRow key={course.id} className='border-b border-slate-100 hover:bg-sky-50/40'>
                      <TableCell className='px-6 py-4'>
                        <div>
                          <button
                            type='button'
                            onClick={() => navigate(`/admin/course/${course.id}`)}
                            className='font-medium text-slate-950 hover:text-sky-600 transition-colors text-left'
                          >
                            {course.title}
                          </button>
                          <p className='mt-1 text-sm text-slate-500'>{course.category || 'Không có danh mục'}</p>
                        </div>
                      </TableCell>
                      <TableCell className='px-6 py-4 text-slate-700'>{formatNumber(course.studentsCount)}</TableCell>
                      <TableCell className='px-6 py-4 font-medium text-emerald-700'>
                        {formatCurrency(course.revenue)}
                      </TableCell>
                      <TableCell className='px-6 py-4'>
                        <span className='inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-amber-700'>
                          <Star className='h-4 w-4 fill-current' />
                          {course.rating.toFixed(1)}
                        </span>
                      </TableCell>
                      <TableCell className='px-6 py-4'>
                        <Badge
                          variant='outline'
                          className={`rounded-full px-3 py-1 ${courseStatusBadgeClass[course.status] ?? courseStatusBadgeClass.DRAFT
                            }`}
                        >
                          {courseStatusText[course.status] ?? course.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className='flex flex-col gap-3 border-t border-slate-200/80 bg-slate-50/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6'>
            <p className='text-sm text-slate-500'>
              Đang xem trang <span className='font-medium text-slate-700'>{courses?.page ?? 1}</span> trên tổng{' '}
              <span className='font-medium text-slate-700'>{courses?.totalPages ?? 1}</span> trang.
            </p>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                className='rounded-full border-slate-200 bg-white'
                disabled={!courses || courses.page <= 1 || coursesLoading}
                onClick={() => setCoursePage((value) => Math.max(1, value - 1))}
              >
                <ChevronLeft className='mr-1 h-4 w-4' />
                Trước
              </Button>
              <Button
                variant='outline'
                className='rounded-full border-slate-200 bg-white'
                disabled={!courses || !courses.hasNext || coursesLoading}
                onClick={() => setCoursePage((value) => value + 1)}
              >
                Sau
                <ChevronRight className='ml-1 h-4 w-4' />
              </Button>
            </div>
          </div>
        </Card>

        <div className='space-y-4'>
          <Card className='rounded-[30px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_22px_55px_-36px_rgba(15,23,42,0.24)]'>
            <h2 className='text-lg font-semibold tracking-tight text-slate-950'>Chứng chỉ cá nhân của giảng viên</h2>
            {(summary?.personalCertificates.items.length ?? 0) === 0 && !summaryLoading ? (
              <div className='mt-5 rounded-3xl border border-dashed border-slate-200/80 bg-slate-50 px-5 py-6 text-slate-600'>
                <div className='flex items-center gap-3'>
                  <Award className='h-5 w-5 text-amber-500' />
                  <p className='text-sm font-semibold text-slate-900'>Chưa có chứng chỉ cá nhân đã xác nhận.</p>
                </div>
                <p className='mt-2 text-sm text-slate-500'>
                  Giảng viên này chưa cập nhật chứng chỉ, vui lòng kiểm tra lại hồ sơ hoặc chờ xác nhận.
                </p>
              </div>
            ) : (
              <div className='mt-5 grid gap-6 md:grid-cols-2'>
                {(summary?.personalCertificates.items ?? []).map((certificate) => (
                  <div key={certificate.id} className='rounded-2xl border border-slate-200 bg-slate-50/70 p-4'>
                    <div className='inline-flex rounded-full bg-amber-50 p-2 text-amber-700'>
                      <Award className='h-4 w-4' />
                    </div>
                    <p className='mt-4 font-medium text-slate-950'>{certificate.title}</p>
                    <p className='mt-1 text-sm text-slate-500'>{certificate.organization}</p>
                    <p className='mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'>
                      {certificate.issueDate || 'Không rõ ngày cấp'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className='rounded-[30px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_22px_55px_-36px_rgba(15,23,42,0.24)]'>
            <h2 className='text-lg font-semibold tracking-tight text-slate-950'>Doanh thu theo tháng</h2>
            <div className='mt-5 space-y-3'>
              {(summary?.revenueSnapshot.monthlyRevenue ?? []).map((item) => (
                <div key={item.month} className='rounded-2xl border border-slate-200 bg-slate-50/70 p-4'>
                  <div className='flex items-center justify-between gap-3'>
                    <p className='text-sm font-medium text-slate-700'>{monthLabel(item.month)}</p>
                    <p className='text-sm font-semibold text-emerald-700'>{formatCurrency(item.revenue)}</p>
                  </div>
                  <div className='mt-3 h-2 rounded-full bg-slate-200'>
                    <div
                      className='h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600'
                      style={{ width: `${Math.max(18, Math.round((item.revenue / maxMonthlyRevenue) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}
