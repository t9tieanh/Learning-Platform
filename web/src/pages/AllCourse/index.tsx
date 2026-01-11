import { useEffect, useMemo, useState } from 'react'
import { CourseCard } from '@/components/AllCourse/CourseCard'
import CourseCardListSkeleton from '@/components/AllCourse/CourseCardListSkeleton'
import { FilterSidebar } from '@/components/AllCourse/FilterSidebar'
import { SortBar } from '@/components/AllCourse/SortBar'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import instructorAvatar from '@/assets/images/course.jpg'
import courseService from '@/services/course/course-user.service'
import useDebounce from '@/hooks/useDebounce.hook'

const Index = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)

  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<any[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortValue, setSortValue] = useState('')
  const [search, setSearch] = useState('')
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined)
  const [minRating, setMinRating] = useState<number | undefined>(undefined)
  const debouncedSearch = useDebounce(search, 400)

  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await courseService.getAllCourses({
          page: currentPage,
          limit: pageSize,
          category: selectedCategories.length === 1 ? selectedCategories[0] : undefined,
          search: debouncedSearch || undefined,
          minPrice,
          minRating,
          sort: sortValue || ''
        })
        const payload = res.result
        if (!mounted) return
        const list = payload?.items ?? []
        setItems(list)
        setTotalPages(payload?.totalPages ?? 1)
        setTotalElements(payload?.totalElements ?? list.length)
      } catch (e) {
        console.error('Failed to load courses', e)
        if (mounted) {
          setItems([])
          setTotalPages(1)
          setTotalElements(0)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchData()
    return () => {
      mounted = false
    }
  }, [currentPage, pageSize, selectedCategories, debouncedSearch, minPrice, minRating, sortValue])

  const filteredItems = useMemo(() => {
    if (!selectedCategories || selectedCategories.length === 0) return items
    return items.filter((c) => {
      const name = c.categoryName ?? c.category ?? c.category?.name
      return typeof name === 'string' && selectedCategories.includes(name)
    })
  }, [items, selectedCategories])

  const mappedCourses = useMemo(
    () =>
      filteredItems.map((c, idx) => ({
        id: c.id ?? idx,
        title: c.title ?? 'Chưa có tiêu đề',
        description: c.shortDescription ?? '',
        originalPrice: c.originalPrice ?? c.price ?? 0,
        salePrice: c.finalPrice ?? c.price ?? c.originalPrice ?? 0,
        instructor: {
          name: c.instructor?.name ?? c.instructorName ?? 'Ẩn danh',
          avatar: c.instructor?.image ?? c.instructorImage ?? instructorAvatar
        },
        rating: c.rating ?? 0,
        reviewCount: c.reviewsCount ?? c.reviewCount ?? 0,
        duration: c.duration ?? '—',
        lectures: c.lectures ?? c.lessonsCount ?? 0,
        level: c.level ?? 'Mọi cấp độ',
        isBestseller: Boolean(c.isBestseller),
        thumbnail: c.thumbnailUrl ?? c.image ?? instructorAvatar
      })),
    [filteredItems]
  )

  return (
    <div className='flex flex-col md:flex-row min-h-screen bg-white'>
      <FilterSidebar
        selectedCategories={selectedCategories}
        onCategoriesChange={(cats) => {
          setSelectedCategories(cats)
          setCurrentPage(1)
        }}
        search={search}
        onSearchChange={(v) => {
          setSearch(v)
          setCurrentPage(1)
        }}
        minPrice={minPrice}
        onMinPriceChange={(v) => {
          setMinPrice(v)
          setCurrentPage(1)
        }}
        minRating={minRating}
        onMinRatingChange={(v) => {
          setMinRating(v)
          setCurrentPage(1)
        }}
      />

      <main className='flex-1 p-4 md:p-8'>
        <div className='max-w-7xl mx-auto'>
          <div className='mb-12 text-center px-4 md:px-0'>
            <h1 className='text-3xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent'>
              Khám phá khóa học
            </h1>
            <p className='text-base md:text-lg text-muted-foreground max-w-3xl mx-auto'>
              Tìm kiếm và lựa chọn khóa học phù hợp với mục tiêu học tập của bạn
            </p>
          </div>

          <SortBar
            totalCourses={totalElements}
            sortValue={sortValue}
            onSortChange={(v) => {
              setSortValue(v)
              setCurrentPage(1)
            }}
          />

          <div className='flex flex-col gap-4 mb-8'>
            {loading
              ? [...Array(10)].map((_, idx) => <CourseCardListSkeleton key={idx} />)
              : mappedCourses.map((course) => <CourseCard key={course.id} {...course} />)}
          </div>

          <div className='flex items-center justify-center gap-2'>
            <Button
              variant='outline'
              size='icon'
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size='icon'
                onClick={() => !loading && setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}

            <Button
              variant='outline'
              size='icon'
              onClick={() => !loading && setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || loading}
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Index
