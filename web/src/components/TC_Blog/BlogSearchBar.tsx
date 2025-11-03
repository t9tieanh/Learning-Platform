import { FC } from 'react'
import { Search } from 'lucide-react'
import CustomButton from '@/components/common/Button'
import { IoAddCircle } from 'react-icons/io5'

interface BlogSearchBarProps {
    onSearch?: (value: string) => void
}

const BlogSearchBar: FC<BlogSearchBarProps> = ({ onSearch }) => {
    return (
        <div className='flex justify-between items-center flex-col sm:flex-row gap-4'>
            <div className='relative w-full sm:w-1/3'>
                <Search className='absolute left-3 top-3 w-5 h-5 text-blue-400 peer-focus:text-blue-600 transition-colors' />
                <input
                    type='text'
                    placeholder='Tìm kiếm bài viết...'
                    className='peer w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm transition'
                    onChange={(e) => onSearch?.(e.target.value)}
                />
            </div>

            <CustomButton
                className='bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition'
                label='Tạo bài viết mới'
                icon={<IoAddCircle className='h-6 w-6 mr-2' />}

            />
        </div>
    )
}

export default BlogSearchBar
