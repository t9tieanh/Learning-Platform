import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HeroSection } from '@/components/Blog/HeroSection'
import { ArticleCard } from '@/components/Blog/ArticleCard'
import { FeaturedCard } from '@/components/Blog/FeaturedCard'
import { ImageCard } from '@/components/Blog/ImageCard'
import { useEffect, useState } from 'react'
import { blogService, type BlogItem } from '@/services/blog/blog.service'
import { ArticleCardSkeleton } from '@/components/Blog/ArticleCardSkeleton'
import { ImageCardSkeleton } from '@/components/Blog/ImageCardSkeleton'

const BlogPage = () => {
  const [trending, setTrending] = useState<BlogItem[]>([])
  const [latest, setLatest] = useState<BlogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [featuredIndex, setFeaturedIndex] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
      ; (async () => {
        try {
          setLoading(true)
          const [tr, nw] = await Promise.all([blogService.getTrending(), blogService.getNew()])
          if (!mounted) return
          setTrending(tr)
          setLatest(nw)
        } catch (e) {
          console.error(e)
          if (mounted) setError('Không thể tải dữ liệu blog')
        } finally {
          if (mounted) setLoading(false)
        }
      })()
    return () => {
      mounted = false
    }
  }, [])

  // 5s Rotation Logic for FeaturedCard
  useEffect(() => {
    if (trending.length <= 1) return

    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % trending.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [trending.length])

  return (
    <div className='min-h-screen bg-gradient-subtle'>
      <main className='container py-4 space-y-12 px-16'>
        <HeroSection />

        <div className='grid lg:grid-cols-2 gap-8'>
          <div className='space-y-8'>
            <section>
              <h2 className='text-2xl font-bold mb-6'>Cập nhật gần đây</h2>
              <div className='space-y-6'>
                {loading && Array.from({ length: 3 }).map((_, i) => <ArticleCardSkeleton key={i} />)}
                {error && <div className='text-sm text-red-500'>{error}</div>}
                {!loading &&
                  !error &&
                  trending.map((item) => (
                    <ArticleCard
                      key={item._id}
                      image={item.image_url}
                      category={'Blog'}
                      title={item.title}
                      slug={item._id}
                    />
                  ))}
              </div>
            </section>
          </div>

          {/* Cột 2 - Bài viết đặc biệt / FeaturedCard - Autoslide Carousel */}
          <aside className='space-y-6'>
            {!loading && trending.length > 0 ? (
              <div className='relative overflow-hidden rounded-3xl h-full min-h-[300px]'>
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={trending[featuredIndex]?._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className='h-full'
                  >
                    <FeaturedCard
                      title={trending[featuredIndex]?.title}
                      description={
                        trending[featuredIndex]?.content
                          ? trending[featuredIndex].content.replace(/<[^>]*>/g, '').substring(0, 160) + '...'
                          : 'Khám phá kiến thức mới cùng Learnova.'
                      }
                      date='Học ngay'
                      slug={trending[featuredIndex]?._id}
                      image={trending[featuredIndex]?.image_url}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Indicators */}
                <div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-20'>
                  {trending.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all duration-500 ${i === featuredIndex ? 'w-6 bg-white' : 'w-2 bg-white/30'}`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className='w-full h-[300px] bg-slate-100 rounded-3xl animate-pulse' />
            )}
          </aside>
        </div>

        <section>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-bold'>Bài viết mới nhất</h2>

            <button
              className='text-blue-600 text-sm font-medium hover:underline underline-offset-4 decoration-2 decoration-blue-600'
              onClick={() => navigate('/blogs')}
            >
              Xem tất cả
            </button>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {loading && Array.from({ length: 6 }).map((_, i) => <ImageCardSkeleton key={i} />)}
            {error && <div className='text-sm text-red-500'>{error}</div>}
            {!loading &&
              !error &&
              latest.map((item) => (
                <ImageCard key={item._id} image={item.image_url} title={item.title} slug={item._id} />
              ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default BlogPage
