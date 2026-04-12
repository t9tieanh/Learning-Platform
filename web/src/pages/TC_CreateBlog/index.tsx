import { useEffect, useState } from 'react'
import BlogPostEditor from '@/components/TC_CreateBlog/BlogPostEditor'
import BlogPreviewSubmit from '@/components/TC_CreateBlog/BlogPreviewSubmit'
import TitleComponent from '@/components/TC_CreateCourse/common/Title'
import QuillEditor from '@/components/TC_CreateBlog/QuillEditor'
import { useParams, useNavigate } from 'react-router-dom'
import blogService from '@/services/blog/blog.service'
import { useBlogPostStore } from '@/stores/blogPostStore'
import { PenTool, ChevronLeft } from 'lucide-react'
import CustomButton from '@/components/common/Button'

const Index = () => {
  const navigate = useNavigate()
  const [html, setHtml] = useState<string>('')
  const { id } = useParams()
  const isUpdate = Boolean(id)
  const [initialTitle, setInitialTitle] = useState<string>('')
  const [initialImage, setInitialImage] = useState<string>('')
  const setTitleStore = useBlogPostStore((s) => s.setTitle)
  const setImageStore = useBlogPostStore((s) => s.setImage)

  useEffect(() => {
    let mounted = true
    if (isUpdate && id) {
      ; (async () => {
        try {
          const blog = await blogService.getDetails(id)
          if (!mounted) return
          setInitialTitle(blog.title || '')
          setInitialImage(blog.image_url || '')
          setHtml(blog.content || '')
          setTitleStore(blog.title || '')
          setImageStore(blog.image_url || '')
        } catch (e) {
          console.error(e)
        }
      })()
    }
    return () => {
      mounted = false
    }
  }, [id, isUpdate, setTitleStore, setImageStore])
  return (
    <div className='min-h-screen bg-[#fafafa] relative overflow-hidden'>
      <div className='absolute top-0 right-0 w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-[100px] -z-10' />
      <div className='absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-50/50 rounded-full blur-[100px] -z-10' />

      <div className='max-w-5xl mx-auto px-6 py-12 space-y-10'>
        <CustomButton
          label='Trở lại danh sách'
          onClick={() => navigate('/teacher/blogs')}
          className='group inline-flex items-center text-black gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-gray-200 transition-all active:scale-[0.98]'
          icon={<ChevronLeft className='w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors' />}
        />

        <TitleComponent
          icon={<PenTool className='w-6 h-6 text-white' />}
          title={isUpdate ? 'Cập nhật bài viết' : 'Tạo bài viết mới'}
          description={
            isUpdate
              ? 'Bạn có thể chỉnh sửa lại nội dung, cập nhật hình ảnh hoặc bổ sung thông tin mới để bài viết trở nên đầy đủ và chính xác hơn. Sau khi hoàn tất, hãy nhấn "Cập nhật" để lưu lại tất cả thay đổi và hiển thị phiên bản mới nhất đến người đọc.'
              : 'Đây là nơi bạn chia sẻ kiến thức, kinh nghiệm hoặc góc nhìn của mình đến cộng đồng. Hãy trình bày nội dung rõ ràng, thêm hình ảnh minh họa nếu cần để bài viết trở nên sinh động và dễ hiểu hơn. Một bài viết chất lượng không chỉ giúp người đọc học được điều mới mà còn thể hiện được giá trị và chuyên môn của bạn.'
          }
        />

        <div className='space-y-8 relative z-10'>
          <BlogPostEditor initialTitle={initialTitle} initialImage={initialImage} />
          <div className='bg-white rounded-[2rem] border border-gray-100 p-8 shadow-md shadow-gray-200/20'>
            <h3 className='text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2'>
              Nội dung bài viết
              <div className='h-px flex-1 bg-gray-100' />
            </h3>
            <QuillEditor initialHtml={html} onChange={setHtml} />
          </div>
          <BlogPreviewSubmit contentHtml={html} blogId={isUpdate ? id : undefined} />
        </div>
      </div>
    </div>
  )
}

export default Index
