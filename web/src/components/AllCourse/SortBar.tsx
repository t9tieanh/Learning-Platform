import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, Clock, ArrowDown, ArrowUp } from 'lucide-react'

interface SortBarProps {
  totalCourses: number
  sortValue: string
  onSortChange: (value: string) => void
}

export const SortBar = ({ totalCourses, sortValue, onSortChange }: SortBarProps) => {
  return (
    <div className='flex items-center justify-between mb-8 bg-card/60 backdrop-blur-sm border border-border/60 rounded-xl px-5 py-3 shadow-sm'>
      {/* Bên trái: tổng số khóa học */}
      <p className='text-sm sm:text-base text-muted-foreground'>
        Hiển thị <span className='font-semibold text-primary'>{totalCourses}</span> khóa học được tìm thấy
      </p>

      {/* Bên phải: bộ lọc sắp xếp */}
      <div className='flex items-center gap-3'>
        <span className='text-sm text-muted-foreground hidden sm:block'>Sắp xếp theo:</span>

        <Select value={sortValue} onValueChange={onSortChange}>
          <SelectTrigger className='w-[180px] bg-background/70 border-border/70 hover:border-primary/40 transition-all duration-200'>
            <SelectValue placeholder='Tiêu chí' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='newest'>
              <div className='flex items-center gap-2'>
                <Clock className='w-4 h-4 text-blue-500' />
                <span>Mới nhất</span>
              </div>
            </SelectItem>

            <SelectItem value='price-low'>
              <div className='flex items-center gap-2'>
                <ArrowDown className='w-4 h-4 text-green-500' />
                <span>Giá thấp nhất</span>
              </div>
            </SelectItem>

            <SelectItem value='price-high'>
              <div className='flex items-center gap-2'>
                <ArrowUp className='w-4 h-4 text-orange-500' />
                <span>Giá cao nhất</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
