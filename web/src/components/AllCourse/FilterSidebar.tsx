import { useEffect, useMemo, useState } from 'react'
import { MagnifyingGlassIcon, MixerHorizontalIcon, StarIcon } from '@radix-ui/react-icons'
import { TagPicker } from 'rsuite'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import categoryService from '@/services/course/category.service'

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
  const [categories, setCategories] = useState<{ id: string; name: string; description: string }[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [draftPrice, setDraftPrice] = useState(minPrice ?? 0)

  const formatPrice = (value: number) => `${value.toLocaleString('vi-VN')}đ`

  useEffect(() => {
    setDraftPrice(minPrice ?? 0)
  }, [minPrice])

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

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ label: category.name, value: category.name })),
    [categories]
  )

  return (
    <aside className='hidden md:block self-start'>
      <div className='sticky top-6 max-h-[calc(100dvh-48px)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]'>
        <div className='mb-7 flex items-center gap-3'>
          <span className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600'>
            <MixerHorizontalIcon className='h-4 w-4' />
          </span>
          <h2 className='text-base font-semibold text-slate-900'>Bộ lọc</h2>
        </div>

        <div className='mb-6'>
          <Label className='mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500'>Tìm kiếm</Label>
          <div className='relative'>
            <MagnifyingGlassIcon className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500' />
            <Input
              data-testid='course-search-input'
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder='Nhập tên khóa học...'
              className='h-9 rounded-full border-blue-100 bg-blue-50/60 pl-9 text-xs text-slate-700 shadow-inner focus-visible:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-300/40'
            />
          </div>
        </div>

        <div className='mb-7'>
          <Label className='mb-3 text-[11px] font-bold uppercase tracking-wide text-slate-500'>Danh mục</Label>
          <TagPicker
            data={categoryOptions}
            value={selectedCategories}
            onChange={(value) => onCategoriesChange(value ?? [])}
            loading={loadingCategories}
            placeholder='Chọn danh mục'
            block
            cleanable
            searchable
            className='w-full category-tag-picker'
            popupClassName='category-tag-picker-popup text-sm'
          />
        </div>

        <div className='mb-7'>
          <Label className='mb-3 text-[11px] font-bold uppercase tracking-wide text-slate-500'>Khoảng giá (VNĐ)</Label>
          <Slider
            value={[draftPrice]}
            onValueChange={(val) => setDraftPrice(val?.[0] ?? 0)}
            onValueCommit={(val) => onMinPriceChange(val?.[0] ?? 0)}
            max={2000000}
            step={100000}
            className='mb-3 [&_[data-slot=slider-track]]:h-1.5 [&_[data-slot=slider-track]]:bg-slate-200 [&_[data-slot=slider-range]]:bg-blue-600 [&_[data-slot=slider-thumb]]:size-4 [&_[data-slot=slider-thumb]]:border-blue-500 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:shadow-sm [&_[data-slot=slider-thumb]]:focus-visible:ring-blue-400/50'
          />
          <div className='mb-3 inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700'>
            {draftPrice > 0 ? `Đang lọc từ ${formatPrice(draftPrice)} trở lên` : 'Đang hiển thị tất cả mức giá'}
          </div>
          <div className='flex justify-between text-[11px] font-medium text-slate-500'>
            <span>0đ</span>
            <span>2.000.000đ</span>
          </div>
        </div>

        <div className='mb-7'>
          <Label className='mb-3 text-[11px] font-bold uppercase tracking-wide text-slate-500'>Đánh giá</Label>
          <div className='space-y-3'>
            {[5, 4, 3].map((stars) => (
              <label key={stars} htmlFor={`rating-${stars}`} className='flex cursor-pointer items-center gap-2'>
                <Checkbox
                  id={`rating-${stars}`}
                  checked={minRating === stars}
                  onCheckedChange={(checked) => {
                    if (checked === true) return onMinRatingChange(stars)
                    if (minRating === stars) return onMinRatingChange(undefined)
                  }}
                  className='h-4 w-4 rounded-full border-blue-500 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600'
                />
                <span className='flex items-center gap-1 text-sm text-slate-700'>
                  <StarIcon className='h-3.5 w-3.5 text-amber-400' />
                  <span>{stars} trở lên</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <button
          type='button'
          onClick={() => {
            onSearchChange('')
            onCategoriesChange([])
            onMinPriceChange(undefined)
            onMinRatingChange(undefined)
          }}
          className='h-10 w-full rounded-full border border-slate-100 bg-white text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:border-blue-200 hover:text-blue-600'
        >
          Xóa bộ lọc
        </button>
      </div>
    </aside>
  )
}
