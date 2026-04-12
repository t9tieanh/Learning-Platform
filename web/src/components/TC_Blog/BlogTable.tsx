import { FC, useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MoreHorizontal, Calendar, PenTool, Sparkles, Plus } from 'lucide-react'
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
}

interface BlogTableProps {
  courses: BlogItem[]
  onDeleted?: (id: string) => void
  base?: 'teacher' | 'admin'
}

const EmptyState: FC = () => {
  return (
    <div className='flex flex-col items-center justify-center py-24 px-6 bg-white rounded-[2.5rem] border border-dashed border-gray-200 shadow-sm'>
      <div className='w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mb-6 relative group'>
        <div className='absolute inset-0 bg-indigo-100 rounded-[2.5rem] scale-90 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500' />
        <PenTool className='w-10 h-10 text-indigo-500 relative z-10 transition-transform duration-500 group-hover:scale-110' />
        <Sparkles className='w-5 h-5 text-indigo-400 absolute top-0 right-0 animate-bounce' />
      </div>
      <h3 className='text-xl font-black text-gray-900 mb-2 tracking-tight uppercase'>Chưa có bài viết nào</h3>
      <p className='text-gray-400 text-sm font-medium max-w-sm text-center mb-8 leading-relaxed'>
        Hãy chia sẻ kinh nghiệm và kiến thức của bạn thông qua những bài viết blog chất lượng.
      </p>
      <button
        onClick={() => window.location.href = '/teacher/blog/create'}
        className='inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[13px] hover:bg-black transition-all shadow-xl shadow-indigo-100 active:scale-[0.98]'
      >
        <Plus className='w-4 h-4' />
        Viết bài ngay
      </button>
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
