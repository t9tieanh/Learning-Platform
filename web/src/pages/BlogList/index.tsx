import { useEffect, useState } from 'react'
import { SearchBar } from '@/components/BlogList/SearchBar'
import { ArticleCard, type Article } from '@/components/BlogList/ArticleCard'
import ArticleCardSkeleton from '@/components/BlogList/ArticleCardSkeleton'
import { PaginationControls } from '@/components/BlogList/PaginationControls'
import { blogService } from '@/services/blog/blog.service'
import { formatDate } from '@/utils/common/formattDate'

const ITEMS_PER_PAGE = 6
const SEARCH_DEBOUNCE_MS = 500

const BlogPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [articles, setArticles] = useState<Article[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [searchQuery])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await blogService.getAll({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: debouncedSearchQuery
        })
        if (!mounted) return
        const mapped: Article[] = (res.items || []).map((b) => ({
          id: b._id,
          title: b.title,
          image: b.image_url,
          userName: b.userName,
          userAvt: b.userAvt,
          createdAt: formatDate(b.createdAt)
        }))
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
  }, [currentPage, debouncedSearchQuery])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  console.log('AC', articles)
  return (
    <div className='min-h-screen bg-background px-4 sm:px-6 md:px-8 lg:px-16'>
      {/* Header */}
      <header className='bg-card border-b border-border backdrop-blur-sm bg-card/95'>
        <div className='max-w-7xl mx-auto px-4 py-12 text-center'>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent'>
            Danh mục bài viết
          </h1>
          <p className='text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-6'>
            Khám phá các bài viết, mẹo và hướng dẫn giúp bạn học tập hiệu quả hơn.
          </p>

          <div className='mx-auto max-w-2xl'>
            <SearchBar
              value={searchQuery}
              onChange={(v) => {
                setSearchQuery(v)
                setCurrentPage(1)
              }}
              placeholder='Tìm kiếm bài viết, tác giả, chủ đề...'
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='container mx-auto px-4 py-12'>
        {loading ? (
          <div className='py-8'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <ArticleCardSkeleton key={i} />
              ))}
            </div>
          </div>
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
