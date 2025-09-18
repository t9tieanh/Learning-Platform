import React, { Component } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext
} from '@/components/ui/pagination'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MoreHorizontal, Search } from 'lucide-react'

type CourseStatus = 'active' | 'pending' | 'closed'

interface Course {
  id: number
  title: string
  tags: string[]
  duration: string
  students: number
  createdAt: string
  image: string
  status: CourseStatus
}

interface State {
  courses: Course[]
}

class TC_Course extends Component<{}, State> {
  state: State = {
    courses: [
      {
        id: 1,
        title: 'Spring Boot v1',
        tags: ['Java', 'Spring', 'MySQL'],
        duration: '48 giờ 26 phút',
        students: 16,
        createdAt: '04/08/2024',
        image:
          'https://images.shiksha.com/mediadata/ugcDocuments/images/wordpressImages/2022_08_MicrosoftTeams-image-13-2-1.jpg',
        status: 'closed'
      },
      {
        id: 2,
        title: 'React v1',
        tags: ['React', 'Frontend'],
        duration: '30 giờ 26 phút',
        students: 42,
        createdAt: '04/09/2024',
        image:
          'https://images.shiksha.com/mediadata/ugcDocuments/images/wordpressImages/2022_08_MicrosoftTeams-image-13-2-1.jpg',
        status: 'pending'
      },
      {
        id: 3,
        title: 'MongoDB (Mongoose)',
        tags: ['Database', 'NoSQL'],
        duration: '25 giờ 26 phút',
        students: 27,
        createdAt: '12/09/2024',
        image:
          'https://images.shiksha.com/mediadata/ugcDocuments/images/wordpressImages/2022_08_MicrosoftTeams-image-13-2-1.jpg',
        status: 'active'
      }
    ]
  }

  getStatusBadge(status: CourseStatus) {
    switch (status) {
      case 'active':
        return (
          <Badge className='bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200 px-3 py-1.5 text-xs rounded-full'>
            Hoạt động
          </Badge>
        )
      case 'pending':
        return (
          <Badge className='bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200 px-3 py-1.5 text-xs rounded-full'>
            Chờ duyệt
          </Badge>
        )
      case 'closed':
        return (
          <Badge className='bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200 px-3 py-1.5 text-xs rounded-full'>
            Tạm đóng
          </Badge>
        )
    }
  }

  render() {
    const { courses } = this.state

    return (
      <div className='p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-950 min-h-screen transition-colors'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
          {/* Search */}
          <div className='relative w-full sm:w-1/3'>
            <Search className='absolute left-3 top-3 w-5 h-5 text-blue-400 peer-focus:text-blue-600 transition-colors' />
            <input
              type='text'
              placeholder='Tìm kiếm khóa học...'
              className='peer w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm transition'
            />
          </div>

          {/* Create Button */}
          <Button className='bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition'>
            Tạo khóa học
          </Button>
        </div>

        {/* Course Table */}
        <div className='overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm'>
          <Table className='min-w-[700px]'>
            <TableHeader>
              <TableRow className='bg-blue-100 dark:bg-slate-800'>
                <TableHead className='p-3 sm:p-6 text-blue-600 dark:text-gray-300'>Khóa học</TableHead>
                <TableHead className='p-3 sm:p-6 text-blue-600 dark:text-gray-300'>Trạng thái</TableHead>
                <TableHead className='p-3 sm:p-6 text-blue-600 dark:text-gray-300'>Học viên</TableHead>
                <TableHead className='p-3 sm:p-6 text-blue-600 dark:text-gray-300'>Thời lượng</TableHead>
                <TableHead className='p-3 sm:p-6 text-blue-600 dark:text-gray-300'>Ngày tạo</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow
                  key={course.id}
                  className='hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all'
                >
                  <TableCell className='p-3 sm:p-4 flex items-center gap-3 sm:gap-4'>
                    <img
                      src={course.image}
                      alt={course.title}
                      className='w-20 h-14 sm:w-28 sm:h-20 rounded-lg object-cover shadow-sm'
                    />
                    <div>
                      <div className='font-semibold text-gray-700 dark:text-gray-100 text-base sm:text-lg'>
                        {course.title}
                      </div>
                      <div className='flex flex-wrap gap-2 mt-2'>
                        {course.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className='px-2 py-0.5 text-[10px] sm:text-xs rounded-full bg-indigo-50 text-blue-700 dark:bg-slate-700 dark:text-indigo-300 shadow-sm'
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='px-4'>{this.getStatusBadge(course.status)}</TableCell>
                  <TableCell className='text-gray-700 dark:text-gray-300 px-10'>{course.students}</TableCell>
                  <TableCell className='text-gray-700 dark:text-gray-300'>{course.duration}</TableCell>
                  <TableCell className='text-gray-500 dark:text-gray-400 text-xs sm:text-sm px-5'>
                    {course.createdAt}
                  </TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='rounded-full transition-all hover:bg-blue-50 hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-200'
                        >
                          <MoreHorizontal className='w-5 h-5' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='rounded-xl shadow-lg border border-gray-100'>
                        <DropdownMenuItem className='rounded-md px-3 py-2 text-sm transition-colors data-[highlighted]:bg-blue-500 data-[highlighted]:text-white'>
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem className='rounded-md px-3 py-2 text-sm transition-colors data-[highlighted]:bg-blue-500 data-[highlighted]:text-white'>
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem className='rounded-md px-3 py-2 text-sm text-red-600 transition-colors data-[highlighted]:bg-red-500 data-[highlighted]:text-white'>
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <Pagination className='pt-6 flex justify-center'>
          <PaginationContent className='gap-1 sm:gap-2'>
            <PaginationItem>
              <PaginationPrevious
                href='#'
                className='sm:px-3 py-1 text-xs sm:text-sm text-blue-600 transition hover:bg-transparent hover:text-blue-600 hover:scale-105 hover:underline'
              >
                Trước
              </PaginationPrevious>
            </PaginationItem>
            {[1, 2, 3, 4].map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href='#'
                  isActive={page === 1}
                  className={`rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-medium shadow-sm text-xs sm:text-sm transition-transform duration-300 ease-in-out hover:scale-110
          ${
            page === 1
              ? 'bg-blue-400 text-white hover:bg-blue-600'
              : 'bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white'
          }`}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href='#'
                className='sm:px-3 py-1 text-xs sm:text-sm text-blue-600 transition hover:bg-transparent hover:text-blue-600 hover:scale-105 hover:underline'
              >
                Sau
              </PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    )
  }
}

export default TC_Course
