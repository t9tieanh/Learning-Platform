import { FC, useState, useCallback } from 'react'
import { Search } from 'lucide-react'
import CustomButton from '@/components/common/Button'
import { IoAddCircle } from 'react-icons/io5'
import CustomDialog from '@/components/common/Dialog'
import CreateCourseModal from './createCourseModal'
import type { Course } from '@/components/TC_Courses/CourseTypes'

interface CourseSearchBarProps {
  onSearch?: (value: string) => void
  onFilterChange?: (status: string) => void
  onCourseCreated?: (course: Course) => void
  createModalOpen?: boolean
  onCreateModalOpenChange?: (open: boolean) => void
}

const CourseSearchBar: FC<CourseSearchBarProps> = ({
  onSearch,
  onCourseCreated,
  createModalOpen: controlledOpen,
  onCreateModalOpenChange
}) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = useCallback(
    (next: boolean) => {
      onCreateModalOpenChange?.(next)
      if (!isControlled) {
        setInternalOpen(next)
      }
    },
    [isControlled, onCreateModalOpenChange]
  )

  return (
    <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
      <div className='relative w-full md:max-w-md'>
        <Search className='pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors' />
        <input
          type='text'
          placeholder='Tìm kiếm khóa học...'
          className='h-11 w-full rounded-2xl border border-slate-200/80 bg-white/90 pl-11 pr-4 text-sm font-medium text-slate-700 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100'
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>

      <CustomButton
        className='h-11 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(37,99,235,0.35)] active:scale-[0.98]'
        onClick={() => setOpen(true)}
        label='Tạo khóa học mới'
        icon={<IoAddCircle className='mr-2 h-5 w-5' />}
      />

      <CustomDialog
        open={open}
        setOpen={(v) => setOpen(v)}
        title='Tạo khóa học mới'
        hideHeader
        noPadding
        description=''
        className='w-[95vw] max-w-5xl gap-0 overflow-hidden rounded-[2rem] border-0 p-0 shadow-[0_30px_80px_rgba(15,23,42,0.24)]'
        contentClassName='m-0 max-h-[95vh] w-full overflow-y-auto p-0'
        size='xl'
      >
        <CreateCourseModal onCourseCreated={onCourseCreated} />
      </CustomDialog>
    </div>
  )
}

export default CourseSearchBar
