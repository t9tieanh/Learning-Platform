import { FC, useState } from 'react'
import { Search } from 'lucide-react'
import CustomButton from '@/components/common/Button'
import { IoAddCircle } from 'react-icons/io5'
import CustomDialog from '@/components/common/Dialog'
import CreateCourseModal from './createCourseModal'

interface CourseSearchBarProps {
  onSearch?: (value: string) => void
  onFilterChange?: (status: string) => void
}

const CourseSearchBar: FC<CourseSearchBarProps> = ({ onSearch }) => {
  const [open, setOpen] = useState(false)

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

      <CustomButton
        className='bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition'
        onClick={() => setOpen(true)}
        label='Tạo khóa học mới'
        icon={<IoAddCircle className='h-6 w-6 mr-2' />}
      />
      <CustomDialog
        open={open}
        setOpen={setOpen}
        title={
          <>
            <IoAddCircle className='h-6 w-6' /> Tạo khóa học mới
          </>
        }
        description='Hãy bắt đầu bằng cách chọn loại khóa học bạn muốn tạo.'
        className='w-[90%] max-w-md'
      >
        <CreateCourseModal />
      </CustomDialog>
    </div>
  )
}

export default CourseSearchBar
