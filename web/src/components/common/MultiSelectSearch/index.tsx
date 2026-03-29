import * as React from 'react'
import { CheckIcon, ChevronsUpDownIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export type MultiSelectOption = { value: string; label: string }

const INITIAL_VISIBLE_OPTION_LIMIT = 80
const SEARCH_VISIBLE_OPTION_LIMIT = 120

type Props = {
  options: MultiSelectOption[]
  value: string[]
  onChange: (nextValue: string[]) => void
  isOptionDisabled?: (option: MultiSelectOption) => boolean
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
}

export default function MultiSelectSearch({
  options,
  value,
  onChange,
  isOptionDisabled,
  placeholder = 'Chọn...',
  searchPlaceholder = 'Tìm kiếm...',
  emptyText = 'Không tìm thấy kết quả.',
  className,
  disabled
}: Props) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const selectedLabels = React.useMemo(() => {
    const selected = new Set(value)
    return options.filter((o) => selected.has(o.value)).map((o) => o.label)
  }, [options, value])

  const filteredOptions = React.useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    if (!normalizedSearch) {
      return options
    }

    return options.filter((option) => option.label.toLowerCase().includes(normalizedSearch))
  }, [options, search])

  const visibleOptions = React.useMemo(() => {
    if (search.trim()) {
      return filteredOptions.slice(0, SEARCH_VISIBLE_OPTION_LIMIT)
    }

    const selectedOptions = options.filter((option) => value.includes(option.value))
    const remainingOptions = options.filter((option) => !value.includes(option.value))

    return [...selectedOptions, ...remainingOptions].slice(0, INITIAL_VISIBLE_OPTION_LIMIT)
  }, [filteredOptions, options, search, value])

  const resolvedEmptyText = React.useMemo(() => {
    if (filteredOptions.length > 0) {
      return emptyText
    }

    return search.trim() ? emptyText : 'Gõ để tìm nhanh công nghệ trong danh sách lớn.'
  }, [emptyText, filteredOptions.length, search])

  React.useEffect(() => {
    if (!open && search) {
      setSearch('')
    }
  }, [open, search])

  const toggle = React.useCallback(
    (optionValue: string) => {
      const isSelected = value.includes(optionValue)
      const next = isSelected ? value.filter((v) => v !== optionValue) : [...value, optionValue]
      onChange(next)
    },
    [onChange, value]
  )

  const remove = React.useCallback(
    (label: string) => {
      const option = options.find((o) => o.label === label)
      if (option) {
        onChange(value.filter((v) => v !== option.value))
      }
    },
    [onChange, options, value]
  )

  return (
    <div className={cn('space-y-3', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            disabled={disabled}
            className='flex w-full items-center justify-between rounded-xl border border-modal-border bg-modal-surface px-4 py-3 text-sm font-body text-modal-text-high transition-colors hover:bg-modal-surface-hover focus:outline-none focus:ring-2 focus:ring-modal-accent/40'
          >
            <span className={cn(!selectedLabels.length && 'text-modal-text-low')}>
              {selectedLabels.length ? `${selectedLabels.length} đã chọn` : placeholder}
            </span>
            <ChevronsUpDownIcon className='h-4 w-4 text-modal-text-low' />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className='w-[var(--radix-popover-trigger-width)] rounded-xl border border-modal-border bg-white p-0 shadow-lg shadow-slate-950/10'
          align='start'
          onWheel={(e) => e.stopPropagation()}
        >
          <Command shouldFilter={false} className='rounded-xl bg-white'>
            <CommandInput
              value={search}
              onValueChange={setSearch}
              placeholder={searchPlaceholder}
              className='bg-white text-modal-text-high placeholder:text-modal-text-low border-none outline-none focus:outline-none focus:ring-0'
            />
            <CommandList className='h-[176px] overflow-y-scroll overscroll-contain bg-white'>
              <CommandEmpty className='text-modal-text-low py-4 text-center text-sm'>{resolvedEmptyText}</CommandEmpty>
              <CommandGroup className='bg-white'>
                {visibleOptions.map((option) => {
                  const checked = value.includes(option.value)
                  const optionDisabled = isOptionDisabled?.(option) ?? false
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      disabled={optionDisabled}
                      onSelect={() => toggle(option.value)}
                      className='flex items-center gap-2 rounded-lg bg-white text-modal-text-high aria-selected:bg-slate-50 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50'
                    >
                      <div
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded border transition-colors',
                          checked ? 'border-modal-accent bg-modal-accent' : 'border-modal-border'
                        )}
                      >
                        {checked && <CheckIcon className='h-3 w-3 text-modal-accent-foreground' />}
                      </div>
                      {option.label}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedLabels.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {selectedLabels.map((label) => (
            <span
              key={label}
              className='inline-flex items-center gap-1.5 rounded-full bg-modal-accent/15 px-3 py-1 text-xs font-medium text-modal-accent border-2 border-white'
            >
              {label}
              <button
                type='button'
                onClick={() => remove(label)}
                className='rounded-full p-0.5 transition-colors hover:bg-modal-accent/20'
              >
                <X className='h-3 w-3' />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
