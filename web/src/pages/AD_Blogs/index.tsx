import { useEffect, useState } from 'react'
import BlogSearchBar from '@/components/TC_Blog/BlogSearchBar'
import BlogTable from '@/components/TC_Blog/BlogTable'
import BlogPagination from '@/components/TC_Blog/BlogPagination'
import blogService, { type BlogItem, type BlogListResponse } from '@/services/blog/blog.service'
const PAGE_SIZE = 6

const AD_Blogs = () => {
  const [blogs, setBlogs] = useState<BlogItem[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const fetchBlogs = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await blogService.getAll({ page, limit: PAGE_SIZE, search })
        if (!active) return
        setBlogs(res.items ?? [])
        setTotalPages(res.totalPages ?? 1)
      } catch (e: any) {
        if (!active) return
        setError(e?.response?.data?.message || e?.message || 'Lỗi tải danh sách blog')
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchBlogs()
    return () => {
      active = false
    }
  }, [page, search])

  return (
    <div className='flex-1 space-y-8 p-6'>
      <BlogSearchBar
        hideCreateButton
        onSearch={(v) => {
          setSearch(v)
          setPage(1)
        }}
      />

      {loading ? (
        <div className='text-center py-10'>Loading...</div>
      ) : error ? (
        <div className='text-center text-red-500 py-10'>{error}</div>
      ) : (
        <BlogTable
          courses={blogs.map((b) => ({
            id: b._id,
            title: b.title,
            image: b.image_url,
            shortDescription: (b.content || '').slice(0, 80) + '...',
            createdAt: (b as any).created_at || b.createdAt,
            userName: b.userName,
            userAvt: b.userAvt
          }))}
          onDeleted={(id) => setBlogs((prev) => prev.filter((b) => b._id !== id))}
          base='admin'
        />
      )}

      <BlogPagination pages={totalPages} current={page} onChange={setPage} />
    </div>
  )
}

export default AD_Blogs
