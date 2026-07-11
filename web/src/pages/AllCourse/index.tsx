import { useMemo, useState, useEffect } from 'react'
import { CourseCard } from '@/components/AllCourse/CourseCard'
import CourseCardListSkeleton from '@/components/AllCourse/CourseCardListSkeleton'
import { FilterSidebar } from '@/components/AllCourse/FilterSidebar'
import { SortBar } from '@/components/AllCourse/SortBar'
import SortBarSkeleton from '@/components/AllCourse/SortBarSkeleton'
import CustomPagination from '@/components/common/Pagination/CustomPagination'
import instructorAvatar from '@/assets/images/course.jpg'
import heroCourses from '@/assets/images/hero-courses.png'
import courseService from '@/services/course/course-user.service'
import useDebounce from '@/hooks/useDebounce.hook'
import eventTracker from '@/services/personalize/eventTracker'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'

type PaginationItem = number | 'ellipsis'

const getCourseCategoryName = (course: { categoryName?: unknown; category?: unknown }) => {
  if (typeof course.categoryName === 'string') return course.categoryName
  if (typeof course.category === 'string') return course.category
  if (
    course.category &&
    typeof course.category === 'object' &&
    'name' in course.category &&
    typeof course.category.name === 'string'
  ) {
    return course.category.name
  }
  return undefined
}

const getPaginationItems = (
  total: number,
  current: number,
  siblingCount: number,
  boundaryCount: number
): PaginationItem[] => {
  if (total <= 0) return []

  const safeTotal = Math.max(1, Math.floor(total))
  const safeCurrent = Math.min(safeTotal, Math.max(1, Math.floor(current)))
  const safeSibling = Math.max(0, Math.floor(siblingCount))
  const safeBoundary = Math.max(0, Math.floor(boundaryCount))

  // If we can show everything, just do it.
  const maxItems = safeBoundary * 2 + safeSibling * 2 + 3
  if (safeTotal <= maxItems) {
    return Array.from({ length: safeTotal }, (_, i) => i + 1)
  }

  const leftSiblingIndex = Math.max(safeCurrent - safeSibling, safeBoundary + 2)
  const rightSiblingIndex = Math.min(safeCurrent + safeSibling, safeTotal - safeBoundary - 1)

  const showLeftEllipsis = leftSiblingIndex > safeBoundary + 2
  const showRightEllipsis = rightSiblingIndex < safeTotal - safeBoundary - 1

  const startPages = Array.from({ length: safeBoundary }, (_, i) => i + 1)
  const endPages = Array.from({ length: safeBoundary }, (_, i) => safeTotal - safeBoundary + 1 + i)

  const siblingRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i)

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = Array.from({ length: safeBoundary + safeSibling * 2 + 1 }, (_, i) => i + 1)
    return [...leftRange, 'ellipsis', ...endPages]
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightRange = Array.from(
      { length: safeBoundary + safeSibling * 2 + 1 },
      (_, i) => safeTotal - (safeBoundary + safeSibling * 2) + i
    )
    return [...startPages, 'ellipsis', ...rightRange]
  }

  return [...startPages, 'ellipsis', ...siblingRange, 'ellipsis', ...endPages]
}

const Index = () => {
  const [searchParams] = useSearchParams()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(9)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortValue, setSortValue] = useState('')
  const [search, setSearch] = useState('')
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined)
  const [minRating, setMinRating] = useState<number | undefined>(undefined)
  const debouncedSearch = useDebounce(search, 400)

  useEffect(() => {
    const sortParam = searchParams.get('sort')
    if (sortParam) {
      setSortValue(sortParam)
      setCurrentPage(1)
    }
  }, [searchParams])

  const selectedCategory = useMemo(
    () => (selectedCategories.length === 1 ? selectedCategories[0] : undefined),
    [selectedCategories]
  )

  const coursesQueryKey = useMemo(() => {
    if (sortValue === 'recommend') {
      return ['courses', 'recommend', currentPage, pageSize] as const
    }

    return [
      'courses',
      'all',
      currentPage,
      pageSize,
      sortValue || '',
      {
        category: selectedCategory,
        search: debouncedSearch || undefined,
        minPrice,
        minRating
      }
    ] as const
  }, [currentPage, pageSize, sortValue, selectedCategory, debouncedSearch, minPrice, minRating])

  const recommendQuery = useQuery({
    queryKey: ['courses', 'recommend', currentPage, pageSize],
    enabled: sortValue === 'recommend',
    queryFn: async () => {
      const page = Math.max(0, currentPage - 1)
      const res = await courseService.getPersonalizationCourse(page, pageSize)
      const list = res.result ?? []
      return {
        items: list,
        totalElements: list.length,
        totalPages: list.length === pageSize ? currentPage + 1 : currentPage
      }
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    retry: false
  })

  const allCoursesQuery = useQuery({
    queryKey: coursesQueryKey,
    enabled: sortValue !== 'recommend',
    queryFn: async () => {
      const res = await courseService.getAllCourses({
        page: currentPage,
        limit: pageSize,
        category: selectedCategory,
        search: debouncedSearch || undefined,
        minPrice,
        minRating,
        sort: sortValue || ''
      })

      const payload = res.result
      const list = payload?.items ?? []
      return {
        items: list,
        totalElements: payload?.totalElements ?? list.length,
        totalPages: payload?.totalPages ?? 1
      }
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false
  })

  const activeQuery = sortValue === 'recommend' ? recommendQuery : allCoursesQuery

  const items = useMemo(() => activeQuery.data?.items ?? [], [activeQuery.data?.items])
  const totalPages = activeQuery.data?.totalPages ?? 1
  const totalElements = activeQuery.data?.totalElements ?? 0
  const loading = activeQuery.isFetching
  const showSkeleton = loading
  const hasError = activeQuery.isError

  const filteredItems = useMemo(() => {
    if (!selectedCategories || selectedCategories.length === 0) return items
    return items.filter((c) => {
      const name = getCourseCategoryName(c)
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
        category: getCourseCategoryName(c) ?? 'Lập trình',
        level: c.level ?? 'Mọi cấp độ',
        isBestseller: Boolean(c.isBestseller),
        thumbnail: c.thumbnailUrl ?? c.image ?? instructorAvatar
      })),
    [filteredItems]
  )

  // const paginationItems = useMemo(() => {
  //   // Keep pagination compact to avoid UI overflow.
  //   // Smaller screens get fewer siblings.
  //   const siblingCount = 1
  //   const boundaryCount = 1
  //   return getPaginationItems(totalPages, currentPage, siblingCount, boundaryCount)
  // }, [totalPages, currentPage])

  return (
    <div className='min-h-[100dvh] bg-[#f4f9fc]'>
      <section
        className='relative isolate overflow-hidden border-b border-slate-200/70 bg-cover bg-center'
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(238, 247, 255, 0) 0%, rgba(223, 240, 251, 0) 55%, rgba(215, 236, 249, 0.5) 100%), url(${heroCourses})`
        }}
      >
        <div className='absolute -right-20 -top-24 h-72 w-72 rounded-full border-[28px] border-blue-600/85 opacity-90 shadow-[inset_0_0_30px_rgba(255,255,255,0.55)]' />
        <div className='relative mx-auto max-w-7xl px-4 py-11 sm:px-6 lg:px-8 md:py-14'>
          <div className='max-w-[670px]'>
            <h1 className='mt-4 text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-cyan-500 to-blue-900 md:text-5xl'>
              Khám phá
            </h1>
            <p className='mt-3 max-w-[640px] text-sm leading-7 text-slate-600 md:text-base'>
              Tìm kiếm lộ trình phù hợp, lọc theo nhu cầu và so sánh nhanh để chọn khóa học tốt nhất cho mục tiêu học
              tập của bạn.
            </p>
          </div>
        </div>
      </section>

      <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='grid gap-6 md:grid-cols-[280px_minmax(0,1fr)]'>
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

          <div className='min-w-0'>
            {showSkeleton ? (
              <SortBarSkeleton />
            ) : (
              <SortBar
                totalCourses={totalElements}
                sortValue={sortValue}
                onSortChange={(v) => {
                  setSortValue(v)
                  setCurrentPage(1)
                }}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            )}

            {hasError ? (
              <div className='mb-8 rounded-2xl border border-red-100 bg-white/80 p-6 text-slate-700 shadow-sm'>
                <p className='text-base font-semibold text-slate-900'>Không thể tải dữ liệu khóa học.</p>
                <p className='mt-2 text-sm text-slate-500'>Vui lòng thử lại sau hoặc kiểm tra kết nối mạng của bạn.</p>
                <button
                  type='button'
                  onClick={() => activeQuery.refetch()}
                  className='mt-4 inline-flex h-10 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)] transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-[0_14px_30px_rgba(37,99,235,0.28)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 active:scale-95'
                >
                  Thử lại
                </button>
              </div>
            ) : (
              <div
                className={`mb-8 ${
                  viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6' : 'flex flex-col gap-4'
                }`}
              >
                {showSkeleton
                  ? [...Array(pageSize)].map((_, idx) => (
                      <CourseCardListSkeleton key={idx} layout={viewMode} />
                    ))
                  : mappedCourses.map((course) => (
                      <CourseCard
                        key={course.id}
                        {...course}
                        layout={viewMode}
                        onViewCourse={(courseId) =>
                          eventTracker.trackingEvent('VIEW_COURSE', courseId).catch(() => {
                            // ignore tracking errors
                          })
                        }
                      />
                    ))}
              </div>
            )}

            {!showSkeleton && !hasError && mappedCourses.length === 0 && (
              <div className='rounded-2xl border border-blue-100/70 bg-white/80 p-8 text-center shadow-sm'>
                <p className='text-lg font-semibold text-slate-900'>Không có khóa học phù hợp.</p>
                <p className='mt-2 text-sm text-slate-500'>Hãy thử thay đổi bộ lọc hoặc từ khóa để xem thêm kết quả.</p>
              </div>
            )}

            <div className='flex items-center justify-center gap-2'>
              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                loading={showSkeleton}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Index
