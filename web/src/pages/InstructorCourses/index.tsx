import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Star, BookOpen } from 'lucide-react'
import { CourseCard } from '@/components/AllCourse/CourseCard'
import CourseCardListSkeleton from '@/components/AllCourse/CourseCardListSkeleton'
import CustomPagination from '@/components/common/Pagination/CustomPagination'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import AvatarNotFound from '@/assets/images/avatar-not-found.png'
import heroCourses from '@/assets/images/hero-courses.png'
import useDebounce from '@/hooks/useDebounce.hook'
import useInstructorCourses from '@/hooks/useInstructorCourses.hook'
import { InstructorCoursesSort } from '@/types/instructor-courses.type'

const PAGE_SIZE = 9

const InstructorCoursesPage = () => {
  const { instructorId = '' } = useParams<{ instructorId: string }>()

  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<InstructorCoursesSort>('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const debouncedSearch = useDebounce(search, 300)
  const apiSortBy = sortBy === 'newest' ? 'latest' : sortBy === 'bestseller' ? 'bestSeller' : sortBy

  const coursesQuery = useInstructorCourses({
    instructorId,
    page: currentPage,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    sortBy: apiSortBy,
    sortDirection: 'desc'
  })

  const payload = coursesQuery.data
  const instructor = payload?.instructor
  const pagedCourses = payload?.courses ?? []
  const pagination = payload?.pagination
  const stats = payload?.stats

  const loading = coursesQuery.isLoading
  const fetching = coursesQuery.isFetching
  const hasError = coursesQuery.isError

  return (
    <div className='min-h-[100dvh] bg-[#f4f9fc]'>
      <section
        className='relative isolate overflow-hidden border-b border-slate-200/70 bg-cover bg-center'
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(238, 247, 255, 0) 0%, rgba(223, 240, 251, 0) 55%, rgba(215, 236, 249, 0.5) 100%), url(${heroCourses})`
        }}
      >
        <div className='relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8'>
          <div className='rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] md:p-8'>
            <div className='flex flex-col gap-6 md:flex-row md:items-start md:justify-between'>
              <div className='flex items-start gap-4'>
                <Avatar className='h-20 w-20 border border-slate-200'>
                  <AvatarImage src={instructor?.image || AvatarNotFound} alt={instructor?.name || 'Instructor'} />
                  <AvatarFallback>{(instructor?.name || 'GV').slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className='text-2xl font-bold text-slate-900 md:text-3xl'>{instructor?.name || 'Giảng viên'}</h1>
                  {instructor?.position && <p className='mt-1 text-sm font-medium text-blue-600'>{instructor.position}</p>}
                  <p className='mt-3 text-sm leading-6 text-slate-600 line-clamp-3'>
                    {instructor?.description || 'Đang cập nhật thông tin giảng viên.'}
                  </p>
                </div>
              </div>

              <div className='grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:w-auto md:min-w-[280px]'>
                <div className='rounded-2xl border border-slate-200 bg-white px-4 py-3'>
                  <p className='text-xs text-slate-500'>Tổng khóa học</p>
                  <p className='mt-1 inline-flex items-center gap-2 text-lg font-bold text-slate-900'>
                    <BookOpen className='h-4 w-4 text-blue-600' />
                    {stats?.totalCourses ?? 0}
                  </p>
                </div>
                <div className='rounded-2xl border border-slate-200 bg-white px-4 py-3'>
                  <p className='text-xs text-slate-500'>Đánh giá trung bình</p>
                  <p className='mt-1 inline-flex items-center gap-2 text-lg font-bold text-slate-900'>
                    <Star className='h-4 w-4 text-amber-500' />
                    {Number(stats?.averageRating ?? 0).toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)] md:flex-row md:items-center md:justify-between'>
          <div className='flex items-center gap-3'>
            <p className='text-sm text-slate-700'>
              Hiển thị <span className='font-semibold text-blue-600'>{pagination?.totalItems ?? 0}</span> khóa học
            </p>
            {fetching && (
              <span className='inline-flex items-center gap-2 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600'>
                <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500' />
                Đang cập nhật
              </span>
            )}
          </div>

          <div className='flex w-full flex-col gap-3 md:w-auto md:flex-row'>
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              placeholder='Tìm khóa học...'
              className='h-11 w-full rounded-full border-blue-100 bg-blue-50/60 px-4 text-sm md:w-[260px]'
            />
            <Select
              value={sortBy}
              onValueChange={(value: InstructorCoursesSort) => {
                setSortBy(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className='h-11 w-full rounded-full border-blue-100 bg-blue-50/60 px-4 text-sm font-medium text-slate-700 md:w-[220px]'>
                <SelectValue placeholder='Sắp xếp' />
              </SelectTrigger>
              <SelectContent className='rounded-2xl border-blue-100 bg-white p-1.5'>
                <SelectItem value='newest'>Mới nhất</SelectItem>
                <SelectItem value='rating'>Đánh giá cao nhất</SelectItem>
                <SelectItem value='students'>Nhiều học viên nhất</SelectItem>
                <SelectItem value='bestseller'>Bán chạy nhất</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasError ? (
          <div className='rounded-2xl border border-red-100 bg-white/80 p-6 text-slate-700 shadow-sm'>
            <p className='text-base font-semibold text-slate-900'>Không thể tải dữ liệu khóa học của giảng viên.</p>
            <p className='mt-2 text-sm text-slate-500'>Vui lòng thử lại sau hoặc kiểm tra kết nối mạng của bạn.</p>
          </div>
        ) : (
          <>
            <div className='mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3'>
              {loading
                ? [...Array(PAGE_SIZE)].map((_, idx) => <CourseCardListSkeleton key={idx} layout='grid' />)
                : pagedCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      id={course.id}
                      title={course.title || 'Chưa có tiêu đề'}
                      description={course.shortDescription || ''}
                      originalPrice={course.originalPrice || 0}
                      salePrice={course.finalPrice || 0}
                      instructor={{
                        name: instructor?.name || course.instructor?.name || 'Giảng viên',
                        avatar: instructor?.image || course.instructor?.image || AvatarNotFound
                      }}
                      rating={Number(course.rating || 0)}
                      reviewCount={0}
                      category={undefined}
                      level={course.level || 'Mọi cấp độ'}
                      isBestseller={Boolean(course.isBestseller)}
                      thumbnail={course.thumbnailUrl || AvatarNotFound}
                      layout='grid'
                    />
                  ))}
            </div>

            {!loading && pagedCourses.length === 0 && (
              <div className='rounded-2xl border border-blue-100/70 bg-white/80 p-8 text-center shadow-sm'>
                <p className='text-lg font-semibold text-slate-900'>Giảng viên chưa có khóa học phù hợp.</p>
                <p className='mt-2 text-sm text-slate-500'>Hãy thử thay đổi từ khóa tìm kiếm hoặc quay lại sau.</p>
              </div>
            )}

            {!loading && (pagination?.totalItems ?? 0) > 0 && (
              <div className='flex items-center justify-center gap-2'>
                <CustomPagination
                  currentPage={pagination?.page ?? currentPage}
                  totalPages={pagination?.totalPages ?? 1}
                  onPageChange={setCurrentPage}
                  loading={loading}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default InstructorCoursesPage
