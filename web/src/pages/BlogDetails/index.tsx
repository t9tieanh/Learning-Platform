import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { blogService, type BlogItem } from '@/services/blog.service'
// Apply the same Quill and preview styles used in the editor preview
import 'quill/dist/quill.snow.css'
import '@/components/TC_CreateBlog/blog-preview.css'

const BlogDetails = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [blog, setBlog] = useState<BlogItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
      ; (async () => {
        try {
          setLoading(true)
          setError(null)
          if (!id) throw new Error('Thiếu id bài viết')
          const data = await blogService.getDetails(id)
          if (!mounted) return
          setBlog(data)
        } catch (e) {
          console.error(e)
          if (mounted) setError('Không thể tải chi tiết bài viết')
        } finally {
          if (mounted) setLoading(false)
        }
      })()
    return () => {
      mounted = false
    }
  }, [id])

  return (
    <div className='min-h-screen bg-white'>
      <article className='container px-16 py-6 space-y-6'>

        <Button onClick={() => navigate(-1)}>
          ← Quay lại
        </Button>

        {loading ? (
          <div className='text-center text-muted-foreground py-16'>Đang tải bài viết...</div>
        ) : error ? (
          <div className='text-center text-red-500 py-16'>{error}</div>
        ) : !blog ? (
          <div className='text-center text-muted-foreground py-16'>Không tìm thấy bài viết</div>
        ) : (
          <>
            {/* Hàng đầu tiên: ảnh + tiêu đề + thông tin tác giả */}
            <div className='flex flex-col lg:flex-row items-start gap-8'>
              {/* Hình minh họa */}
              <Card className='h-80 overflow-hidden border-2 border-primary/20 shadow-lg lg:w-1/2 py-0'>
                <div className='aspect-video relative'>
                  <img src={blog.image_url} alt={blog.title} className='w-full h-full' />
                  <div className='absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent' />
                </div>
              </Card>

              {/* Tiêu đề + tác giả */}
              <div className='flex-1 space-y-6'>
                <h1 className='text-4xl lg:text-5xl font-bold text-foreground leading-tight'>{blog.title}</h1>

                <div className='flex items-center gap-4 py-3 border-b border-border/50'>
                  <Avatar className='h-16 w-16 border-2 border-blue-300'>
                    <AvatarImage src={blog.userAvt} alt={blog.userName || ''} />
                    <AvatarFallback className='bg-muted text-muted-foreground'>
                      {blog.userName
                        ? blog.userName
                          .split(' ')
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((word) => word[0].toUpperCase())
                          .join('')
                        : 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className='flex flex-col gap-2'>
                    <p className='font-medium text-foreground text-xl'>{blog.userName}</p>
                    <span className='items-center text-sm text-muted-foreground'>
                      <span className='font-semibold text-foreground'>Đăng ngày:</span>{' '}
                      <span className='italic'>
                        {new Date(blog.createdAt).toLocaleString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </span>
                    </span>
                    <span className='items-center text-sm text-muted-foreground'>
                      <span className='font-semibold text-foreground'>Cập nhật:</span>{' '}
                      <span className='italic'>
                        {new Date(blog.updatedAt).toLocaleString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator className='bg-border' />

            {/* Nội dung bài viết — full width (render Quill HTML with same styles as preview) */}
            <div className='prose prose-slate max-w-none blog-preview'>
              <div className='ql-editor !px-0 !py-0' dangerouslySetInnerHTML={{ __html: blog.content }} />
            </div>
          </>
        )}
      </article>
    </div>
  )
}

export default BlogDetails
