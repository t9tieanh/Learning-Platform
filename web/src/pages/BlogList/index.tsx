import { useEffect, useMemo, useState } from 'react'
import { SearchBar } from '@/components/BlogList/SearchBar'
import { ArticleCard, type Article } from '@/components/BlogList/ArticleCard'
import { PaginationControls } from '@/components/BlogList/PaginationControls'
import { blogService } from '@/services/blog/blog.service'
import { formatDate } from '@/utils/common/formattDate'

const ITEMS_PER_PAGE = 6

const BlogPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [articles, setArticles] = useState<Article[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await blogService.getAll({ page: currentPage, limit: ITEMS_PER_PAGE, search: searchQuery })
        if (!mounted) return
        const mapped: Article[] = (res.data || []).map((b) => ({
          id: b._id,
          title: b.title,
          image: b.image_url,
          userName: b.userName,
          userAvt: b.userAvt,
          createdAt: formatDate(b.createdAt)
        }))

        console.log('MAPPPED', mapped)
        setArticles(mapped)
        setTotalPages(res?.totalPages || 1)
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
  }, [currentPage, searchQuery])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  console.log('AC', articles)
  return (
    <div className='min-h-screen bg-background px-36'>
      {/* Header */}
      <header className='bg-card border-b border-border backdrop-blur-sm bg-card/95'>
        <div className='container mx-auto px-4 py-6'>
          <h1 className='text-3xl font-semibold text-foreground mb-6 text-center'>Danh mục bài viết</h1>
          <SearchBar
            value={searchQuery}
            onChange={(v) => {
              setSearchQuery(v)
              setCurrentPage(1)
            }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className='container mx-auto px-4 py-12'>
        {loading ? (
          <div className='text-center py-16 text-muted-foreground'>Đang tải bài viết...</div>
        ) : error ? (
          <div className='text-center py-16 text-red-500'>{error}</div>
        ) : articles.length > 0 ? (
          <>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {totalPages > 1 && (
              <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            )}
          </>
        ) : (
          <div className='text-center py-16'>
            <p className='text-xl text-muted-foreground'>Không tìm thấy bài viết nào phù hợp với tìm kiếm của bạn.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default BlogPage
