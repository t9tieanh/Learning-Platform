import { FC, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MoreHorizontal, Calendar, PenTool, Sparkles, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { blogService } from '@/services/blog/blog.service'
import noPhoto from '@/assets/images/no-photo.avif'
import CustomButton from '@/components/common/Button'
import { IoAddCircle } from 'react-icons/io5'
import courseUserService from '@/services/course/course-user.service'
import { useAuthStore } from '@/stores/useAuth.stores'

interface BlogItem {
  id: string
  title: string
  image: string
  shortDescription: string
  createdAt: string
}

interface BlogTableProps {
  courses: BlogItem[]
  onDeleted?: (id: string) => void
  base?: 'teacher' | 'admin'
}

const EmptyState: FC = () => {
  const navigate = useNavigate()
  const { data } = useAuthStore()
  const instructorId = data?.userId || (data as any)?.id
  const [courseCount, setCourseCount] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    let mounted = true
      ; (async () => {
        if (!instructorId) return
        try {
          setLoading(true)
          const res = await courseUserService.countInstructorCourseValid({ instructorId })
          const count = typeof res?.result === 'number' ? res.result : res?.result?.count ?? 0
          if (mounted) setCourseCount(count)
        } catch (e) {
          if (mounted) setCourseCount(0)
        } finally {
          if (mounted) setLoading(false)
        }
      })()
    return () => {
      mounted = false
    }
  }, [instructorId])

  const canCreate = (courseCount ?? 0) >= 5
  const tooltipMsg = !canCreate ? 'Cần tối thiểu 5 khóa học để viết bài' : undefined

  return (
    <div className='flex flex-col items-center justify-center py-28 px-6 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm'>
      <div className='mb-8 relative flex items-center justify-center'>
        <div className='w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center'>
          <PenTool className='w-10 h-10 text-blue-600' />
        </div>
      </div>

      <div className='text-center space-y-2 mb-8'>
        <h3 className='text-xl font-bold text-gray-900 tracking-tight'>Chưa có bài viết nào</h3>
        <p className='text-gray-500 text-sm font-medium max-w-[320px] mx-auto leading-relaxed'>
          Chia sẻ kiến thức chuyên môn của bạn với cộng đồng. Bài viết đầu tiên đang chờ bạn.
        </p>
      </div>

      <div className='relative group'>
        <CustomButton
          className={`min-w-[180px] h-12 rounded-xl text-sm font-bold transition-all ${!canCreate
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed mx-auto'
            : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-100 mx-auto'
            }`}
          label={loading ? 'Đang kiểm tra...' : 'Viết bài ngay'}
          icon={!loading && <IoAddCircle className='h-5 w-5 mr-1.5' />}
          onClick={() => {
            if (!canCreate) return
            navigate('/teacher/create-blog')
          }}
          disabled={!canCreate || loading}
        />

        {!canCreate && !loading && (
          <div className='absolute top-full mt-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-[11px] font-medium px-4 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none'>
            {tooltipMsg}
          </div>
        )}
      </div>
    </div>
  )
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

  if (courses.length === 0) return <EmptyState />

  return (
    <div className='relative overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-xl shadow-gray-200/50'>
      <Table className='min-w-[800px]'>
        <TableHeader>
          <TableRow className='bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-100'>
            <TableHead className='px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]'>Nội dung bài viết</TableHead>
            <TableHead className='px-6 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-center'>Ngày tạo</TableHead>
            <TableHead className='px-8 py-6' />
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((blog) => (
            <TableRow
              key={blog.id}
              className='group hover:bg-indigo-50/30 transition-all cursor-pointer border-b border-gray-50 last:border-0'
              onClick={() => navigate(`/${base}/blog/${blog.id}`)}
            >
              <TableCell className='px-8 py-5'>
                <div className='flex items-center gap-5'>
                  <div className='relative shrink-0 group/img'>
                    <img
                      src={blog.image || noPhoto}
                      alt={blog.title}
                      className='w-24 h-16 rounded-[1.25rem] object-cover shadow-md transition-transform duration-500 group-hover/img:scale-105'
                    />
                    <div className='absolute inset-0 rounded-[1.25rem] border border-black/5 group-hover:border-indigo-500/20 transition-all' />
                  </div>
                  <div className='space-y-1.5'>
                    <h4 className='font-black text-gray-900 text-[15px] tracking-tight group-hover:text-indigo-600 transition-colors truncate max-w-[400px]'>
                      {blog.title}
                    </h4>
                    <div className='text-gray-400 text-[11px] font-bold line-clamp-1 opacity-70' dangerouslySetInnerHTML={{ __html: blog.shortDescription }} />
                  </div>
                </div>
              </TableCell>

              <TableCell className='px-6 py-5 text-center'>
                <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors'>
                  <Calendar className='w-3 h-3' />
                  <span className='text-[10px] font-black uppercase tracking-wider'>
                    {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </TableCell>

              <TableCell className='px-8 py-5 text-right'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='w-10 h-10 rounded-xl transition-all hover:bg-white hover:shadow-xl hover:text-indigo-600'
                    >
                      <MoreHorizontal className='w-5 h-5' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='rounded-2xl shadow-2xl border border-gray-100 p-2 min-w-[160px]'>
                    <DropdownMenuItem
                      className='rounded-xl px-4 py-2.5 text-[12px] font-bold cursor-pointer transition-all focus:bg-indigo-600 focus:text-white'
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
                          className='rounded-xl px-4 py-2.5 text-[12px] font-bold cursor-pointer transition-all focus:bg-indigo-600 focus:text-white'
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/teacher/update-blog/${blog.id}`)
                          }}
                        >
                          Chỉnh sửa nội dung
                        </DropdownMenuItem>
                        <div className='h-px bg-gray-100 my-1 mx-2' />
                        <DropdownMenuItem
                          className='rounded-xl px-4 py-2.5 text-[12px] font-bold text-red-600 cursor-pointer transition-all focus:bg-red-600 focus:text-white'
                          onClick={(e) => askDelete(e, blog.id)}
                        >
                          Xóa bài viết
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className='max-w-md rounded-[2.5rem] border-none shadow-2xl overflow-hidden p-0'>
          <div className='p-8 bg-white'>
            <DialogHeader className='mb-4'>
              <DialogTitle className='text-2xl font-black text-gray-900 tracking-tight'>Xác nhận xóa</DialogTitle>
            </DialogHeader>
            <p className='text-gray-500 font-medium leading-relaxed mb-8'>
              Bạn có chắc muốn xóa bài viết này? Hành động này sẽ gỡ bỏ vĩnh viễn nội dung khỏi hệ thống và không thể hoàn tác.
            </p>
            <DialogFooter className='flex-col sm:flex-row gap-3'>
              <Button
                variant='outline'
                className='flex-1 h-12 rounded-xl font-bold border-gray-200 hover:bg-gray-50'
                onClick={() => setConfirmOpen(false)}
              >
                Giữ lại bài viết
              </Button>
              <Button
                variant='destructive'
                className='flex-1 h-12 rounded-xl font-bold bg-red-600 hover:bg-red-700 shadow-lg shadow-red-100'
                onClick={handleDelete}
              >
                Xác nhận xóa
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BlogTable
