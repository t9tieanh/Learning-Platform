import CourseCard from '@/components/Profile/course-cart'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import courseService from '@/services/course/course-student.service'
import { CourseListItem } from '@/types/course-user'
import { useEffect, useState } from 'react'

const CourseList = () => {
  // Store an array of items from the API
  const [courses, setCourses] = useState<CourseListItem[]>([])

  const fetchCourses = async () => {
    try {
      const response = await courseService.getMyCourse()
      if (response.code === 200 && response.result && response.result.items) {
        setCourses(response.result.items)
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

  return (
    <div className='cart-section p-5 bg-white rounded-lg'>
      <div className='total-cart-item'>
        <p className='text-sm font-semibold mb-1 flex items-center'>Bạn đang sỡ hữu 8 khóa học !</p>
        <hr />
      </div>
      <div className='cart-item flex flex-col p-4 gap-4'>
        {(courses.length > 0 ? courses : []).map((item) => (
          <CourseCard key={item.id} courseItem={item} />
        ))}
      </div>
      <Pagination className='flex justify-center mt-4'>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href='#' />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href='#'>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href='#' />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

export default CourseList
