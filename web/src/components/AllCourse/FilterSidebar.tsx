import { useState } from 'react'
import {
  Search,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Star,
  Wallet
} from 'lucide-react'
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
    <div className='w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto h-screen sticky top-0'>
      {/* Search */}
      <div className='mb-8'>
        <div className='relative'>
          <Label className='mb-2 block text-base font-semibold text-gray-700 flex items-center gap-2'>
            <Search className='w-5 h-5 text-blue-500' />
            <span>Tìm kiếm khóa học</span>
          </Label>
          <Input
            placeholder='Nhập tên khóa học...'
            className='pl-10 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200'
          />
        </div>
      </div>

      {/* Categories */}
      <div className='mb-8'>
        <button
          onClick={() => setCategoryOpen(!categoryOpen)}
          className='flex items-center gap-2 w-full mb-3 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors'
        >
          <BookOpen className='w-5 h-5 text-blue-500' />
          <span>Danh mục</span>
          {categoryOpen ? (
            <ChevronUp className='w-4 h-4 text-blue-500' />
          ) : (
            <ChevronDown className='w-4 h-4 text-blue-500' />
          )}
        </button>
        {categoryOpen && (
          <div className='space-y-3'>
            {displayedCategories.map((category) => (
              <label
                key={category}
                htmlFor={category}
                className='flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-blue-50 transition-colors'
              >
                <Checkbox
                  id={category}
                  className='w-5 h-5 border-blue-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500'
                />
                <span className='text-sm text-gray-700'>{category}</span>
              </label>
            ))}
            {categories.length > 5 && (
              <button
                onClick={() => setShowAllCategories(!showAllCategories)}
                className='text-sm text-blue-500 font-medium hover:underline mt-2'
              >
                {showAllCategories ? 'Thu gọn' : `Xem thêm ${categories.length - 5} danh mục`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Price */}
      <div className='mb-8'>
        <Label className='text-sm mb-3 block font-semibold text-gray-700 flex items-center gap-2'>
          <Wallet className='w-5 h-5 text-blue-500' />
          <span>Khoảng giá (VNĐ)</span>
        </Label>
        <Slider defaultValue={[500000]} max={2000000} step={100000} className='mb-2' />
        <div className='flex justify-between text-xs text-gray-500 font-medium'>
          <span>0đ</span>
          <span>2.000.000đ</span>
        </div>
      </div>

      {/* Rating */}
      <div className='mb-8'>
        <button
          onClick={() => setRatingOpen(!ratingOpen)}
          className='flex items-center justify-between w-full mb-3 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors'
        >
          <div className='flex items-center gap-2'>
            <Star className='w-5 h-5 text-blue-500' />
            <span>Đánh giá</span>
          </div>
          {ratingOpen ? (
            <ChevronUp className='w-4 h-4 text-blue-500' />
          ) : (
            <ChevronDown className='w-4 h-4 text-blue-500' />
          )}
        </button>
        {ratingOpen && (
          <div className='space-y-2'>
            {[5, 4, 3].map((stars) => (
              <label
                key={stars}
                htmlFor={`rating-${stars}`}
                className='flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-blue-50 transition-colors'
              >
                <Checkbox
                  id={`rating-${stars}`}
                  className='w-5 h-5 border-blue-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500'
                />
                <span className='text-sm text-gray-700 flex items-center gap-1'>
                  <span>{stars}</span>
                  <span className='text-yellow-400'>★</span>
                  <span className='text-gray-500'>trở lên</span>
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
