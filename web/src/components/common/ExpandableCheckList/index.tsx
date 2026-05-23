import { useState } from 'react'
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const DEFAULT_VISIBLE_LIMIT = 5

interface ExpandableCheckListProps {
  items: string[]
  limit?: number
  className?: string
  listClassName?: string
}

const ExpandableCheckList = ({
  items,
  limit = DEFAULT_VISIBLE_LIMIT,
  className,
  listClassName
}: ExpandableCheckListProps) => {
  const [expanded, setExpanded] = useState(false)
  const safeItems = items ?? []
  const hasMore = safeItems.length > limit
  const visibleItems = expanded || !hasMore ? safeItems : safeItems.slice(0, limit)

  if (safeItems.length === 0) {
    return null
  }

  return (
    <div className={cn('max-w-3xl ml-0 md:ml-20', className)}>
      <ul className={cn('space-y-2', listClassName)}>
        {visibleItems.map((title, index) => (
          <li key={`${index}-${title}`} className='flex items-center space-x-4 group'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white'>
              <CheckCircle2 size={22} strokeWidth={2.2} />
            </div>
            <span className='text-base font-medium text-foreground transition-colors duration-300 group-hover:text-primary'>
              {title}
            </span>
          </li>
        ))}
      </ul>
      {hasMore && (
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='mt-2 h-8 px-2 text-primary hover:bg-primary/10 hover:text-primary'
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? (
            <>
              Thu gọn
              <ChevronUp className='ml-1 h-4 w-4' />
            </>
          ) : (
            <>
              Xem thêm ({safeItems.length - limit})
              <ChevronDown className='ml-1 h-4 w-4' />
            </>
          )}
        </Button>
      )}
    </div>
  )
}

export default ExpandableCheckList
