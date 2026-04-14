import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Eye, BookOpen, Clock3, Rocket } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import courseAdminService, { CourseAdminItem, CoursesAdminResult } from '@/services/course/course-admin.service'

const summaryCardClass =
  'rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.22)]'

export default function CoursesAdmin() {
  const [data, setData] = useState<CoursesAdminResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize] = useState(10)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    const fetch = async () => {
      setLoading(true)
      try {
        const res = await courseAdminService.getCoursesAdmin(pageIndex, pageSize)
        if (res.code === 200) {
          if (mounted) setData(res.result as CoursesAdminResult)
        }
      } catch (e) {
        console.error('Failed to fetch admin courses', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetch()
    return () => {
      mounted = false
    }
  }, [pageIndex, pageSize])

  const stats = useMemo(() => {
    const items = data?.items ?? []
    return {
      total: data?.totalElements ?? 0,
      pending: items.filter((c) => c.status === 'PENDING_REVIEW').length ?? 0,
      published: items.filter((c) => c.status === 'PUBLISHED').length ?? 0
    }
  }, [data])

  const statusBadge = (status?: string | null) => {
    switch (status) {
      case 'DRAFT':
        return <Badge className='rounded-full border-slate-200 bg-slate-100 px-3 py-1 text-slate-700'>Bản nháp</Badge>
      case 'PENDING_REVIEW':
        return <Badge className='rounded-full border-amber-200 bg-amber-50 px-3 py-1 text-amber-700'>Chờ duyệt</Badge>
      case 'PUBLISHED':
        return (
          <Badge className='rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700'>
            Đã xuất bản
          </Badge>
        )
      case 'REJECTED':
        return <Badge className='rounded-full border-rose-200 bg-rose-50 px-3 py-1 text-rose-700'>Bị từ chối</Badge>
      case 'ARCHIVED':
        return <Badge className='rounded-full border-slate-200 bg-slate-100 px-3 py-1 text-slate-500'>Lưu trữ</Badge>
      default:
        return <Badge className='rounded-full border-slate-200 bg-slate-100 px-3 py-1 text-slate-700'>Không rõ</Badge>
    }
  }

  const progressLabel = (step?: string | null) => {
    switch (step) {
      case 'INTRO':
        return 'Giới thiệu'
      case 'CURRICULUM':
        return 'Giáo trình'
      case 'PRICING':
        return 'Định giá'
      case 'SETTINGS':
        return 'Cài đặt'
      case 'COMPLETED':
        return 'Hoàn thành'
      default:
        return '-'
    }
  }

  return (
    <div className='space-y-8'>
      <section className='relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-6 py-7 text-white shadow-[0_24px_60px_-34px_rgba(15,23,42,0.55)]'>
        <div className='absolute -top-6 right-6 h-36 w-36 rounded-full bg-sky-400/15 blur-3xl' />
        <div className='absolute bottom-0 left-8 h-24 w-24 rounded-full bg-cyan-300/10 blur-3xl' />
        <div className='relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between'>
          <div className='max-w-2xl'>
            <p className='text-xs font-semibold uppercase tracking-[0.28em] text-sky-200/80'>Course operations</p>
            <h1 className='mt-3 text-3xl font-semibold tracking-tight'>Quản lý khóa học</h1>
            <p className='mt-2 text-sm leading-6 text-slate-300'>
              Theo dõi tiến độ xuất bản và kiểm tra nhanh các khóa học trên hệ thống trong bố cục rõ ràng, dễ quét.
            </p>
          </div>
          <div className='rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm'>
            <p className='text-xs uppercase tracking-[0.18em] text-slate-300'>Trang hiện tại</p>
            <p className='mt-3 text-2xl font-semibold text-white'>{pageIndex + 1}</p>
          </div>
        </div>
      </section>

      <section className='grid gap-4 md:grid-cols-3'>
        <Card className={summaryCardClass}>
          <div className='flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600'>
              <BookOpen className='h-5 w-5' />
            </div>
            <div>
              <p className='text-sm font-medium text-slate-500'>Tổng khóa học</p>
              <p className='mt-1 text-2xl font-semibold text-slate-950'>{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className={summaryCardClass}>
          <div className='flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600'>
              <Clock3 className='h-5 w-5' />
            </div>
            <div>
              <p className='text-sm font-medium text-slate-500'>Chờ duyệt</p>
              <p className='mt-1 text-2xl font-semibold text-slate-950'>{stats.pending}</p>
            </div>
          </div>
        </Card>
        <Card className={summaryCardClass}>
          <div className='flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600'>
              <Rocket className='h-5 w-5' />
            </div>
            <div>
              <p className='text-sm font-medium text-slate-500'>Đã xuất bản</p>
              <p className='mt-1 text-2xl font-semibold text-slate-950'>{stats.published}</p>
            </div>
          </div>
        </Card>
      </section>

      <Card className='overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/95 shadow-[0_22px_55px_-36px_rgba(15,23,42,0.24)]'>
        <div className='border-b border-slate-200/80 bg-slate-50/80 px-6 py-5'>
          <h2 className='text-lg font-semibold tracking-tight text-slate-950'>Danh sách khóa học</h2>
          <p className='mt-1 text-sm text-slate-500'>Tập trung vào thông tin cốt lõi để duyệt nhanh hơn.</p>
        </div>

        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow className='border-b border-slate-200 bg-slate-50/70 hover:bg-slate-50/70'>
                <TableHead className='px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>
                  Tên khóa học
                </TableHead>
                <TableHead className='px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>
                  Người đăng
                </TableHead>
                <TableHead className='px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>
                  Tiến độ
                </TableHead>
                <TableHead className='px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>
                  Trạng thái
                </TableHead>
                <TableHead className='px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>
                  Hành động
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={5} className='px-6 py-16 text-center text-sm font-medium text-slate-500'>
                    Đang tải...
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                data?.items.map((course: CourseAdminItem) => (
                  <TableRow
                    key={course.id}
                    className='group border-b border-slate-100 transition-colors hover:bg-sky-50/40'
                  >
                    <TableCell className='px-6 py-4'>
                      <div className='flex items-center gap-4'>
                        {course.thumbnailUrl ? (
                          <img
                            src={course.thumbnailUrl}
                            alt={course.title}
                            className='h-14 w-20 rounded-2xl object-cover ring-1 ring-slate-200'
                          />
                        ) : (
                          <div className='flex h-14 w-20 items-center justify-center rounded-2xl bg-slate-100 text-slate-400'>
                            <BookOpen className='h-4 w-4' />
                          </div>
                        )}
                        <div className='min-w-0'>
                          <p className='truncate font-medium text-slate-950'>{course.title}</p>
                          <p className='mt-1 max-w-md truncate text-sm text-slate-500'>{course.shortDescription}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        {course.instructor?.image ? (
                          <img
                            src={course.instructor.image}
                            className='h-10 w-10 rounded-full object-cover ring-2 ring-slate-100'
                            alt={course.instructor.name}
                          />
                        ) : (
                          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500'>
                            {(course.instructor?.name || '?').slice(0, 1)}
                          </div>
                        )}
                        <div className='min-w-0'>
                          <p className='truncate font-medium text-slate-900'>{course.instructor?.name}</p>
                          <p className='truncate text-sm text-slate-500'>{course.instructor?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className='px-6 py-4'>
                      <span className='inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-600'>
                        {progressLabel(course.progressStep)}
                      </span>
                    </TableCell>
                    <TableCell className='px-6 py-4'>{statusBadge(course.status)}</TableCell>
                    <TableCell className='px-6 py-4 text-right'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => navigate(`/admin/course/${course.id}`)}
                        className='rounded-xl border-slate-200 bg-white px-4 text-slate-700 shadow-sm hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700'
                      >
                        <Eye className='mr-2 h-4 w-4' />
                        Xem chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

              {!loading && !data?.items?.length && (
                <TableRow>
                  <TableCell colSpan={5} className='px-6 py-16 text-center text-sm text-slate-500'>
                    Không có khóa học nào trong trang này.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className='flex flex-col gap-4 border-t border-slate-200/80 bg-slate-50/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='text-sm text-slate-500'>Tổng {data?.totalElements ?? 0} khóa học</div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={pageIndex === 0}
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
              className='rounded-xl border-slate-200 bg-white'
            >
              Trước
            </Button>
            <div className='rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600'>
              Trang {data ? data.page ?? pageIndex + 1 : pageIndex + 1} / {data?.totalPages ?? '-'}
            </div>
            <Button
              variant='outline'
              size='sm'
              disabled={data ? pageIndex + 1 >= data.totalPages : true}
              onClick={() => setPageIndex((p) => p + 1)}
              className='rounded-xl border-slate-200 bg-white'
            >
              Sau
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
