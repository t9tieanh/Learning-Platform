import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { blogService, type BlogItem } from '@/services/blog/blog.service'
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
    const fetchBlogDetail = async () => {
      try {
        setLoading(true)
        setError(null)
        if (!id) throw new Error('Thiếu id bài viết')
        const data = await blogService.getDetails(id)
        if (!mounted) return

        // If API returns null (not found), redirect to home and show toast
        if (!data) {
          toast.error('Bài viết không tồn tại !.')
          navigate('/')
          return
        }

        setBlog(data)
      } catch (e) {
        console.error(e)
        if (mounted) setError('Không thể tải chi tiết bài viết')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchBlogDetail()

    return () => {
      mounted = false
    }
  }, [id, navigate])

  return (
    <div className='min-h-screen bg-white'>
      <article className='container px-4 sm:px-6 md:px-8 lg:px-16 py-6 space-y-6'>
        {/* Back button — consistent with modern blog layouts */}
        <div className='flex items-center'>
          <Button
            variant={undefined}
            className='inline-flex items-center gap-2 bg-transparent text-foreground hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary transition rounded-md px-2 py-1'
            onClick={() => navigate('/blogs')}
            aria-label='Trở lại'
          >
            <ArrowLeft className='h-4 w-4 text-foreground' />
            <span className='text-sm font-medium'>Trở lại</span>
          </Button>
        </div>

        {loading ? (
          /* Skeleton layout resembling final article */
          <div className='space-y-6'>
            <div className='flex flex-col lg:flex-row items-start gap-8'>
              <div className='lg:w-1/2'>
                <Skeleton className='w-full aspect-video rounded-lg bg-gray-200' />
              </div>

              <div className='flex-1 space-y-4 w-full'>
                <Skeleton className='h-8 w-3/4 bg-gray-200 rounded-md' />

                <div className='flex items-center gap-4 py-3 border-b border-border/50'>
                  <Skeleton className='w-12 h-12 rounded-full bg-gray-200' />
                  <div className='flex-1 space-y-2'>
                    <Skeleton className='h-4 w-32 bg-gray-200' />
                    <Skeleton className='h-3 w-48 bg-gray-200' />
                  </div>
                </div>
              </div>
            </div>

            <Separator className='bg-border' />

            <div className='space-y-3'>
              <Skeleton className='h-4 w-full bg-gray-200' />
              <Skeleton className='h-4 w-full bg-gray-200' />
              <Skeleton className='h-4 w-5/6 bg-gray-200' />
              <Skeleton className='h-44 w-full bg-gray-200 rounded-md' />
            </div>
          </div>
        ) : error ? (
          <div className='text-center text-red-500 py-16'>{error}</div>
        ) : !blog ? (
          <div className='text-center text-muted-foreground py-16'>Không tìm thấy bài viết</div>
        ) : (
          <>
            <div className='flex flex-col lg:flex-row items-start gap-8'>
              <Card className='overflow-hidden border-2 border-primary/20 shadow-lg w-full lg:w-1/2 py-0 rounded-lg'>
                <div className='aspect-video relative w-full'>
                  <img
                    src={blog.image_url}
                    alt={blog.title}
                    className='w-full h-full object-cover object-center max-h-[60vh]'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent' />
                </div>
              </Card>

              <div className='flex-1 space-y-6'>
                <h1 className='text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground leading-tight'>
                  {blog.title}
                </h1>

                <div className='flex items-center gap-4 py-3 border-b border-border/50'>
                  <Avatar className='h-12 w-12 border-2 border-blue-300'>
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

                  <div className='flex flex-col gap-1'>
                    <p className='font-medium text-foreground text-lg'>{blog.userName}</p>
                    <span className='text-sm text-muted-foreground'>
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
                  </div>
                </div>
              </div>
            </div>

            <Separator className='bg-border' />

            {/* Content container: apply blog-preview styles and keep title largest on page */}
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
