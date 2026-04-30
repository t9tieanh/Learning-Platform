import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ClockIcon,
  DashboardIcon,
  HamburgerMenuIcon,
  LightningBoltIcon
} from '@radix-ui/react-icons'

interface SortBarProps {
  totalCourses: number
  sortValue: string
  onSortChange: (value: string) => void
  viewMode: 'list' | 'grid'
  onViewModeChange: (value: 'list' | 'grid') => void
  busy?: boolean
}

export const SortBar = ({ totalCourses, sortValue, onSortChange, viewMode, onViewModeChange, busy }: SortBarProps) => {
  return (
    <div className='mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)] lg:flex-row lg:items-center lg:justify-between'>
      <div className='flex items-center gap-3'>
        <p className='text-sm text-slate-700'>
          Hiển thị <span className='font-semibold text-blue-600'>{totalCourses}</span> khóa học
        </p>
        {busy && (
          <span className='inline-flex items-center gap-2 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600'>
            <span className='h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse' />
            Đang cập nhật
          </span>
        )}
      </div>

      <div className='flex flex-wrap items-center gap-3'>
        <span className='hidden text-sm text-slate-600 sm:block'>Sắp xếp:</span>

        <Select value={sortValue} onValueChange={onSortChange}>
          <SelectTrigger className='h-11 w-[180px] rounded-full border-blue-100 bg-blue-50/60 px-4 text-sm font-medium text-slate-700 shadow-inner transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 focus:ring-4 focus:ring-blue-100 data-[placeholder]:text-slate-500'>
            <SelectValue placeholder='Tiêu chí' />
          </SelectTrigger>
          <SelectContent className='rounded-2xl border-blue-100 bg-white p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.12)]'>
            <SelectItem
              value='newest'
              className='rounded-xl px-3 py-2.5 text-sm font-medium focus:bg-blue-50 focus:text-blue-700'
            >
              <div className='flex items-center gap-2'>
                <ClockIcon className='h-4 w-4 text-blue-500' />
                <span>Mới nhất</span>
              </div>
            </SelectItem>

            <SelectItem
              value='price-low'
              className='rounded-xl px-3 py-2.5 text-sm font-medium focus:bg-blue-50 focus:text-blue-700'
            >
              <div className='flex items-center gap-2'>
                <ArrowUpIcon className='h-4 w-4 text-emerald-500' />
                <span>Giá: Thấp đến cao</span>
              </div>
            </SelectItem>

            <SelectItem
              value='price-high'
              className='rounded-xl px-3 py-2.5 text-sm font-medium focus:bg-blue-50 focus:text-blue-700'
            >
              <div className='flex items-center gap-2'>
                <ArrowDownIcon className='h-4 w-4 text-orange-500' />
                <span>Giá: Cao đến thấp</span>
              </div>
            </SelectItem>

            <SelectItem
              value='recommend'
              className='rounded-xl px-3 py-2.5 text-sm font-medium focus:bg-blue-50 focus:text-blue-700'
            >
              <div className='flex items-center gap-2'>
                <LightningBoltIcon className='h-4 w-4 text-blue-500' />
                <span>Khóa học gợi ý</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <div className='flex items-center gap-1 rounded-full border border-blue-100 bg-white p-1 shadow-sm'>
          <button
            type='button'
            onClick={() => onViewModeChange('list')}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 active:scale-95 ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white shadow-[0_8px_18px_rgba(37,99,235,0.28)]'
                : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
            }`}
            aria-pressed={viewMode === 'list'}
            aria-label='Xem danh sách'
          >
            <HamburgerMenuIcon className='h-4 w-4' />
          </button>
          <button
            type='button'
            onClick={() => onViewModeChange('grid')}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 active:scale-95 ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white shadow-[0_8px_18px_rgba(37,99,235,0.28)]'
                : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
            }`}
            aria-pressed={viewMode === 'grid'}
            aria-label='Xem dạng lưới'
          >
            <DashboardIcon className='h-4 w-4' />
          </button>
        </div>
      </div>
    </div>
  )
}
