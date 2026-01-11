import { useEffect, useMemo, useState } from 'react'
import ArticlesCard from '@/components/common/ArticlesCard'
import ArticlesCardSkeleton from '@/components/HomePage/ArticlesCardSkeleton'
import { blogService } from '@/services/blog.service'

type HighlightArticle = {
  id: string
  title: string
  shortDescription: string
  thumbnail: string
}

const HighlightedArticles = () => {
  const [articles, setArticles] = useState<HighlightArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await blogService.getAll({ page: 1, limit: 8 })
        if (!mounted) return
        const items = res.items || []
        const mapped: HighlightArticle[] = items.map((b: any, idx: any) => ({
          id: b._id,
          title: b.title ?? '—',
          shortDescription: extractSummary(b.content) || '—',
          thumbnail: b.image_url || b.thumbnail || ''
        }))
        setArticles(mapped)
      } catch (e) {
        console.error('Failed to load highlighted blogs', e)
        if (mounted) setError('Không thể tải bài viết nổi bật')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  function extractSummary(html?: string, maxLen = 100): string {
    if (!html) return ''
    try {
      const tmp = document.createElement('div')
      tmp.innerHTML = html
      const text = tmp.textContent || tmp.innerText || ''
      return text.length > maxLen ? text.slice(0, maxLen).trim() + '…' : text
    } catch {
      return ''
    }
  }

  return (
    <div className='highlighted-articles-container mb-10'>
      <h4 className='font-bold bg-blue-500 text-white p-2 rounded-r-3xl max-w-80 pl-12 mt-6'>Bài viết nổi bật</h4>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6 mx-auto max-w-7xl px-4'>
        {loading && (
          <>
            {[...Array(4)].map((_, idx) => (
              <ArticlesCardSkeleton key={idx} />
            ))}
          </>
        )}
        {error && !loading && <div className='col-span-4 text-center text-sm py-8'>{error}</div>}
        {!loading && !error && articles.map((article) => <ArticlesCard key={article.id} article={article} />)}
      </div>
    </div>
  )
}

export default HighlightedArticles
