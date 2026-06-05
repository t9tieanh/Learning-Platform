import { FC, MouseEvent } from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis
} from '@/components/ui/pagination'

interface BlogPaginationProps {
  pages?: number
  current?: number
  onChange?: (page: number) => void
}

const BlogPagination: FC<BlogPaginationProps> = ({ pages = 1, current = 1, onChange }) => {
  const canPrev = current > 1
  const canNext = current < pages
  const visiblePages: Array<number | 'ellipsis'> = []

  if (pages <= 7) {
    for (let page = 1; page <= pages; page += 1) {
      visiblePages.push(page)
    }
  } else if (current <= 4) {
    visiblePages.push(1, 2, 3, 4, 5, 'ellipsis', pages)
  } else if (current >= pages - 3) {
    visiblePages.push(1, 'ellipsis', pages - 4, pages - 3, pages - 2, pages - 1, pages)
  } else {
    visiblePages.push(1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', pages)
  }

  return (
    <Pagination className='pt-2'>
      <PaginationContent className='flex-wrap gap-1.5 rounded-full border border-blue-100 bg-white/90 p-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur'>
        <PaginationItem>
          <PaginationPrevious
            href='#'
            className={`h-9 rounded-full px-3 text-sm font-semibold transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 focus-visible:ring-4 focus-visible:ring-blue-100 ${
              canPrev ? 'text-slate-600' : 'pointer-events-none opacity-45'
            }`}
            aria-disabled={!canPrev}
            onClick={(e: MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault()
              if (canPrev) onChange?.(current - 1)
            }}
          />
        </PaginationItem>

        {visiblePages.map((page, index) =>
          page === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis className='size-9 text-slate-400' />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                href='#'
                isActive={page === current}
                className={`size-9 rounded-full text-sm font-semibold transition-all duration-200 focus-visible:ring-4 focus-visible:ring-blue-100 ${
                  page === current
                    ? 'border-blue-600 bg-blue-600 text-white shadow-[0_8px_18px_rgba(37,99,235,0.28)] hover:bg-blue-700 hover:text-white'
                    : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
                onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault()
                  onChange?.(page)
                }}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            href='#'
            className={`h-9 rounded-full px-3 text-sm font-semibold transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 focus-visible:ring-4 focus-visible:ring-blue-100 ${
              canNext ? 'text-slate-600' : 'pointer-events-none opacity-45'
            }`}
            aria-disabled={!canNext}
            onClick={(e: MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault()
              if (canNext) onChange?.(current + 1)
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export default BlogPagination
