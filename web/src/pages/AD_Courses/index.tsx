import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Eye, BookOpen, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import courseAdminService, { CourseAdminItem, CoursesAdminResult } from '@/services/course/course-admin.service'

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
        return <Badge className='bg-gray-50 text-gray-700 border-gray-200'>Bản nháp</Badge>
      case 'PENDING_REVIEW':
        return <Badge className='bg-yellow-50 text-yellow-800 border-yellow-200'>Chờ duyệt</Badge>
      case 'PUBLISHED':
        return <Badge className='bg-green-50 text-green-800 border-green-200'>Đã xuất bản</Badge>
      case 'REJECTED':
        return <Badge className='bg-red-50 text-red-700 border-red-200'>Bị từ chối</Badge>
      case 'ARCHIVED':
        return <Badge className='bg-muted text-muted-foreground border-gray-200'>Lưu trữ</Badge>
      default:
        return <Badge className='bg-gray-50 text-gray-700 border-gray-200'>Không rõ</Badge>
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
    <div className='space-y-8 p-6'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent'>
          Quản lý khóa học
        </h2>
        <p className='text-muted-foreground mt-2'>Danh sách tất cả khóa học trên hệ thống</p>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <Card className='p-4 border-none shadow-md bg-gradient-to-br from-background to-primary/5'>
          <div className='flex items-center gap-3'>
            <div className='p-3 bg-primary/10 rounded-lg'>
              <BookOpen className='h-5 w-5 text-primary' />
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Tổng khóa học</p>
              <p className='text-2xl font-bold'>{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className='p-4 border-none shadow-md bg-gradient-to-br from-background to-primary/5'>
          <div className='flex items-center gap-3'>
            <div className='p-3 bg-primary/10 rounded-lg'>
              <Calendar className='h-5 w-5 text-primary' />
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Chờ duyệt (trong trang)</p>
              <p className='text-2xl font-bold'>{stats.pending}</p>
            </div>
          </div>
        </Card>
        <Card className='p-4 border-none shadow-md bg-gradient-to-br from-background to-primary/5'>
          <div className='flex items-center gap-3'>
            <div className='p-3 bg-primary/10 rounded-lg'>
              <BookOpen className='h-5 w-5 text-primary' />
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Đã xuất bản (trong trang)</p>
              <p className='text-2xl font-bold'>{stats.published}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className='rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow className='bg-blue-50 border-b border-gray-200'>
              <TableHead className='text-gray-700 font-semibold py-4 px-4'>Tên khóa học</TableHead>
              <TableHead className='text-gray-700 font-semibold py-4 px-4'>Người đăng</TableHead>
              <TableHead className='text-gray-700 font-semibold py-4 px-4'>Bước tiến độ</TableHead>
              <TableHead className='text-gray-700 font-semibold py-4 px-4'>Trạng thái</TableHead>
              <TableHead className='text-right text-gray-700 font-semibold py-4 px-4'>Hành động</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={5} className='py-6 text-center text-muted-foreground'>
                  Đang tải...
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              data?.items.map((course: CourseAdminItem) => (
                <TableRow
                  key={course.id}
                  className='group hover:bg-blue-50/40 transition-colors border-b border-gray-100 last:border-0'
                >
                  <TableCell className='py-4 px-4 font-medium text-gray-900'>
                    <div className='flex items-center gap-3'>
                      {course.thumbnailUrl && (
                        <img src={course.thumbnailUrl} alt={course.title} className='w-12 h-8 object-cover rounded' />
                      )}
                      <div>
                        <div className='font-medium'>{course.title}</div>
                        <div className='text-xs text-muted-foreground truncate max-w-md'>{course.shortDescription}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='py-4 px-4 text-gray-700'>
                    <div className='flex items-center gap-2'>
                      {course.instructor?.image && (
                        <img
                          src={course.instructor.image}
                          className='w-8 h-8 rounded-full'
                          alt={course.instructor.name}
                        />
                      )}
                      <div>
                        <div className='font-medium'>{course.instructor?.name}</div>
                        <div className='text-xs text-muted-foreground'>{course.instructor?.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='py-4 px-4'>{progressLabel(course.progressStep)}</TableCell>
                  <TableCell className='py-4 px-4'>{statusBadge(course.status)}</TableCell>
                  <TableCell className='py-4 px-4 text-right'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => navigate(`/admin/course/${course.id}`)}
                      className='border-gray-200 text-gray-700 shadow-sm hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all'
                    >
                      <Eye className='mr-2 h-4 w-4' />
                      Xem chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className='flex items-center justify-between p-4 border-t'>
          <div className='text-sm text-muted-foreground'>Tổng {data?.totalElements ?? 0} khóa học</div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={pageIndex === 0}
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
            >
              Trước
            </Button>
            <div className='text-sm'>
              Trang {data ? data.page ?? pageIndex + 1 : pageIndex + 1} / {data?.totalPages ?? '-'}
            </div>
            <Button
              variant='outline'
              size='sm'
              disabled={data ? pageIndex + 1 >= data.totalPages : true}
              onClick={() => setPageIndex((p) => p + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
