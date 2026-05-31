import { useQuery } from '@tanstack/react-query'
import courseUserService from '@/services/course/course-user.service'

type Params = {
  instructorId: string
  page: number
  limit: number
  search?: string
  sortBy?: 'latest' | 'rating' | 'students' | 'bestSeller'
  sortDirection?: 'asc' | 'desc'
}

const useInstructorCourses = (params: Params) => {
  const { instructorId, page, limit, search, sortBy = 'latest', sortDirection = 'desc' } = params

  return useQuery({
    queryKey: ['instructor', 'courses', instructorId, page, limit, search || '', sortBy, sortDirection],
    enabled: Boolean(instructorId),
    queryFn: async () => {
      const res = await courseUserService.getInstructorPublicCourses({
        instructorId,
        page,
        limit,
        search,
        sortBy,
        sortDirection
      })
      return res.result
    },
    staleTime: 2 * 60 * 1000
  })
}

export default useInstructorCourses
