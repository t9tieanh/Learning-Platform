import { FC, useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MoreHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { blogService } from '@/services/blog/blog.service'
import noPhoto from '@/assets/images/no-photo.avif'

interface BlogItem {
  id: string
  title: string
  image: string
  shortDescription: string
  createdAt: string
  userName: string
  userAvt: string
}

interface BlogTableProps {
  courses: BlogItem[]
  onDeleted?: (id: string) => void
  base?: 'teacher' | 'admin'
}

const BlogTable: FC<BlogTableProps> = ({ courses, onDeleted, base = 'teacher' }) => {
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [targetId, setTargetId] = useState<string | null>(null)

  const askDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setTargetId(id)
    setConfirmOpen(true)
  }

  const handleDelete = async () => {
    if (!targetId) return
    try {
      const res = await blogService.remove(targetId)
      if (res?.deleted) {
        toast.success('Đã xóa bài viết')
        onDeleted?.(targetId)
      } else {
        toast.error('Không tìm thấy bài viết để xóa')
      }
    } catch (err) {
      console.error(err)
      toast.error('Xóa bài viết thất bại')
    } finally {
      setConfirmOpen(false)
      setTargetId(null)
    }
  }

  return (
    <div className='overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm'>
      <Table className='min-w-[700px]'>
        <TableHeader>
          <TableRow className='bg-blue-100 dark:bg-slate-800'>
            <TableHead className='p-3 sm:p-6 text-blue-600 dark:text-gray-300'>Bài viết</TableHead>
            <TableHead className='p-3 sm:p-6 text-blue-600 dark:text-gray-300'>Ngày tạo</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className='text-center py-10 text-gray-500 dark:text-gray-400'>
                Hiện tại bạn chưa có bài viết nào
              </TableCell>
            </TableRow>
          ) : (
            courses.map((blog) => (
              <TableRow
                key={blog.id}
                className='hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all cursor-pointer'
                onClick={() => navigate(`/${base}/blog/${blog.id}`)}
              >
                <TableCell className='p-3 sm:p-4 flex items-center gap-3 sm:gap-4'>
                  <img
                    src={blog.image || noPhoto}
                    alt={blog.title}
                    className='w-20 h-14 sm:w-28 sm:h-20 rounded-lg object-cover shadow-sm'
                  />
                  <div>
                    <div className='font-semibold text-gray-700 dark:text-gray-100 text-base sm:text-lg'>
                      {blog.title}
                    </div>
                    <p className='text-sm text-gray-400 dark:text-gray-500 font-light mt-1'>
                      <div className='text-gray-700' dangerouslySetInnerHTML={{ __html: blog.shortDescription }} />
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
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className='w-5 h-5' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='rounded-xl shadow-lg border border-gray-100'>
                      <DropdownMenuItem
                        className='rounded-md px-3 py-2 text-sm transition-colors data-[highlighted]:bg-blue-500 data-[highlighted]:text-white'
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/${base}/blog/${blog.id}`)
                        }}
                      >
                        Xem chi tiết
                      </DropdownMenuItem>
                      {base === 'teacher' && (
                        <>
                          <DropdownMenuItem
                            className='rounded-md px-3 py-2 text-sm transition-colors data-[highlighted]:bg-blue-500 data-[highlighted]:text-white'
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/teacher/update-blog/${blog.id}`)
                            }}
                          >
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className='rounded-md px-3 py-2 text-sm text-red-600 transition-colors data-[highlighted]:bg-red-500 data-[highlighted]:text-white'
                            onClick={(e) => askDelete(e, blog.id)}
                          >
                            Xóa
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa bài viết</DialogTitle>
          </DialogHeader>
          <p className='text-sm text-muted-foreground'>
            Bạn có chắc muốn xóa bài viết này? Hành động này không thể hoàn tác.
          </p>
          <DialogFooter>
            <Button variant='outline' onClick={() => setConfirmOpen(false)}>
              Hủy
            </Button>
            <Button variant='destructive' onClick={handleDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BlogTable
