import CourseCard from '@/components/Profile/course-cart'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import courseService from '@/services/course/course-student.service'
import { CourseListItem, CourseListResult } from '@/types/course-user'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CustomButton from '@/components/common/Button'
import { Sparkles } from 'lucide-react'

const CourseList = () => {
  // Store an array of items from the API
  const [courses, setCourses] = useState<CourseListItem[]>([])
  const navigator = useNavigate()
  // page size configurable through MAX_SIZE constant
  const MAX_SIZE = 4
  const [page, setPage] = useState<number>(0)
  const [size] = useState<number>(MAX_SIZE)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [hasNext, setHasNext] = useState<boolean>(false)
  const [hasPrevious, setHasPrevious] = useState<boolean>(false)

  const fetchCourses = async (p = 0) => {
    try {
      const response = await courseService.getMyCourse(p, size)
      if (response.code === 200 && response.result) {
        const result: CourseListResult = response.result
        setCourses(result.items || [])
        setPage(result.pagination?.page ?? p)
        setTotalPages(result.pagination?.totalPages ?? 0)
        setHasNext(Boolean(result.pagination?.hasNext))
        setHasPrevious(Boolean(result.pagination?.hasPrevious))
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  useEffect(() => {
    // Load user's courses on mount
    fetchCourses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goToPage = (p: number) => {
    if (p < 0) return
    if (totalPages && p >= totalPages) return
    fetchCourses(p)
  }

  return (
    <div className='cart-section pb-5 px-5 bg-white rounded-lg'>
      <div className='total-cart-item'>
        <p className='text-sm font-semibold mb-1 flex items-center'>
          Bạn đang sỡ hữu &nbsp;<span className='text-primary'>{courses.length || 0}</span>&nbsp; khóa học !
        </p>
        <hr />
      </div>
      <div className='cart-item flex flex-col p-4 gap-4 min-h-[750px]'>
        {(courses.length > 0 ? courses : []).map((item) => (
          <CourseCard key={item.id} courseItem={item} />
        ))}
        {courses.length === 0 && (
          <div className='flex flex-col items-center justify-center py-8'>
            <p className='text-center text-muted-foreground text-sm mb-4'>Bạn chưa có khóa học nào.</p>
            <CustomButton
              label='Khám phá ngay'
              onClick={() => navigator('/')}
              className='gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors'
              icon={<Sparkles size={18} />}
            />
          </div>
        )}
      </div>
      <Pagination className='flex justify-center mt-4'>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href='#'
              onClick={(e) => {
                e.preventDefault()
                if (hasPrevious) goToPage(page - 1)
              }}
            />
          </PaginationItem>

          {/* show a few pages around current */}
          {Array.from({ length: totalPages || 1 }).map((_, idx) => {
            // show only when totalPages is small or when within +/-2 of current
            if (totalPages > 7 && Math.abs(idx - page) > 2 && idx !== 0 && idx !== totalPages - 1) return null
            const label = idx + 1
            return (
              <PaginationItem key={idx}>
                <PaginationLink
                  href='#'
                  onClick={(e) => {
                    e.preventDefault()
                    goToPage(idx)
                  }}
                  className={idx === page ? 'font-bold text-primary' : ''}
                >
                  {label}
                </PaginationLink>
              </PaginationItem>
            )
          })}

          <PaginationItem>
            <PaginationNext
              href='#'
              onClick={(e) => {
                e.preventDefault()
                if (hasNext) goToPage(page + 1)
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

export default CourseList
