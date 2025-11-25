import React, { useState, useEffect } from 'react'
import AcademySidebar from '@/components/TC_HomePage/AcademySidebar'
import BlogSearchBar from '@/components/TC_Blog/BlogSearchBar'
import { Loader } from '@/components/ui/loader'
import BlogTable from '@/components/TC_Blog/BlogTable'
import BlogPagination from '@/components/TC_Blog/BlogPagination'
import { blogService, type BlogItem } from '@/services/blog.service'
import { useAuthStore } from '@/stores/useAuth.stores'

interface Blog {
  _id: string
  instructor_id: string
  title: string
  image_url: string
  content: string
  markdown_file_url?: string[]
  created_at: string
}

const TC_Blog: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { data } = useAuthStore()
  const myId = data?.userId
  const size = 5

  useEffect(() => {
    let mounted = true
      ; (async () => {
        try {
          setLoading(true)
          setError(null)
          const res = await blogService.getAllByInstructorId({ page, limit: size, search, instructorId: myId })
          if (!mounted) return
          const mapped: Blog[] = (res.items || []).map((b: BlogItem) => ({
            _id: b._id,
            instructor_id: b.instructor_id,
            title: b.title,
            image_url: b.image_url,
            content: b.content,
            markdown_file_url: b.markdown_file_url,
            created_at: b.createdAt
          }))
          setBlogs(mapped)
          setTotalPages(res.totalPages || 1)
        } catch (e) {
          console.error(e)
          if (mounted) setError('Không thể tải danh sách bài viết')
        } finally {
          if (mounted) setLoading(false)
        }
      })()
    return () => {
      mounted = false
    }
  }, [page, search])

  return (
    <div className='flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-950 transition-colors'>
      {/* Sidebar */}
      <div className='fixed top-0 left-0 h-screen w-64 bg-[#1D1D2A] z-30'>
        <AcademySidebar />
      </div>

      {/* Main content */}
      <div className='flex-1 p-6 space-y-6'>
        <BlogSearchBar
          onSearch={(v) => {
            setSearch(v)
            setPage(1)
          }}
        />

        {loading ? (
          <Loader />
        ) : error ? (
          <div className='text-center text-red-500 py-10'>{error}</div>
        ) : (
          <BlogTable
            courses={blogs.map((b) => ({
              id: b._id,
              title: b.title,
              image: b.image_url,
              shortDescription: b.content.slice(0, 80) + '...',
              createdAt: b.created_at
            }))}
            onDeleted={(id) => setBlogs((prev) => prev.filter((b) => b._id !== id))}
          />
        )}

        <BlogPagination pages={totalPages} current={page} onChange={setPage} />
      </div>
    </div>
  )
}

export default TC_Blog
