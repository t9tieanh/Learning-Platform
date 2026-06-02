import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Eye, BookOpen, Clock3, Search, ListFilter } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import courseAdminService, {
  AdminCourseStatusFilter,
  CourseAdminItem,
  CoursesAdminResult
} from '@/services/course/course-admin.service'
import useDebounce from '@/hooks/useDebounce.hook'

const summaryCardClass =
  'rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.22)]'

const statusLabelMap: Record<AdminCourseStatusFilter, string> = {
  PENDING_REVIEW: 'Chờ duyệt',
  PUBLISHED: 'Đã xuất bản',
  REJECTED: 'Bị từ chối'
}

export default function CoursesAdmin() {
  const [data, setData] = useState<CoursesAdminResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | AdminCourseStatusFilter>('ALL')
  const navigate = useNavigate()
  const debouncedSearch = useDebounce(search, 350)

  useEffect(() => {
    let mounted = true
    const fetch = async () => {
      setLoading(true)
      try {
        const res = await courseAdminService.getCoursesAdmin({
          page: pageIndex,
          limit: pageSize,
          search: debouncedSearch || undefined,
          status: statusFilter === 'ALL' ? undefined : statusFilter
        })
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
  }, [debouncedSearch, pageIndex, pageSize, statusFilter])

  useEffect(() => {
    setPageIndex(0)
  }, [debouncedSearch, statusFilter])

  const stats = useMemo(() => {
    const items = data?.items ?? []
    return {
      total: data?.totalElements ?? 0,
      pending: items.filter((c) => c.status === 'PENDING_REVIEW').length ?? 0
    }
  }, [data])

  const statusBadge = (status?: string | null) => {
    switch (status) {
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
    <div className='space-y-5 lg:space-y-8'>
      <section className='relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-4 py-6 text-white shadow-[0_24px_60px_-34px_rgba(15,23,42,0.55)] sm:px-6 sm:py-7 sm:rounded-[32px]'>
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
          <div className='w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm sm:w-auto'>
            <p className='text-xs uppercase tracking-[0.18em] text-slate-300'>Trang hiện tại</p>
            <p className='mt-3 text-2xl font-semibold text-white'>{pageIndex + 1}</p>
          </div>
        </div>
      </section>

      <section className='grid gap-4 md:grid-cols-2'>
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
      </section>

      <Card className='overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/95 shadow-[0_22px_55px_-36px_rgba(15,23,42,0.24)] sm:rounded-[30px]'>
        <div className='border-b border-slate-200/80 bg-slate-50/80 px-4 py-4 sm:px-6 sm:py-5'>
          <div className='flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between'>
            <div>
              <h2 className='text-lg font-semibold tracking-tight text-slate-950'>Danh sách khóa học</h2>
              <p className='mt-1 text-sm text-slate-500'>Tập trung vào thông tin cốt lõi để duyệt nhanh hơn.</p>
            </div>

            <div className='flex w-full flex-col gap-3 lg:max-w-2xl lg:flex-row xl:w-auto'>
              <div className='relative w-full lg:flex-1'>
                <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder='Tìm theo tên khóa học'
                  className='h-11 rounded-xl border-slate-200 bg-white pl-9 pr-3 text-sm'
                />
              </div>

              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'ALL' | AdminCourseStatusFilter)}>
                <SelectTrigger className='h-11 w-full rounded-xl border-slate-200 bg-white text-sm lg:w-[220px]'>
                  <span className='inline-flex items-center gap-2'>
                    <ListFilter className='h-4 w-4 text-slate-400' />
                    <SelectValue placeholder='Lọc trạng thái' />
                  </span>
                </SelectTrigger>
                <SelectContent className='rounded-xl border-slate-200 bg-white'>
                  <SelectItem value='ALL'>Tất cả trạng thái</SelectItem>
                  <SelectItem value='PENDING_REVIEW'>Chờ duyệt</SelectItem>
                  <SelectItem value='PUBLISHED'>Đã xuất bản</SelectItem>
                  <SelectItem value='REJECTED'>Bị từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className='border-b border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-500 sm:px-6'>
          <span className='font-medium text-slate-700'>Tổng kết quả:</span> {data?.totalElements ?? 0}
          {statusFilter !== 'ALL' && (
            <span className='ml-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600'>
              {statusLabelMap[statusFilter]}
            </span>
          )}
        </div>

        <div className='hidden overflow-x-auto lg:block'>
          <Table className='min-w-[980px]'>
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
                    Không có khóa học nào phù hợp với bộ lọc hiện tại.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className='space-y-4 p-4 lg:hidden'>
          {loading && (
            <div className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm font-medium text-slate-500'>
              Đang tải...
            </div>
          )}

          {!loading &&
            data?.items.map((course: CourseAdminItem) => (
              <article key={course.id} className='rounded-3xl border border-slate-200 bg-white p-4 shadow-sm'>
                <div className='flex items-start gap-3'>
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className='h-16 w-24 rounded-2xl object-cover ring-1 ring-slate-200'
                    />
                  ) : (
                    <div className='flex h-16 w-24 items-center justify-center rounded-2xl bg-slate-100 text-slate-400'>
                      <BookOpen className='h-4 w-4' />
                    </div>
                  )}
                  <div className='min-w-0 flex-1'>
                    <p className='line-clamp-2 font-semibold text-slate-950'>{course.title}</p>
                    <p className='mt-1 text-sm text-slate-500'>{course.instructor?.name || 'Chưa có giảng viên'}</p>
                    <p className='truncate text-xs text-slate-400'>{course.instructor?.email || 'Không có email'}</p>
                  </div>
                </div>

                <p className='mt-3 line-clamp-2 text-sm text-slate-500'>{course.shortDescription || 'Chưa có mô tả ngắn.'}</p>

                <div className='mt-4 grid gap-3 sm:grid-cols-2'>
                  <div className='rounded-2xl bg-slate-50 px-3 py-2'>
                    <p className='text-xs uppercase tracking-[0.16em] text-slate-400'>Tiến độ</p>
                    <p className='mt-1 text-sm font-medium text-slate-700'>{progressLabel(course.progressStep)}</p>
                  </div>
                  <div className='rounded-2xl bg-slate-50 px-3 py-2'>
                    <p className='text-xs uppercase tracking-[0.16em] text-slate-400'>Trạng thái</p>
                    <div className='mt-1'>{statusBadge(course.status)}</div>
                  </div>
                </div>

                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => navigate(`/admin/course/${course.id}`)}
                  className='mt-4 h-11 w-full rounded-2xl border-slate-200 bg-white text-slate-700 shadow-sm hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700'
                >
                  <Eye className='mr-2 h-4 w-4' />
                  Xem chi tiết
                </Button>
              </article>
            ))}

          {!loading && !data?.items?.length && (
            <div className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500'>
              Không có khóa học nào phù hợp với bộ lọc hiện tại.
            </div>
          )}
        </div>

        <div className='flex flex-col gap-4 border-t border-slate-200/80 bg-slate-50/70 px-4 py-4 sm:px-6 sm:flex-row sm:items-center sm:justify-between'>
          <div className='text-sm text-slate-500'>Tổng {data?.totalElements ?? 0} khóa học</div>
          <div className='flex flex-wrap items-center gap-2'>
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
