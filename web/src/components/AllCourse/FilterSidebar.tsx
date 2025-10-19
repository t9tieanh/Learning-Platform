import { useState } from 'react'
import { Search, ChevronDown, ChevronUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'

export const FilterSidebar = () => {
  const [categoryOpen, setCategoryOpen] = useState(true)
  const [ratingOpen, setRatingOpen] = useState(true)
  const [showAllCategories, setShowAllCategories] = useState(false)

  const categories = [
    'Lập trình',
    'Thiết kế',
    'Kinh doanh',
    'Marketing',
    'Phát triển cá nhân',
    'Ngoại ngữ',
    'Nhiếp ảnh',
    'Âm nhạc'
  ]

  const displayedCategories = showAllCategories ? categories : categories.slice(0, 5)

  return (
    <div className='w-80 bg-card border-r border-border p-6 overflow-y-auto h-screen sticky top-0'>
      {/* Search */}
      <div className='mb-6'>
        <Label className='mb-2 block text-base font-medium'>Tìm kiếm khóa học</Label>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground active:bg-blue-500' />
          <Input placeholder='Nhập tên khóa học...' className='pl-10' />
        </div>
      </div>

      {/* Categories */}
      <div className='mb-6'>
        <button
          onClick={() => setCategoryOpen(!categoryOpen)}
          className='flex items-center justify-between w-full mb-3 text-sm font-medium'
        >
          <span>Danh mục</span>
          {categoryOpen ? <ChevronUp className='w-4 h-4' /> : <ChevronDown className='w-4 h-4' />}
        </button>
        {categoryOpen && (
          <div className='space-y-3'>
            {displayedCategories.map((category) => (
              <div key={category} className='flex items-center space-x-2'>
                <Checkbox id={category} className='w-5 h-5' />
                <label
                  htmlFor={category}
                  className='text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                >
                  {category}
                </label>
              </div>
            ))}
            {categories.length > 5 && (
              <button
                onClick={() => setShowAllCategories(!showAllCategories)}
                className='text-sm text-primary font-medium hover:underline mt-2'
              >
                {showAllCategories ? 'Thu gọn' : `Xem thêm ${categories.length - 5} danh mục`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Price */}
      <div className='mb-6'>
        <div className='mt-4'>
          <Label className='text-sm mb-2 block'>Khoảng giá (VNĐ)</Label>
          <Slider defaultValue={[500000]} max={2000000} step={100000} className='mb-2' />
          <div className='flex justify-between text-xs text-muted-foreground'>
            <span>0đ</span>
            <span>2.000.000đ</span>
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className='mb-6'>
        <button
          onClick={() => setRatingOpen(!ratingOpen)}
          className='flex items-center justify-between w-full mb-3 text-sm font-medium'
        >
          <span>Đánh giá</span>
          {ratingOpen ? <ChevronUp className='w-4 h-4' /> : <ChevronDown className='w-4 h-4' />}
        </button>
        {ratingOpen && (
          <div className='space-y-2'>
            {[5, 4, 3].map((stars) => (
              <div key={stars} className='flex items-center space-x-2'>
                <Checkbox id={`rating-${stars}`} className='w-5 h-5' />
                <label htmlFor={`rating-${stars}`} className='text-sm cursor-pointer flex items-center gap-1'>
                  <span>{stars}</span>
                  <span className='text-yellow-400'>★</span>
                  <span className='text-muted-foreground'>trở lên</span>
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
