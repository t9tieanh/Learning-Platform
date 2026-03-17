import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Check, Save } from 'lucide-react'
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

export type ExplorePreferencesPayload = {
  categories: string[]
  tags: string[]
  keywords: string[]
}

const MAX_SELECTIONS_PER_SECTION = 3
const MAX_VISIBLE_CATEGORIES = 6
const CATEGORY_ICONS = ['💻', '📊', '🤖', '🌐', '⚙️', '☁️']
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
                className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </DialogPrimitive.Overlay>

            <DialogPrimitive.Content asChild>
              <motion.div
                className='fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className='relative flex w-full max-w-5xl flex-col max-h-[calc(100vh-2rem)] overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-[0_40px_120px_rgba(15,23,42,0.25)]'
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                >
                  {/* Close button */}
                  <button
                    onClick={() => onOpenChange(false)}
                    className='absolute right-4 top-4 z-20 rounded-full border border-white/30 bg-white/70 p-2 text-slate-500 shadow-sm transition-all hover:bg-white hover:text-red-500'
                  >
                    <X className='h-5 w-5' />
                  </button>

                  <div className='flex-1 overflow-y-auto'>
                    <div className='flex flex-col lg:flex-row text-slate-900 min-h-0 gap-0'>
                      {/* Hero pane */}
                      <div className='w-full lg:w-[360px] bg-gradient-to-br from-blue-600 via-blue-600 to-slate-900 text-white p-6 sm:p-10 flex flex-col gap-6 relative lg:overflow-y-auto min-h-0'>
                      <div className='absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_transparent_55%)]' />
                      <div className='relative space-y-5'>
                        <span className='inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/90'>
                          <Sparkles className='h-4 w-4 text-yellow-300' /> Cá nhân hóa thông minh
                        </span>
                        <DialogPrimitive.Title className='text-3xl font-bold leading-tight text-white'>
                          Khóa học chuẩn gu của bạn
                        </DialogPrimitive.Title>
                        <p className='text-sm text-white/80'>
                          Chia sẻ ưu tiên học tập để chúng tôi đề xuất lộ trình, blog và sự kiện phù hợp nhất với mục
                          tiêu nghề nghiệp của bạn.
                        </p>

                        <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                          {summaryStats.map((stat) => (
                            <div
                              key={stat.label}
                              className='rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-center'
                            >
                              <p className='text-2xl font-bold text-white'>{stat.value}</p>
                              <p className='text-[11px] uppercase tracking-wide text-white/70'>{stat.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className='relative space-y-5'>
                        {BENEFIT_HIGHLIGHTS.map((benefit) => (
                          <div
                            key={benefit.title}
                            className='flex gap-3 rounded-2xl border border-white/15 bg-white/5 p-3'
                          >
                            <div className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/15'>
                              <Check className='h-4 w-4 text-emerald-300' strokeWidth={3} />
                            </div>
                            <div>
                              <p className='text-sm font-semibold text-white'>{benefit.title}</p>
                              <p className='text-xs text-white/80 leading-relaxed'>{benefit.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className='relative rounded-2xl border border-white/20 bg-white/10 p-4 space-y-3 lg:max-h-48 lg:overflow-y-auto'>
                        <p className='text-xs font-semibold uppercase tracking-wide text-white/70'>
                          Lộ trình sẽ cá nhân hóa cho:
                        </p>
                        {allSelections.length > 0 ? (
                          <div className='flex flex-wrap gap-2'>
                            <AnimatePresence mode='popLayout'>
                              {allSelections.map((item) => (
                                <motion.span
                                  key={item.key}
                                  layout
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                                  className='inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs font-medium text-white shadow-sm backdrop-blur'
                                >
                                  {item.label}
                                  <button
                                    type='button'
                                    onClick={() => removeSelection(item)}
                                    className='rounded-full p-0.5 text-white/80 transition hover:bg-white/30'
                                  >
                                    <X className='h-3 w-3' />
                                  </button>
                                </motion.span>
                              ))}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <p className='text-sm text-white/70'>Chưa có lựa chọn nào. Bắt đầu ở khung bên phải nhé!</p>
                        )}
                      </div>
                    </div>

                      {/* Form pane */}
                      <div className='flex-1 bg-white/90 text-slate-900 flex flex-col min-h-0'>
                        <div className='flex-1 overflow-visible lg:overflow-y-auto px-4 py-5 sm:px-8 sm:py-8 space-y-6 sm:space-y-8'>
                        {/* Categories */}
                        <section className='rounded-2xl border border-slate-100 bg-white/80 p-4 sm:p-5 shadow-sm shadow-slate-100'>
                          <div className='mb-5 flex items-start justify-between gap-4'>
                            <div>
                              <h3 className='text-lg font-semibold text-slate-900'>Danh mục quan tâm</h3>
                              <p className='text-sm text-slate-500'>
                                Chọn tối đa {MAX_SELECTIONS_PER_SECTION} danh mục để ưu tiên.
                              </p>
                            </div>
                            <span className='text-xs font-semibold text-slate-400'>
                              {categories.length}/{MAX_SELECTIONS_PER_SECTION}
                            </span>
                          </div>

                          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                            {categoryOptions.map((option, index) => {
                              const selected = categories.includes(option.value)
                              return (
                                <motion.button
                                  key={option.value}
                                  type='button'
                                  onClick={() => toggleCategory(option.value)}
                                  whileTap={{ scale: 0.98 }}
                                  disabled={isLoadingCategories}
                                  className={`relative flex items-start gap-4 rounded-2xl border p-4 text-left transition-all duration-200 ${
                                    selected
                                      ? 'border-emerald-400/70 bg-gradient-to-r from-emerald-50 to-emerald-100 shadow-[0_10px_25px_rgba(16,185,129,0.15)]'
                                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                  }`}
                                >
                                  <span className='text-2xl mt-0.5'>
                                    {CATEGORY_ICONS[index % CATEGORY_ICONS.length]}
                                  </span>

                                  <div className='flex-1 min-w-0'>
                                    <span className='block text-sm font-semibold text-slate-900'>{option.label}</span>
                                    <span className='mt-1 block text-[13px] text-slate-500 leading-relaxed'>
                                      {option.description}
                                    </span>
                                  </div>
                                </motion.button>
                              )
                            })}
                          </div>

                          {isLoadingCategories && <p className='mt-3 text-sm text-slate-500'>Đang tải danh mục...</p>}

                          {categoryError && <p className='mt-3 text-sm text-red-500'>{categoryError}</p>}
                        </section>

                        {/* Tags */}
                        <section className='rounded-2xl border border-slate-100 bg-white/80 p-4 sm:p-5 shadow-sm shadow-slate-100'>
                          <div className='mb-5 flex items-start justify-between gap-4'>
                            <div>
                              <h3 className='text-lg font-semibold text-slate-900'>Công nghệ muốn học</h3>
                              <p className='text-sm text-slate-500'>
                                Tinh chỉnh đề xuất theo ngôn ngữ, framework hoặc kỹ năng.
                              </p>
                            </div>
                            <span className='text-xs font-semibold text-slate-400'>
                              {tags.length}/{MAX_SELECTIONS_PER_SECTION}
                            </span>
                          </div>

                          <MultiSelectSearch
                            options={tagOptions}
                            value={tags}
                            onChange={handleTagsChange}
                            isOptionDisabled={isTagOptionDisabled}
                            placeholder={isLoadingTags ? 'Đang tải công nghệ...' : 'Chọn công nghệ...'}
                            searchPlaceholder='Tìm công nghệ...'
                            emptyText={isLoadingTags ? 'Đang tải dữ liệu...' : 'Không tìm thấy công nghệ.'}
                            disabled={isLoadingTags}
                          />
                          {tagError && <p className='mt-3 text-sm text-red-500'>{tagError}</p>}
                        </section>

                        {/* Keywords */}
                        <section className='rounded-2xl border border-slate-100 bg-white/80 p-4 sm:p-5 shadow-sm shadow-slate-100'>
                          <div className='mb-5 flex items-start justify-between gap-4'>
                            <div>
                              <h3 className='text-lg font-semibold text-slate-900'>Từ khóa tập trung</h3>
                              <p className='text-sm text-slate-500'>Nhập các chủ đề cụ thể bạn muốn đào sâu.</p>
                            </div>
                            <span className='text-xs font-semibold text-slate-400'>
                              {parsedKeywords.length}/{MAX_SELECTIONS_PER_SECTION}
                            </span>
                          </div>

                          <Input
                            value={keywordText}
                            onChange={(e) => handleKeywordTextChange(e.target.value)}
                            placeholder='Ví dụ: backend, machine learning, microservices...'
                            className='h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-200'
                          />
                          <p className='mt-2 text-xs text-slate-500'>Phân tách nhiều từ khóa bằng dấu phẩy.</p>
                          {keywordError && <p className='mt-2 text-sm text-red-500'>{keywordError}</p>}
                        </section>
                      </div>

                        <div className='border-t border-slate-100 bg-white/95 px-4 py-4 sm:px-8 sm:py-5 flex flex-wrap items-center justify-between gap-3 sticky bottom-0'>
                          <button
                            type='button'
                            onClick={handleClearAll}
                            className='text-sm font-semibold text-slate-500 underline-offset-2 hover:text-slate-900 hover:underline'
                          >
                            Gỡ hết lựa chọn
                          </button>
                          <div className='flex flex-wrap gap-3'>
                            <CustomButton
                              className='rounded-xl border border-slate-200 bg-white px-5 text-slate-600 hover:bg-slate-50'
                              label='Hủy'
                              onClick={() => onOpenChange(false)}
                            />
                            <CustomButton
                              className='rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-blue-500 px-6 font-semibold text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40'
                              label='Lưu sở thích'
                              onClick={handleSave}
                              disabled={isSaveDisabled}
                              isLoader={isSaving}
                              icon={isSaving ? undefined : <Save />}
                            />
                          </div>
                        </div>
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
