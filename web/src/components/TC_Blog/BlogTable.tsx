import { FC } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { MoreHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface BlogItem {
  id: string
  title: string
  image: string
  shortDescription: string
  createdAt: string
}

interface BlogTableProps {
  courses: BlogItem[]
}

const BlogTable: FC<BlogTableProps> = ({ courses }) => {
  const navigate = useNavigate()

  return (
    <div className='overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm'>
      <Table className='min-w-[700px]'>
        <TableHeader>
          <TableRow className='bg-blue-100 dark:bg-slate-800'>
            <TableHead className='p-3 sm:p-6 text-blue-600 dark:text-gray-300'>
              Bài viết
            </TableHead>
            <TableHead className='p-3 sm:p-6 text-blue-600 dark:text-gray-300'>
              Ngày tạo
            </TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((blog) => (
            <TableRow
              key={blog.id}
              className='hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all cursor-pointer'
              onClick={() => navigate(`/teacher/blog/${blog.id}`)}
            >
              <TableCell className='p-3 sm:p-4 flex items-center gap-3 sm:gap-4'>
                <img
                  src={
                    blog.image ||
                    'https://img.freepik.com/premium-vector/no-photo-available-vector-icon-default-image-symbol-picture-coming-soon-web-site-mobile-app_87543-18055.jpg'
                  }
                  alt={blog.title}
                  className='w-20 h-14 sm:w-28 sm:h-20 rounded-lg object-cover shadow-sm'
                />
                <div>
                  <div className='font-semibold text-gray-700 dark:text-gray-100 text-base sm:text-lg'>
                    {blog.title}
                  </div>
                  <p className='text-sm text-gray-400 dark:text-gray-500 font-light mt-1'>
                    {blog.shortDescription}
                  </p>
                </div>
              </TableCell>

              <TableCell className='text-gray-500 dark:text-gray-400 text-xs sm:text-sm px-5'>
                {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
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
                  <DropdownMenuContent
                    align='end'
                    className='rounded-xl shadow-lg border border-gray-100'
                  >
                    <DropdownMenuItem
                      className='rounded-md px-3 py-2 text-sm transition-colors data-[highlighted]:bg-blue-500 data-[highlighted]:text-white'
                      onClick={() => navigate(`/teacher/blog/${blog.id}`)}
                    >
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
  )
}

export default BlogTable
