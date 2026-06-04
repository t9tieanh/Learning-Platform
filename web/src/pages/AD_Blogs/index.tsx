import { useEffect, useState } from 'react'
import { FileText, Search, Sparkles } from 'lucide-react'
import BlogSearchBar from '@/components/TC_Blog/BlogSearchBar'
import BlogTable from '@/components/TC_Blog/BlogTable'
import BlogPagination from '@/components/TC_Blog/BlogPagination'
import blogService, { type BlogItem } from '@/services/blog/blog.service'

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
    <div className='space-y-8'>
      <section className='relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 px-6 py-7 text-white shadow-[0_24px_60px_-32px_rgba(15,23,42,0.55)]'>
        <div className='absolute -right-10 top-0 h-40 w-40 rounded-full bg-sky-400/15 blur-3xl' />
        <div className='absolute bottom-0 left-8 h-28 w-28 rounded-full bg-cyan-300/10 blur-3xl' />
        <div className='relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between'>
          <div className='max-w-2xl'>
            <p className='text-xs font-semibold uppercase tracking-[0.28em] text-sky-200/80'>Bài viết HỆ THỐNG</p>
            <h1 className='mt-3 text-3xl font-semibold tracking-tight'>Quản lý bài viết</h1>
            <p className='mt-2 text-sm leading-6 text-slate-300'>
              Theo dõi nội dung, kiểm tra bài đăng mới và giữ trải nghiệm quản trị nội dung nhất quán, dễ quét hơn.
            </p>
          </div>

          <div className='grid gap-3 sm:grid-cols-3'>
            <div className='rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm'>
              <div className='flex items-center gap-2 text-sky-200'>
                <FileText className='h-4 w-4' />
                <span className='text-xs font-medium uppercase tracking-[0.18em]'>Tổng bài viết</span>
              </div>
              <p className='mt-3 text-2xl font-semibold text-white'>{blogs.length}</p>
            </div>
            <div className='rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm'>
              <div className='flex items-center gap-2 text-cyan-200'>
                <Search className='h-4 w-4' />
                <span className='text-xs font-medium uppercase tracking-[0.18em]'>Tìm kiếm</span>
              </div>
              <p className='mt-3 text-sm font-medium text-white'>{search ? `“${search}”` : 'Tất cả nội dung'}</p>
            </div>
            <div className='rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm'>
              <div className='flex items-center gap-2 text-emerald-200'>
                <Sparkles className='h-4 w-4' />
                <span className='text-xs font-medium uppercase tracking-[0.18em]'>Trang hiện tại</span>
              </div>
              <p className='mt-3 text-2xl font-semibold text-white'>{page}</p>
            </div>
          </div>
        </div>
      </section>

      <section className='rounded-[30px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.24)] backdrop-blur-sm'>
        <div className='rounded-[26px] border border-slate-200/70 bg-slate-50/70 p-4'>
          <BlogSearchBar
            hideCreateButton
            onSearch={(v) => {
              setSearch(v)
              setPage(1)
            }}
          />
        </div>

        <div className='mt-5 rounded-[26px] border border-slate-200/70 bg-white p-4 shadow-[0_14px_36px_-28px_rgba(15,23,42,0.18)]'>
          {loading ? (
            <div className='flex min-h-[320px] items-center justify-center rounded-[22px] border border-dashed border-slate-200 bg-slate-50/80 px-6 text-sm font-medium text-slate-500'>
              Đang tải danh sách bài viết...
            </div>
          ) : error ? (
            <div className='flex min-h-[320px] items-center justify-center rounded-[22px] border border-rose-200 bg-rose-50/80 px-6 text-sm font-medium text-rose-600'>
              {error}
            </div>
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
        </div>

        <div className='mt-5 flex justify-end rounded-[22px] border border-slate-200/70 bg-slate-50/70 p-4'>
          <BlogPagination pages={totalPages} current={page} onChange={setPage} />
        </div>
      </section>
    </div>
  )
}

export default AD_Blogs
