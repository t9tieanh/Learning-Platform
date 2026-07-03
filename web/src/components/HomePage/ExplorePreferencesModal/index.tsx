import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import * as DialogPrimitive from '@radix-ui/react-dialog'

import CustomButton from '@/components/common/Button'
import MultiSelectSearch, { type MultiSelectOption } from '@/components/common/MultiSelectSearch'
import { Input } from '@/components/ui/input'
import useLockBodyScroll from '@/hooks/useLockBodyScroll'
import categoryService from '@/services/course/category.service'
import eventTracker from '@/services/personalize/eventTracker'
import personalizationService from '@/services/personalize/personalization.service'
import tagsService from '@/services/course/tags.service'
import { useAuthStore } from '@/stores/useAuth.stores'
import { parseKeywords, sameSelection, type CategoryOption } from '@/utils/personalization'
import cover from '@/assets/images/cover-banner-prefence.avif'

export type ExplorePreferencesPayload = {
  categories: string[]
  tags: string[]
  keywords: string[]
}

const MAX_SELECTIONS_PER_SECTION = 3
const MAX_VISIBLE_CATEGORIES = 6
const CATEGORY_ICONS = ['💻', '⚙️', '🌍', '💼', '🔬', '📊']
const BENEFIT_HIGHLIGHTS = [
  {
    title: 'Cá nhân hóa lộ trình',
    description: 'Ưu tiên nội dung theo danh mục và công nghệ bạn thật sự quan tâm.'
  },
  {
    title: 'Tăng tốc gợi ý khóa học',
    description: 'Thu hẹp hàng nghìn khóa học xuống đúng nhóm phù hợp.'
  },
  {
    title: 'Đồng bộ trên toàn hệ sinh thái',
    description: 'Sở thích của bạn được áp dụng cho blog, khuyến nghị và trợ lý AI.'
  }
]

function mapCategoriesToOptions(categories: { id: string; name: string; description: string }[]): CategoryOption[] {
  return categories.slice(0, MAX_VISIBLE_CATEGORIES).map((category) => ({
    value: category.id,
    label: category.name,
    description: category.description || 'Khám phá thêm nội dung phù hợp với sở thích của bạn.'
  }))
}

function mapTagsToOptions(tags: { id: string; name: string }[]): MultiSelectOption[] {
  return tags.map((tag) => ({
    value: tag.id,
    label: tag.name
  }))
}

export default function ExplorePreferencesModal({
  open,
  onOpenChange,
  onSave
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (payload: ExplorePreferencesPayload) => void
}) {
  useLockBodyScroll(open)
  const userId = useAuthStore((state) => state.data?.userId)

  const initialCachedTagOptions = useMemo(() => {
    const cachedResponse = tagsService.getCachedAllTags()
    const cachedTags = cachedResponse?.result ?? cachedResponse?.data ?? []
    return mapTagsToOptions(cachedTags)
  }, [])

  const [categories, setCategories] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [keywordText, setKeywordText] = useState('')
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([])
  const [tagOptions, setTagOptions] = useState<MultiSelectOption[]>(initialCachedTagOptions)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isLoadingTags, setIsLoadingTags] = useState(initialCachedTagOptions.length === 0)
  const [isSaving, setIsSaving] = useState(false)
  const [categoryError, setCategoryError] = useState('')
  const [tagError, setTagError] = useState('')
  const [keywordError, setKeywordError] = useState('')
  const [initialCategories, setInitialCategories] = useState<string[]>([])
  const [initialTags, setInitialTags] = useState<string[]>([])
  const [initialKeywords, setInitialKeywords] = useState<string[]>([])

  useEffect(() => {
    let isCancelled = false

    const loadPersonalization = async () => {
      if (!open) return

      if (!userId) {
        if (!isCancelled) {
          setCategories([])
          setTags([])
          setKeywordText('')
          setInitialCategories([])
          setInitialTags([])
          setInitialKeywords([])
        }
        return
      }

      try {
        const response = await personalizationService.getByUserId(userId)
        const result = response?.result
        if (!result || isCancelled) return

        const categoryValueByLabel = new Map(
          categoryOptions.map((option) => [option.label.trim().toLowerCase(), option.value])
        )
        const tagValueByLabel = new Map(tagOptions.map((option) => [option.label.trim().toLowerCase(), option.value]))

        const nextCategories = (result.categories ?? [])
          .map((item) => categoryValueByLabel.get(item.trim().toLowerCase()))
          .filter((item): item is string => Boolean(item))
        const nextTags = (result.tags ?? [])
          .map((item) => tagValueByLabel.get(item.trim().toLowerCase()))
          .filter((item): item is string => Boolean(item))

        setCategories(nextCategories)
        setTags(nextTags)
        const nextKeywords = result.longDescriptions ?? []
        setKeywordText(nextKeywords.join(', '))
        setInitialCategories(nextCategories)
        setInitialTags(nextTags)
        setInitialKeywords(nextKeywords)
      } catch {
        // keep UX non-blocking if personalization API temporarily fails
      }
    }

    void loadPersonalization()

    return () => {
      isCancelled = true
    }
  }, [open, userId, categoryOptions, tagOptions])

  const categoryLabelByValue = useMemo(
    () => new Map(categoryOptions.map((option) => [option.value, option.label])),
    [categoryOptions]
  )
  const tagLabelByValue = useMemo(() => new Map(tagOptions.map((option) => [option.value, option.label])), [tagOptions])

  useEffect(() => {
    let isCancelled = false

    const fetchCategories = async () => {
      setIsLoadingCategories(true)

      try {
        const response = await categoryService.getAllCategories()
        const nextCategoryOptions = mapCategoriesToOptions(response?.result ?? response?.data ?? [])

        if (!isCancelled) {
          setCategoryOptions(nextCategoryOptions)
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingCategories(false)
        }
      }
    }

    const fetchTags = async () => {
      const cachedResponse = tagsService.getCachedAllTags()
      const cachedTags = cachedResponse?.result ?? cachedResponse?.data ?? []

      if (cachedTags.length > 0) {
        setTagOptions(mapTagsToOptions(cachedTags))
        setIsLoadingTags(false)
        return
      }

      setIsLoadingTags(true)

      try {
        const response = await tagsService.getAllTags()
        const nextTagOptions = mapTagsToOptions(response?.result ?? response?.data ?? [])

        if (!isCancelled) {
          setTagOptions(nextTagOptions)
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingTags(false)
        }
      }
    }

    void fetchCategories()
    void fetchTags()

    return () => {
      isCancelled = true
    }
  }, [])

  const toggleCategory = useCallback((value: string) => {
    setCategories((prev) => {
      if (prev.includes(value)) {
        setCategoryError('')
        return prev.filter((item) => item !== value)
      }

      if (prev.length >= MAX_SELECTIONS_PER_SECTION) {
        setCategoryError(`Bạn chỉ có thể chọn tối đa ${MAX_SELECTIONS_PER_SECTION} danh mục.`)
        return prev
      }

      setCategoryError('')
      return [...prev, value]
    })
  }, [])

  const handleTagsChange = useCallback((nextTags: string[]) => {
    if (nextTags.length > MAX_SELECTIONS_PER_SECTION) {
      setTagError(`Bạn chỉ có thể chọn tối đa ${MAX_SELECTIONS_PER_SECTION} công nghệ.`)
      return
    }

    setTagError('')
    setTags(nextTags)
  }, [])

  const isTagOptionDisabled = useCallback(
    (option: MultiSelectOption) => tags.length >= MAX_SELECTIONS_PER_SECTION && !tags.includes(option.value),
    [tags]
  )

  const handleKeywordTextChange = useCallback((nextKeywordText: string) => {
    const nextKeywords = parseKeywords(nextKeywordText)

    if (nextKeywords.length > MAX_SELECTIONS_PER_SECTION) {
      setKeywordError(`Bạn chỉ có thể nhập tối đa ${MAX_SELECTIONS_PER_SECTION} từ khóa.`)
      return
    }

    setKeywordError('')
    setKeywordText(nextKeywordText)
  }, [])

  const parsedKeywords = useMemo(() => parseKeywords(keywordText), [keywordText])

  // All selected items for the summary bar
  const allSelections = useMemo(() => {
    const items: { key: string; label: string; type: 'category' | 'tag' | 'keyword'; value: string }[] = []
    categories.forEach((v) =>
      items.push({ key: `cat-${v}`, label: categoryLabelByValue.get(v) ?? v, type: 'category', value: v })
    )
    tags.forEach((v) => items.push({ key: `tag-${v}`, label: tagLabelByValue.get(v) ?? v, type: 'tag', value: v }))
    parsedKeywords.forEach((k) => items.push({ key: `kw-${k}`, label: k, type: 'keyword', value: k }))
    return items
  }, [categories, tags, parsedKeywords, categoryLabelByValue, tagLabelByValue])

  const summaryStats = useMemo(
    () => [
      { label: 'Danh mục', value: categories.length },
      { label: 'Công nghệ', value: tags.length },
      { label: 'Từ khóa', value: parsedKeywords.length }
    ],
    [categories.length, parsedKeywords.length, tags.length]
  )

  const removeSelection = useCallback(
    (item: { label: string; type: 'category' | 'tag' | 'keyword'; value: string }) => {
      if (item.type === 'category') {
        setCategoryError('')
        setCategories((prev) => prev.filter((value) => value !== item.value))
      } else if (item.type === 'tag') {
        setTagError('')
        setTags((prev) => prev.filter((value) => value !== item.value))
      } else {
        setKeywordError('')
        const remaining = parsedKeywords.filter((k) => k !== item.label)
        setKeywordText(remaining.join(', '))
      }
    },
    [parsedKeywords]
  )

  const handleClearAll = useCallback(() => {
    setCategories([])
    setTags([])
    setKeywordText('')
    setCategoryError('')
    setTagError('')
    setKeywordError('')
  }, [])

  const handleSave = useCallback(async () => {
    if (isSaving) return

    setIsSaving(true)

    try {
      if (userId) {
        await personalizationService.save({
          userId,
          categories: categories.map((v) => categoryLabelByValue.get(v) ?? v),
          tags: tags.map((v) => tagLabelByValue.get(v) ?? v),
          longDescriptions: parsedKeywords
        })
      }

      await eventTracker.trackingEvent('EXPLORE_PREFERENCES', {
        category: categories.map((v) => categoryLabelByValue.get(v) ?? v).join(', '),
        tag: tags.map((v) => tagLabelByValue.get(v) ?? v).join(', '),
        longDes: parsedKeywords.join(', ')
      })
    } catch {
      // still continue to close and refresh; backend can be retried on next interaction
    }

    const payload: ExplorePreferencesPayload = {
      categories: categories.map((v) => categoryLabelByValue.get(v) ?? v),
      tags: tags.map((v) => tagLabelByValue.get(v) ?? v),
      keywords: parsedKeywords
    }
    onSave?.(payload)
    onOpenChange(false)
    setIsSaving(false)
  }, [categories, categoryLabelByValue, isSaving, parsedKeywords, onOpenChange, onSave, tagLabelByValue, tags, userId])

  const hasChanges = useMemo(
    () =>
      !sameSelection(categories, initialCategories) ||
      !sameSelection(tags, initialTags) ||
      !sameSelection(parsedKeywords, initialKeywords),
    [categories, initialCategories, tags, initialTags, parsedKeywords, initialKeywords]
  )

  const isSaveDisabled = !hasChanges || isSaving

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild>
              <motion.div
                className='fixed inset-0 z-50 bg-black/70 backdrop-blur-md'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </DialogPrimitive.Overlay>

            <DialogPrimitive.Content asChild>
              <motion.div
                className='fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6'
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  className='relative flex w-full max-w-5xl flex-col md:flex-row h-auto md:h-[750px] max-h-[90vh] overflow-hidden rounded-[2.5rem] bg-white shadow-[0_40px_100px_rgba(0,0,0,0.3)] border-none'
                >
                  {/* Close button */}
                  <button
                    onClick={() => onOpenChange(false)}
                    className='absolute right-6 top-6 z-50 rounded-full bg-white/10 backdrop-blur-md p-2 text-white/70 transition-all hover:bg-white/20 hover:text-white border border-white/20 sm:bg-slate-100/50 sm:text-slate-500 sm:border-slate-200'
                  >
                    <X className='h-5 w-5' />
                  </button>

                  {/* Left Side: Inspiration Image & Smart Stats */}
                  <div className='w-full md:w-[380px] relative bg-slate-50 shrink-0 overflow-hidden flex flex-col p-8 md:p-12 justify-between min-h-[250px] md:min-h-0 group'>
                    <img
                      src={cover}
                      className='absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110'
                      alt='Learning'
                    />
                    {/* Minimalist soft vignette for legibility */}
                    <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 z-0' />

                    <div className='relative z-10 space-y-6'>
                      <div className='inline-flex items-center gap-2.5 rounded-full bg-black/20 px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white border border-white/20 backdrop-blur-md'>
                        <Sparkles className='h-3 w-3 text-yellow-300' /> Smart Connect
                      </div>

                      <div className='p-1'>
                        <DialogPrimitive.Title className='text-3xl md:text-[32px] font-bold leading-[1.1] tracking-tight text-white drop-shadow-lg'>
                          Kiến tạo <br />
                          <span className='text-white/90'>Sở thích riêng</span>
                        </DialogPrimitive.Title>
                        <p className='text-[13px] text-white/90 font-medium leading-relaxed max-w-[240px] mt-4 drop-shadow-md'>
                          Chia sẻ sở thích để chúng tôi tối ưu lộ trình học tập phù hợp nhất với bạn.
                        </p>
                      </div>

                      <div className='flex items-center gap-5 pt-4'>
                        {summaryStats.map((stat) => (
                          <div key={stat.label} className='flex flex-col'>
                            <span className='text-xl md:text-2xl font-bold text-white leading-none drop-shadow-lg'>{stat.value}</span>
                            <span className='text-[10px] font-semibold uppercase tracking-wider text-white/70 mt-1 drop-shadow-sm'>{stat.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className='relative z-10 hidden md:flex flex-col gap-4'>
                      <div className='p-5 rounded-[1.5rem] bg-white/5 border border-white/10 backdrop-blur-2xl'>
                        <p className='text-[10px] font-bold text-blue-200/60 uppercase tracking-widest mb-3'>Lựa chọn của bạn</p>
                        {allSelections.length > 0 ? (
                          <div className='flex flex-wrap gap-2 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar-mini'>
                            <AnimatePresence mode='popLayout'>
                              {allSelections.map((item) => (
                                <motion.span
                                  key={item.key}
                                  layout
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0.8, opacity: 0 }}
                                  className='inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-[11px] font-semibold text-white border border-white/10'
                                >
                                  {item.label}
                                  <button onClick={() => removeSelection(item)} className='hover:text-red-300 transition-colors'>
                                    <X className='h-3 w-3' />
                                  </button>
                                </motion.span>
                              ))}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <p className='text-[11px] text-white/40 italic font-medium'>Bắt đầu chọn ở khung bên phải nhé!</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Form Pane */}
                  <div className='flex-1 bg-white flex flex-col min-h-0'>
                    <div className='flex-1 overflow-y-auto px-6 py-8 md:px-12 md:py-12 space-y-12 custom-scrollbar'>
                      {/* Section: Categories */}
                      <section className='space-y-6'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <h3 className='text-lg font-bold text-slate-900 tracking-tight'>Danh mục trọng tâm</h3>
                            <p className='text-[12px] text-slate-400 font-semibold mt-1'>Chọn tối đa {MAX_SELECTIONS_PER_SECTION} mảng bạn quan tay nhất</p>
                          </div>
                          <div className='text-[13px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100'>
                            {categories.length}/{MAX_SELECTIONS_PER_SECTION}
                          </div>
                        </div>

                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                          {categoryOptions.map((option, index) => {
                            const selected = categories.includes(option.value)
                            return (
                              <button
                                key={option.value}
                                type='button'
                                onClick={() => toggleCategory(option.value)}
                                className={`group relative flex items-start gap-4 rounded-2xl border p-4 text-left transition-all duration-300 ${selected
                                  ? 'border-blue-500 bg-blue-50/30'
                                  : 'border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50/10'
                                  }`}
                              >
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all ${selected ? 'bg-blue-600 text-white' : 'bg-slate-50'
                                  }`}>
                                  {CATEGORY_ICONS[index % CATEGORY_ICONS.length]}
                                </div>
                                <div className='flex-1 min-w-0'>
                                  <span className={`block text-[13.5px] font-bold ${selected ? 'text-blue-700' : 'text-slate-800'}`}>
                                    {option.label}
                                  </span>
                                  <span className='mt-1 block text-[11px] text-slate-400 font-medium leading-relaxed line-clamp-2'>
                                    {option.description}
                                  </span>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </section>

                      {/* Section: Tags */}
                      <section className='space-y-6'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <h3 className='text-lg font-bold text-slate-900 tracking-tight'>Công nghệ yêu thích</h3>
                            <p className='text-[12px] text-slate-400 font-semibold mt-1'>Lọc khóa học theo ngôn ngữ hoặc framework</p>
                          </div>
                          <div className='text-[13px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100'>
                            {tags.length}/{MAX_SELECTIONS_PER_SECTION}
                          </div>
                        </div>
                        <MultiSelectSearch
                          options={tagOptions}
                          value={tags}
                          onChange={handleTagsChange}
                          isOptionDisabled={isTagOptionDisabled}
                          placeholder='Tìm công nghệ...'
                          className='rounded-xl h-13 border-slate-100 font-semibold text-[13px] bg-slate-50/30'
                        />
                      </section>

                      {/* Section: Keywords */}
                      <section className='space-y-6'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <h3 className='text-lg font-bold text-slate-900 tracking-tight'>Từ khóa bổ sung</h3>
                            <p className='text-[12px] text-slate-400 font-semibold mt-1'>Chủ đề cụ thể bạn muốn khám phá thêm</p>
                          </div>
                          <div className='text-[13px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100'>
                            {parsedKeywords.length}/{MAX_SELECTIONS_PER_SECTION}
                          </div>
                        </div>
                        <div className='relative'>
                          <Input
                            value={keywordText}
                            onChange={(e) => handleKeywordTextChange(e.target.value)}
                            placeholder='Ví dụ: backend, microservices, ai generative...'
                            className='h-13 rounded-xl border-slate-100 bg-slate-50/30 px-5 text-[13px] font-semibold placeholder:text-slate-300'
                          />
                          <p className='mt-2.5 text-[9px] font-bold text-slate-300 uppercase tracking-widest ml-1'>Phân tách bằng dấu phẩy</p>
                        </div>
                      </section>
                    </div>

                    {/* Footer Actions */}
                    <div className='px-8 py-6 md:px-12 md:py-8 border-t border-slate-50 flex flex-wrap items-center justify-between gap-4'>
                      <button
                        onClick={handleClearAll}
                        className='text-[11px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-[0.15em]'
                      >
                        Làm mới tất cả
                      </button>
                      <div className='flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0'>
                        <CustomButton
                          variant='ghost'
                          label='Hủy bỏ'
                          onClick={() => onOpenChange(false)}
                          className='flex-1 sm:flex-none text-[13px] font-semibold text-slate-400'
                        />
                        <CustomButton
                          label='Lưu sở thích'
                          onClick={handleSave}
                          disabled={isSaveDisabled}
                          isLoader={isSaving}
                          className='flex-[2] sm:flex-none h-13 !px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[13.5px] font-bold shadow-xl shadow-blue-500/20'
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  )
}
