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
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href='#'
            onClick={(e: MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault()
              if (!loading) onPageChange(Math.max(1, currentPage - 1))
            }}
            aria-disabled={currentPage === 1 || loading}
            className={currentPage === 1 || loading ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>

        {renderPaginationItems().map((page, idx) =>
          page === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis />
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
            className={currentPage === totalPages || loading ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export default CustomPagination
