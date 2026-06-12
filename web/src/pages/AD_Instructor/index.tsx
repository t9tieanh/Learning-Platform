import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import courseAdminInstructorService from '@/services/course/course-admin-instructor.service'
import type { AdminInstructorListItem, AdminInstructorListResult } from '@/types/admin-instructor'
import { ChevronLeft, ChevronRight, Eye, ListFilter, Search } from 'lucide-react'
import useDebounce from '@/hooks/useDebounce.hook'
import { AdminInstructorsTableSkeleton } from '@/components/Admin/Skeleton'

export default function Instructors() {
  const navigate = useNavigate()
  const [data, setData] = useState<AdminInstructorListResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'courses_desc' | 'courses_asc'>('courses_desc')
  const [courseFilter, setCourseFilter] = useState<'' | 'low' | 'mid' | 'high'>('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search, 350)

  useEffect(() => {
    let active = true
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await courseAdminInstructorService.getAdminInstructors({
          page,
          limit: 10,
          search: debouncedSearch || undefined,
          sort: sortBy,
          courseRange: courseFilter || undefined
        })
        if (!active) return
        setData(res.result ?? null)
      } catch (e: any) {
        if (!active) return
        setError(e?.response?.data?.message || e?.message || 'Không thể tải danh sách giảng viên')
        setData(null)
      } finally {
        if (active) setLoading(false)
      }
    }

    void fetchData()
    return () => {
      active = false
    }
  }, [courseFilter, debouncedSearch, page, sortBy])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, sortBy, courseFilter])

  return (
    <div className='space-y-5 lg:space-y-8'>
      <section className='relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-4 py-6 text-white shadow-[0_24px_60px_-34px_rgba(15,23,42,0.55)] sm:rounded-[32px] sm:px-6 sm:py-7'>
        <div className='absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-400/15 blur-3xl' />
        <div className='absolute bottom-0 left-12 h-28 w-28 rounded-full bg-sky-300/10 blur-3xl' />
        <div className='relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between'>
          <div className='max-w-2xl'>
            <p className='text-xs font-semibold uppercase tracking-[0.28em] text-blue-200/80'>TỔNG QUAN GIẢNG VIÊN</p>
            <h1 className='mt-2 text-3xl font-semibold tracking-tight'>Quản lý giảng viên</h1>
            <p className='mt-2 text-sm leading-6 text-slate-300'>
              Theo dõi danh sách giảng viên, khóa học đang giảng dạy và các chỉ số hoạt động trên hệ thống.
            </p>
          </div>
        </div>
      </section>

      <Card className='overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/95 shadow-[0_22px_55px_-36px_rgba(15,23,42,0.24)] sm:rounded-[30px]'>
        <div className='border-b border-slate-200/80 bg-slate-50/80 px-4 py-4 sm:px-6 sm:py-5'>
          <div className='flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between'>
            <div>
              <h2 className='text-lg font-semibold tracking-tight text-slate-950'>Danh sách giảng viên</h2>
            </div>

            <div className='flex w-full flex-col gap-3 xl:max-w-4xl xl:flex-row xl:items-center'>
              <div className='relative w-full xl:flex-1'>
                <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder='Tìm theo tên hoặc email giảng viên'
                  className='h-11 rounded-xl border-slate-200 bg-white pl-9 pr-3 text-sm'
                />
              </div>

              <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                <SelectTrigger className='h-11 w-full rounded-xl border-slate-200 bg-white text-sm xl:w-[210px]'>
                  <SelectValue placeholder='Sắp xếp' />
                </SelectTrigger>
                <SelectContent className='rounded-xl border-slate-200 bg-white'>
                  <SelectItem value='name_asc'>Tên A-Z</SelectItem>
                  <SelectItem value='name_desc'>Tên Z-A</SelectItem>
                  <SelectItem value='courses_desc'>Nhiều khóa học nhất</SelectItem>
                  <SelectItem value='courses_asc'>Ít khóa học nhất</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className='overflow-x-auto'>
          {loading ? (
            <AdminInstructorsTableSkeleton rows={10} />
          ) : (
          <Table className='min-w-[820px]'>
            <TableHeader>
              <TableRow className='border-b border-slate-200 bg-slate-50/70 hover:bg-slate-50/70'>
                <TableHead className='px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>
                  Giảng viên
                </TableHead>
                <TableHead className='px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>
                  Email
                </TableHead>
                <TableHead className='px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>
                  Số khóa học
                </TableHead>
                <TableHead className='px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>
                  Hành động
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {error ? (
                <TableRow>
                  <TableCell colSpan={4} className='px-6 py-16 text-center text-sm text-rose-600'>
                    {error}
                  </TableCell>
                </TableRow>
              ) : (data?.items.length ?? 0) === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className='px-6 py-16 text-center text-sm text-slate-500'>
                    Không tìm thấy giảng viên phù hợp với bộ lọc hiện tại.
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((instructor: AdminInstructorListItem) => (
                  <TableRow
                    key={instructor.id}
                    className='border-b border-slate-100 transition-colors hover:bg-sky-50/40'
                  >
                    <TableCell className='px-6 py-4'>
                      <div className='flex items-center gap-4'>
                        <Avatar className='h-12 w-12 ring-2 ring-slate-100'>
                          <AvatarImage src={instructor.avatar} alt={instructor.name} className='object-cover' />
                          <AvatarFallback>{instructor.name.slice(0, 1)}</AvatarFallback>
                        </Avatar>
                        <p className='font-medium text-slate-950'>{instructor.name}</p>
                      </div>
                    </TableCell>
                    <TableCell className='px-6 py-4 text-sm text-slate-500'>{instructor.email}</TableCell>
                    <TableCell className='px-6 py-4 text-sm font-medium text-slate-700'>
                      {instructor.courseCount} khóa
                    </TableCell>
                    <TableCell className='px-6 py-4 text-right'>
                      <Button
                        variant='outline'
                        className='rounded-full border-slate-200 bg-white px-4 text-slate-700 hover:bg-slate-50'
                        onClick={() => navigate(`/admin/instructors/${instructor.id}`)}
                      >
                        <Eye className='mr-2 h-4 w-4' />
                        Xem chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          )}
        </div>

        <div className='flex flex-col gap-3 border-t border-slate-200/80 bg-slate-50/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6'>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              className='rounded-full border-slate-200 bg-white'
              disabled={!data || data.page <= 1 || loading}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              <ChevronLeft className='mr-1 h-4 w-4' />
              Trước
            </Button>
            <Button
              variant='outline'
              className='rounded-full border-slate-200 bg-white'
              disabled={!data || !data.hasNext || loading}
              onClick={() => setPage((value) => value + 1)}
            >
              Sau
              <ChevronRight className='ml-1 h-4 w-4' />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
