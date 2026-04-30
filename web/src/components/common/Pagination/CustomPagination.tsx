import { MouseEvent } from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from '@/components/ui/pagination'

interface CustomPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  loading?: boolean
}

const CustomPagination = ({ currentPage, totalPages, onPageChange, loading = false }: CustomPaginationProps) => {
  const renderPaginationItems = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, 'ellipsis', totalPages)
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, 'ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    } else {
      pages.push(1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages)
    }
    return pages
  }

  return (
    <Pagination className='py-2'>
      <PaginationContent className='gap-1.5 rounded-full border border-blue-100 bg-white/90 p-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur'>
        <PaginationItem>
          <PaginationPrevious
            href='#'
            onClick={(e: MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault()
              if (!loading) onPageChange(Math.max(1, currentPage - 1))
            }}
            aria-disabled={currentPage === 1 || loading}
            className={`h-9 rounded-full px-3 text-sm font-semibold transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 focus-visible:ring-4 focus-visible:ring-blue-100 ${
              currentPage === 1 || loading ? 'pointer-events-none opacity-45' : 'text-slate-600'
            }`}
          />
        </PaginationItem>

        {renderPaginationItems().map((page, idx) =>
          page === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis className='size-9 text-slate-400' />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                href='#'
                isActive={currentPage === page}
                onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault()
                  if (!loading) onPageChange(page as number)
                }}
                className={`size-9 rounded-full text-sm font-semibold transition-all duration-200 focus-visible:ring-4 focus-visible:ring-blue-100 ${
                  currentPage === page
                    ? 'border-blue-600 bg-blue-600 text-white shadow-[0_8px_18px_rgba(37,99,235,0.28)] hover:bg-blue-700 hover:text-white'
                    : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                } ${loading ? 'pointer-events-none opacity-60' : ''}`}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            href='#'
            onClick={(e: MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault()
              if (!loading) onPageChange(Math.min(totalPages, currentPage + 1))
            }}
            aria-disabled={currentPage === totalPages || loading}
            className={`h-9 rounded-full px-3 text-sm font-semibold transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 focus-visible:ring-4 focus-visible:ring-blue-100 ${
              currentPage === totalPages || loading ? 'pointer-events-none opacity-45' : 'text-slate-600'
            }`}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export default CustomPagination
