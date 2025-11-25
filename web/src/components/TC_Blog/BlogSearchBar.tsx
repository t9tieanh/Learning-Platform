import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import CustomButton from '@/components/common/Button'
import { IoAddCircle } from 'react-icons/io5'
import courseUserService from '@/services/course/course-user.service'
import { useAuthStore } from '@/stores/useAuth.stores'

interface BlogSearchBarProps {
  onSearch?: (value: string) => void
  hideCreateButton?: boolean
}

const BlogSearchBar: FC<BlogSearchBarProps> = ({ onSearch, hideCreateButton }) => {
  const navigate = useNavigate()
  const { data } = useAuthStore()
  const instructorId = data?.userId || (data as any)?.id
  const [courseCount, setCourseCount] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    let mounted = true
      ; (async () => {
        if (!instructorId) return
        try {
          setLoading(true)
          const res = await courseUserService.countInstructorCourseValid({ instructorId })
          // expect res.result to have count or direct numeric value
          const count = typeof res?.result === 'number' ? res.result : res?.result?.count ?? 0
          if (mounted) setCourseCount(count)
        } catch (e) {
          if (mounted) setCourseCount(0)
        } finally {
          if (mounted) setLoading(false)
        }
      })()
    return () => {
      mounted = false
    }
  }, [instructorId])

  const canCreate = (courseCount ?? 0) >= 5
  const tooltipMsg = !canCreate ? 'Bạn phải tạo ít nhất 5 khóa học mới được đăng bài viết' : undefined

  return (
    <div className='flex justify-between items-center flex-col sm:flex-row gap-4'>
      <div className='relative w-full sm:w-1/3'>
        <Search className='absolute left-3 top-3 w-5 h-5 text-blue-400 peer-focus:text-blue-600 transition-colors' />
        <input
          type='text'
          placeholder='Tìm kiếm bài viết...'
          className='peer w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm transition'
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>
      {!hideCreateButton && (
        <div className='relative group'>
          <CustomButton
            className={`bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-6 py-2.5 rounded-xl shadow-md transition ${!canCreate ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:scale-105'
              }`}
            label={loading ? 'Đang kiểm tra...' : 'Tạo bài viết mới'}
            icon={<IoAddCircle className='h-6 w-6 mr-2' />}
            onClick={() => {
              if (!canCreate) return
              navigate('/teacher/create-blog')
            }}
            disabled={!canCreate || loading}
          />
          {!canCreate && !loading && (
            <div className='absolute -top-100 left-1/4 -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-xs px-3 py-1 rounded-md shadow opacity-0 group-hover:opacity-100 transition-opacity'>
              {tooltipMsg}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BlogSearchBar
