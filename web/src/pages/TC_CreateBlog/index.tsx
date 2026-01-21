import { useEffect, useState } from 'react'
import BlogPostEditor from '@/components/TC_CreateBlog/BlogPostEditor'
import BlogPreviewSubmit from '@/components/TC_CreateBlog/BlogPreviewSubmit'
import TitleComponent from '@/components/TC_CreateCourse/common/Title'
import QuillEditor from '@/components/TC_CreateBlog/QuillEditor'
import { useParams } from 'react-router-dom'
import blogService from '@/services/blog/blog.service'
import { useBlogPostStore } from '@/stores/blogPostStore'
const Index = () => {
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
      ;(async () => {
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
    <div className='min-h-screen px-28 py-10'>
      <div className='max-w-7xl mx-auto'>
        <TitleComponent
          title={isUpdate ? 'Cập nhật bài viết' : 'Tạo bài viết mới'}
          description={
            isUpdate
              ? 'Chỉnh sửa nội dung và hình ảnh, sau đó nhấn Cập nhật để lưu thay đổi.'
              : 'Trang này giúp bạn viết và xuất bản bài viết (blog) của mình. Một bài viết được trình bày hấp dẫn, có nội dung rõ ràng và giá trị sẽ giúp bạn thu hút nhiều độc giả hơn'
          }
        />
        <BlogPostEditor initialTitle={initialTitle} initialImage={initialImage} />
        <QuillEditor initialHtml={html} onChange={setHtml} />
        <BlogPreviewSubmit contentHtml={html} blogId={isUpdate ? id : undefined} />
      </div>
    </div>
  )
}

export default Index
