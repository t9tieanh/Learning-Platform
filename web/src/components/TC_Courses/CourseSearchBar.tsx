import { FC } from 'react'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

interface CourseSearchBarProps {
  onCreate?: () => void
  onSearch?: (value: string) => void
}

const CourseSearchBar: FC<CourseSearchBarProps> = ({ onCreate, onSearch }) => {
  return (
    <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
      <div className='relative w-full sm:w-1/3'>
        <Search className='absolute left-3 top-3 w-5 h-5 text-blue-400 peer-focus:text-blue-600 transition-colors' />
        <input
          type='text'
          placeholder='Tìm kiếm khóa học...'
          className='peer w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm transition'
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>

      <Button
        className='bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition'
        onClick={onCreate}
      >
        Tạo khóa học
      </Button>
    </div>
  )
}

export default CourseSearchBar
