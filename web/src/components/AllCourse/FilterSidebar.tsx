import { useEffect, useMemo, useState } from 'react'
import { Search, ChevronDown, ChevronUp, BookOpen, Star, Wallet } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import categoryService from '@/services/course/category.service'
import { Loader } from '../ui/loader'

interface FilterSidebarProps {
  selectedCategories: string[]
  onCategoriesChange: (categories: string[]) => void
  search: string
  onSearchChange: (value: string) => void
  minPrice?: number
  onMinPriceChange: (value?: number) => void
  minRating?: number
  onMinRatingChange: (value?: number) => void
}

export const FilterSidebar = ({
  selectedCategories,
  onCategoriesChange,
  search,
  onSearchChange,
  minPrice,
  onMinPriceChange,
  minRating,
  onMinRatingChange
}: FilterSidebarProps) => {
  const [categoryOpen, setCategoryOpen] = useState(true)
  const [ratingOpen, setRatingOpen] = useState(true)
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [categories, setCategories] = useState<{ id: string; name: string; description: string }[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)

  useEffect(() => {
    let mounted = true
    const fetchCategories = async () => {
      setLoadingCategories(true)
      try {
        const res = await categoryService.getValidCategories()
        if (!mounted) return
        setCategories(res?.result ?? [])
      } catch (e) {
        console.error('Failed to load categories', e)
        if (mounted) setCategories([])
      } finally {
        if (mounted) setLoadingCategories(false)
      }
    }
    fetchCategories()
    return () => {
      mounted = false
    }
  }, [])

  const displayedCategories = useMemo(() => {
    const names = categories.map((c) => c.name)
    return showAllCategories ? names : names.slice(0, 5)
  }, [categories, showAllCategories])

  return (
    <div className='hidden md:block w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto h-screen sticky top-0'>
      {/* Search */}
      <div className='mb-8'>
        <div className='relative'>
          <Label className='mb-2 text-base font-semibold text-gray-700 flex items-center gap-2'>
            <Search className='w-5 h-5 text-blue-500' />
            <span>Tìm kiếm khóa học</span>
          </Label>
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
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
            {loadingCategories && <Loader />}
            <label
              key={'__all__'}
              htmlFor={'__all__'}
              className='flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-blue-50 transition-colors'
            >
              <Checkbox
                id={'__all__'}
                checked={selectedCategories.length === 0}
                onCheckedChange={(checked) => {
                  if (checked === true) onCategoriesChange([])
                }}
                className='w-5 h-5 border-blue-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500'
              />
              <span className='text-sm text-gray-700'>Tất cả</span>
            </label>
            {displayedCategories.map((category) => (
              <label
                key={category}
                htmlFor={category}
                className='flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-blue-50 transition-colors'
              >
                <Checkbox
                  id={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={(checked) => {
                    if (checked === true) {
                      const next = Array.from(new Set([...(selectedCategories || []), category]))
                      onCategoriesChange(next)
                    } else if (checked === false) {
                      const next = (selectedCategories || []).filter((c) => c !== category)
                      onCategoriesChange(next)
                    }
                  }}
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
        <Label className='text-sm mb-3 font-semibold text-gray-700 flex items-center gap-2'>
          <Wallet className='w-5 h-5 text-blue-500' />
          <span>Khoảng giá (VNĐ)</span>
        </Label>
        <Slider
          value={[minPrice ?? 0]}
          onValueChange={(val) => onMinPriceChange(val?.[0] ?? 0)}
          max={2000000}
          step={100000}
          className='mb-2'
        />
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
                  checked={minRating === stars}
                  onCheckedChange={(checked) => {
                    if (checked === true) return onMinRatingChange(stars)
                    if (minRating === stars) return onMinRatingChange(undefined)
                  }}
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
