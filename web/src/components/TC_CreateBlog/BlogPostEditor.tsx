import { useState, useEffect } from 'react'
import CustomInput from '@/components/common/Input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useBlogPostStore } from '@/stores/blogPostStore'
import noPhoto from '@/assets/images/no-photo.avif'

interface BlogPost {
  title: string
  image: string
  content: string
}

type BlogPostEditorProps = {
  initialTitle?: string
  initialImage?: string
}

const BlogPostEditor = ({ initialTitle = '', initialImage = '' }: BlogPostEditorProps) => {
  const [post, setPost] = useState<BlogPost>({
    title: initialTitle,
    image: initialImage,
    content: ''
  })
  const [imagePreview, setImagePreview] = useState<string>(initialImage || '')
  const setTitleStore = useBlogPostStore((s) => s.setTitle)
  const setImageStore = useBlogPostStore((s) => s.setImage)

  useEffect(() => {
    setTitleStore(post.title)
  }, [post.title, setTitleStore])

  // keep image in the global store in sync
  useEffect(() => {
    setImageStore(post.image)
  }, [post.image, setImageStore])

  // When initial props change (e.g., switching into update mode), update local state
  useEffect(() => {
    if (initialTitle || initialImage) {
      setPost((prev) => ({ ...prev, title: initialTitle, image: initialImage }))
      setImagePreview(initialImage || '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTitle, initialImage])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setImagePreview(result)
        setPost({ ...post, image: result })
        setImageStore(result)
      }
      reader.readAsDataURL(file)
      toast.success('Tải ảnh thành công')
    }
  }

  return (
    <div className='mb-6'>
      <div className='bg-white rounded-[2rem] border border-gray-100 shadow-md shadow-gray-200/20 overflow-hidden'>
        <div className='p-8 md:p-10'>
          {/* Layout hai cột */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-10 items-start'>
            {/* Cột trái */}
            <div className='space-y-8'>
              <div className='space-y-2'>
                <h3 className='text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2'>
                  Thông tin bài viết
                  <div className='h-px flex-1 bg-gray-50' />
                </h3>

                <div className='space-y-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='title' className='text-[12px] font-black text-gray-800 uppercase tracking-tight opacity-70'>
                      Tiêu đề bài viết <span className='text-blue-500'>*</span>
                    </Label>
                    <CustomInput
                      id='title'
                      placeholder='Nhập tiêu đề tại đây...'
                      value={post.title}
                      onChange={(e) => setPost({ ...post, title: e.target.value })}
                      className='h-12 bg-white border-gray-200 rounded-xl focus:ring-blue-50 transition-all text-base font-bold'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='image' className='text-[12px] font-black text-gray-800 uppercase tracking-tight opacity-70'>
                      Ảnh đại diện
                    </Label>
                    <CustomInput
                      id='image'
                      type='file'
                      accept='image/*'
                      onChange={handleImageUpload}
                      className='relative z-10 h-12 bg-white border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all file:bg-gray-100 file:text-gray-600 file:border-none file:rounded-lg file:px-3 file:py-0.5 file:mt-2 file:mr-3 file:text-[10px] file:font-black file:uppercase'
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Cột phải - Conditional Preview */}
            <div className='space-y-2'>
              <h3 className='text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2'>
                Xem trước ảnh
                <div className='h-px flex-1 bg-gray-50' />
              </h3>

              <div className='relative aspect-video rounded-[1.5rem] overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center group'>
                <img
                  src={imagePreview || noPhoto}
                  alt='Preview'
                  className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${!imagePreview && 'opacity-40 grayscale'}`}
                />

                {
                  <>
                    <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent' />
                    <div className='absolute bottom-4 left-4 right-4'>
                      <h4 className='text-white font-black text-sm line-clamp-2 leading-tight drop-shadow-sm'>
                        {post.title || 'Tiêu đề bài viết'}
                      </h4>
                    </div>
                  </>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogPostEditor
