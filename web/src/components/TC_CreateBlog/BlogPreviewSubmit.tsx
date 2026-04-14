import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useBlogPostStore } from '@/stores/blogPostStore'
import { Separator } from '@/components/ui/separator'
import { Upload, BookOpen } from 'lucide-react'
// Ensure Quill content styles (lists, headings, indents) also apply in preview
import 'quill/dist/quill.snow.css'
import './blog-preview.css'
import blogService from '@/services/blog/blog.service'
import { useAuthStore } from '@/stores/useAuth.stores'
import userService from '@/services/user/user.service'
import useLoading from '@/hooks/useLoading.hook'
import type { Profile } from '@/types/profile'
import noPhoto from '@/assets/images/no-photo.avif'

type BlogPreviewSubmitProps = {
  contentHtml?: string
  blogId?: string // if provided, submit will update instead of create
}

export default function BlogPreviewSubmit({ contentHtml, blogId }: BlogPreviewSubmitProps) {
  const navigate = useNavigate()
  const { title, image } = useBlogPostStore()
  const { data } = useAuthStore()
  const { loading: submitting, startLoading, stopLoading } = useLoading()
  const [profile, setProfile] = useState<Profile | null>(null)

  const hasContent = useMemo(() => Boolean(contentHtml && contentHtml.trim().length > 0), [contentHtml])

  useEffect(() => {
    let mounted = true
      ; (async () => {
        try {
          const res = await userService.getProfile()
          if (!mounted) return
          if (res?.result) setProfile(res.result)
        } catch (_) {
          // ignore, show fallback avatar/name
        }
      })()
    return () => {
      mounted = false
    }
  }, [])

  const initials = useMemo(() => {
    const name = profile?.name || title || ''
    if (!name) return 'BL'
    const parts = name.trim().split(/\s+/)
    const first = parts[0]?.[0] || ''
    const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
    return (first + last).toUpperCase() || 'BL'
  }, [profile?.name, title])

  const handleSubmit = async () => {
    const instructorId = data?.userId || (data as any)?.id
    if (!instructorId) {
      toast.error('Bạn cần đăng nhập để đăng bài viết')
      return
    }
    if (!title || !title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài viết')
      return
    }
    if (!image || !image.trim()) {
      toast.error('Vui lòng chọn/nhập ảnh bìa (image)')
      return
    }
    if (!hasContent) {
      toast.error('Vui lòng nhập nội dung bài viết')
      return
    }

    try {
      startLoading()
      if (blogId) {
        const updated = await blogService.update(blogId, {
          title: title.trim(),
          image_url: image,
          content: contentHtml as string
        })
        toast.success('Cập nhật blog thành công')
        navigate('/teacher/blogs')
        console.log('Updated Blog:', updated)
      } else {
        const created = await blogService.create({
          instructor_id: instructorId,
          title: title.trim(),
          image_url: image,
          content: contentHtml as string
        })
        toast.success('Tạo blog thành công')
        navigate('/teacher/blogs')
        console.log('Created Blog:', created)
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error(err)
      toast.error(err?.response?.data?.message || (blogId ? 'Cập nhật blog thất bại' : 'Tạo blog thất bại'))
    } finally {
      stopLoading()
    }
  }

  const today = useMemo(() => {
    const d = new Date()
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    const hh = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${hh}:${min} ${dd}/${mm}/${yyyy} `
  }, [])

  return (
    <Card className='border-gray-100 mt-8 rounded-[2rem] shadow-md shadow-gray-200/20 overflow-hidden'>
      <div className='p-8 md:p-10'>
        <div className='flex items-center gap-2 mb-8'>
          <h3 className='text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]'>Xem trước & Xuất bản</h3>
          <div className='h-px flex-1 bg-gray-100' />
        </div>

        <CardContent className='p-0 space-y-10'>
          {!title && !hasContent && !image ? (
            <div className='text-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200'>
              <BookOpen className='w-10 h-10 text-gray-200 mx-auto mb-4' />
              <p className='text-gray-400 text-sm font-medium'>Nội dung xem trước sẽ hiển thị tại đây khi bạn nhập bài viết</p>
            </div>
          ) : (
            <div className='space-y-12 animate-in fade-in duration-700'>
              {/* Hero Section */}
              <section className='grid grid-cols-1 lg:grid-cols-2 gap-10 items-center'>
                <div className='aspect-video rounded-[2rem] overflow-hidden border border-gray-100 bg-gray-50 shadow-inner group relative'>
                  <img
                    src={image || noPhoto}
                    alt={title || 'preview cover'}
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${!image && 'opacity-40 grayscale'}`}
                  />
                </div>

                <div className='space-y-6'>
                  {title && (
                    <h1 className='text-3xl lg:text-4xl font-black text-gray-900 leading-[1.1] tracking-tight'>
                      {title}
                    </h1>
                  )}

                  <div className='flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 w-fit'>
                    {profile?.image ? (
                      <img src={profile.image} alt={profile.name} className='h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm' />
                    ) : (
                      <div className='h-12 w-12 rounded-full bg-white flex items-center justify-center border border-gray-100 text-[13px] font-black'>
                        {initials}
                      </div>
                    )}
                    <div>
                      <div className='text-[14px] font-black text-gray-900'>{profile?.name || 'Tác giả'}</div>
                      <div className='text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5'>
                        Đăng ngày {today.split(' ')[1]}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Content area with more whitespace and better typography */}
              {hasContent && (
                <div className='max-w-none pt-10 border-t border-gray-100'>
                  <div className='ql-editor !p-0 !text-gray-700 !leading-relaxed !text-[16px]' dangerouslySetInnerHTML={{ __html: contentHtml as string }} />
                </div>
              )}
            </div>
          )}

          <div className='flex justify-center pt-10 border-t border-gray-100'>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className='rounded-2xl text-white hover:bg-blue-600 transition-all font-sm !text-sm font-bold uppercase tracking-widest shadow-xl shadow-gray-200'
            >
              {submitting ? (
                <span className='flex items-center gap-2'>
                  <div className='w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin' />
                  Đang xử lý...
                </span>
              ) : (
                <span className='flex items-center gap-2'>
                  <Upload className='w-4 h-4' />
                  {blogId ? 'Cập nhật ngay' : 'Xuất bản ngay'}
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
