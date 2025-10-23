import * as React from 'react'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'

interface ComboboxProps {
  items: { value: string; label: string }[]
  label: string
  className?: string
  displayLabel?: string
  required?: boolean
  value: string
  setValue: (value: string) => void
}

export default function CustomCombobox({
  items,
  label,
  className,
  displayLabel,
  required = false,
  value,
  setValue
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className='flex flex-col space-y-1'>
      {displayLabel && (
        <Label className='text-sm font-medium text-black'>
          {displayLabel}
          {required && <span className='text-red-500 ml-1'>*</span>}
        </Label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            className={`w-[200px] justify-between ${className}`}
          >
            {value ? items.find((item) => item.value === value)?.label : `Chọn ${label}...`}
            <ChevronsUpDownIcon className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[200px] p-0 flex flex-col' align='start'>
          <Command>
            <CommandInput placeholder={`Tìm kiếm ${label}...`} className='border-none' />
            <CommandList>
              <CommandEmpty>Vui lòng chọn {label}.</CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? '' : currentValue)
                      setOpen(false)
                    }}
                  >
                    <CheckIcon className={cn('mr-2 h-4 w-4', value === item.value ? 'opacity-100' : 'opacity-0')} />
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
