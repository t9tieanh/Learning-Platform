import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export const SearchBar = ({ value, onChange, placeholder = 'Tìm kiếm bài viết...' }: SearchBarProps) => {
  return (
    <div className='relative w-full max-w-2xl mx-auto'>
      {/* Icon */}
      <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5' />

      {/* Modern rounded input similar to course list */}
      <Input
        type='text'
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='pl-12 h-14 text-base bg-white border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-full shadow-md transition-all placeholder:text-muted-foreground'
      />

      {/* subtle outline */}
      <div className='absolute inset-0 rounded-full ring-1 ring-transparent pointer-events-none' />
    </div>
  )
}
