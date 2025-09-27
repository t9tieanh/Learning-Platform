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
  return (
    <Pagination className='pt-6 flex justify-center'>
      <PaginationContent className='gap-1 sm:gap-2'>
        <PaginationItem>
          <PaginationPrevious
            href='#'
            className='sm:px-3 py-1 text-xs sm:text-sm text-blue-600 transition hover:bg-transparent hover:text-blue-600 hover:scale-105 hover:underline'
          />
        </PaginationItem>
        {Array.from({ length: pages }, (_, i) => i + 1).map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href='#'
              isActive={page === current}
              className={`rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-medium shadow-sm text-xs sm:text-sm transition-transform duration-300 ease-in-out hover:scale-110 ${
                page === current
                  ? 'bg-blue-400 text-white hover:bg-blue-600'
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white'
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
            className='sm:px-3 py-1 text-xs sm:text-sm text-blue-600 transition hover:bg-transparent hover:text-blue-600 hover:scale-105 hover:underline'
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export default CoursePagination
