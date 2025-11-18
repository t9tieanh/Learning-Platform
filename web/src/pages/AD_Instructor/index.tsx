import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import courseService, { AdminInstructorSummary } from '@/services/course/course.service'
import { Lock, Unlock, Users, UserCheck, UserX } from 'lucide-react'
import { toast } from 'sonner'

export default function Instructors() {
  type APIInstructor = AdminInstructorSummary

  type InstructorRow = {
    name: string
    email: string
    courseCount: number
  }

  const [instructors, setInstructors] = useState<InstructorRow[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedInstructor, setSelectedInstructor] = useState<InstructorRow | null>(null)

  const handleToggleStatus = (instructor: InstructorRow) => {
    setSelectedInstructor(instructor)
  }

  const stats = {
    total: instructors.length
  }

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await courseService.getAdminInstructors()
        if (data.code !== 200 || !Array.isArray(data.result)) {
          throw new Error(data?.message || 'Không lấy được danh sách giảng viên')
        }
        const mapped: InstructorRow[] = data.result.map((it: APIInstructor) => ({
          name: it.instructorName,
          email: it.instructorEmail,
          courseCount: it.totalCourse
        }))
        setInstructors(mapped)
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Lỗi khi tải danh sách giảng viên'
        setError(msg)
        toast.error(msg)
      } finally {
        setLoading(false)
      }
    }
    fetchInstructors()
  }, [])

  return (
    <div className='space-y-8 p-6'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent'>
          Quản lý giảng viên
        </h2>
        <p className='text-muted-foreground mt-2'>Danh sách người đăng khóa học trên hệ thống</p>
      </div>

      {/* Quick Stats */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card className='p-4 border-none shadow-md bg-gradient-to-br from-background to-primary/5'>
          <div className='flex items-center gap-3'>
            <div className='p-3 bg-primary/10 rounded-lg'>
              <Users className='h-5 w-5 text-primary' />
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Tổng giảng viên</p>
              <p className='text-2xl font-bold'>{stats.total}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className='rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden'>
        {loading ? (
          <div className='p-8 text-center text-muted-foreground'>Đang tải danh sách giảng viên...</div>
        ) : error ? (
          <div className='p-8 text-center text-red-500'>{error}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className='bg-blue-50 border-b border-gray-200'>
                <TableHead className='text-gray-700 font-semibold py-4 px-4'>Tên</TableHead>
                <TableHead className='text-gray-700 font-semibold py-4 px-4'>Email</TableHead>
                <TableHead className='text-gray-700 font-semibold py-4 px-4'>Số khóa học</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {instructors.map((instructor) => (
                <TableRow
                  key={instructor.email}
                  className='group hover:bg-blue-50/30 transition-colors border-b border-gray-100 last:border-0'
                >
                  <TableCell className='py-4 px-4 font-medium text-gray-900'>{instructor.name}</TableCell>
                  <TableCell className='py-4 px-4 text-gray-700'>{instructor.email}</TableCell>
                  <TableCell className='py-4 px-4'>
                    <Badge variant='outline' className='bg-blue-50 text-blue-700 border-blue-200 font-medium'>
                      {instructor.courseCount} khóa
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
