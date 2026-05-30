import { FC } from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext
} from '@/components/ui/pagination'

interface CoursePaginationProps {
  pages?: number
  current?: number
  onChange?: (page: number) => void
}

const CoursePagination: FC<CoursePaginationProps> = ({ pages = 4, current = 1, onChange }) => {
  const canPrev = current > 1
  const canNext = current < pages
  return (
    <Pagination className='flex justify-center'>
      <PaginationContent className='gap-1.5 sm:gap-2'>
        <PaginationItem>
          <PaginationPrevious
            href='#'
            className='rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
            aria-disabled={!canPrev}
            onClick={(e) => {
              e.preventDefault()
              if (canPrev) onChange?.(current - 1)
            }}
          />
        </PaginationItem>

        {Array.from({ length: pages }, (_, i) => i + 1).map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href='#'
              isActive={page === current}
              className={`h-9 w-9 rounded-xl border text-sm font-semibold transition-all duration-200 sm:h-10 sm:w-10 ${
                page === current
                  ? 'border-blue-500 bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.28)] hover:bg-blue-600'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
              }`}
              onClick={(e) => {
                e.preventDefault()
                onChange?.(page)
              }}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            href='#'
            className='rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
            aria-disabled={!canNext}
            onClick={(e) => {
              e.preventDefault()
              if (canNext) onChange?.(current + 1)
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export default CoursePagination
