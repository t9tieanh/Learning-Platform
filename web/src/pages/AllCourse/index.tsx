import { useEffect, useMemo, useState, MouseEvent } from 'react'
import { CourseCard } from '@/components/AllCourse/CourseCard'
import CourseCardListSkeleton from '@/components/AllCourse/CourseCardListSkeleton'
import { FilterSidebar } from '@/components/AllCourse/FilterSidebar'
import { SortBar } from '@/components/AllCourse/SortBar'
import CustomPagination from '@/components/common/Pagination/CustomPagination'
import instructorAvatar from '@/assets/images/course.jpg'
import courseService from '@/services/course/course-user.service'
import useDebounce from '@/hooks/useDebounce.hook'
import eventTracker from '@/services/personalize/eventTracker'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

type PaginationItem = number | 'ellipsis'

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
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortValue, setSortValue] = useState('')
  const [search, setSearch] = useState('')
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined)
  const [minRating, setMinRating] = useState<number | undefined>(undefined)
  const debouncedSearch = useDebounce(search, 400)

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
    placeholderData: keepPreviousData,
    retry: false
  })

  const activeQuery = sortValue === 'recommend' ? recommendQuery : allCoursesQuery

  const items = useMemo(() => activeQuery.data?.items ?? [], [activeQuery.data?.items])
  const totalPages = activeQuery.data?.totalPages ?? 1
  const totalElements = activeQuery.data?.totalElements ?? 0
  const loading = activeQuery.isLoading
  const busy = activeQuery.isFetching

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

  // const paginationItems = useMemo(() => {
  //   // Keep pagination compact to avoid UI overflow.
  //   // Smaller screens get fewer siblings.
  //   const siblingCount = 1
  //   const boundaryCount = 1
  //   return getPaginationItems(totalPages, currentPage, siblingCount, boundaryCount)
  // }, [totalPages, currentPage])

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
              : mappedCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    {...course}
                    onViewCourse={(courseId) =>
                      eventTracker.trackingEvent('VIEW_COURSE', courseId).catch(() => {
                        // ignore tracking errors
                      })
                    }
                  />
                ))}
          </div>

          <div className='flex items-center justify-center gap-2'>
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              loading={loading}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default Index
