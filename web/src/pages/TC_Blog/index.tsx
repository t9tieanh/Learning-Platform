import React, { useState, useEffect } from 'react'
import AcademySidebar from '@/components/TC_HomePage/AcademySidebar'
import BlogSearchBar from '@/components/TC_Blog/BlogSearchBar'
import { Loader } from '@/components/ui/loader'
import BlogTable from '@/components/TC_Blog/BlogTable'
import BlogPagination from '@/components/TC_Blog/BlogPagination'

interface Blog {
    _id: string
    instructor_id: string
    title: string
    image_url: string
    content: string
    markdown_file_url?: string[]
    created_at: string
}

const mockBlogs: Blog[] = [
    {
        _id: '1',
        instructor_id: '1001',
        title: 'Hướng dẫn học React cơ bản trong 7 ngày',
        image_url: 'https://placehold.co/600x400?text=React',
        content: 'React là thư viện mạnh mẽ để xây dựng giao diện người dùng...',
        markdown_file_url: ['https://example.com/readme/react-guide.md'],
        created_at: '2025-10-01T09:00:00Z'
    },
    {
        _id: '2',
        instructor_id: '1002',
        title: 'Tối ưu hiệu năng website với Next.js',
        image_url: 'https://placehold.co/600x400?text=Next.js',
        content: 'Next.js hỗ trợ rendering tối ưu và SEO thân thiện...',
        markdown_file_url: ['https://example.com/readme/nextjs-optimization.md'],
        created_at: '2025-10-05T14:30:00Z'
    },
    {
        _id: '3',
        instructor_id: '1003',
        title: 'Triển khai CI/CD với Docker và GitHub Actions',
        image_url: 'https://placehold.co/600x400?text=DevOps',
        content: 'Bài viết này hướng dẫn cách tự động hóa quá trình deploy...',
        markdown_file_url: ['https://example.com/readme/devops-cicd.md'],
        created_at: '2025-10-10T08:45:00Z'
    }
]

const TC_Blog: React.FC = () => {
    const [blogs, setBlogs] = useState<Blog[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const size = 5

    useEffect(() => {
        setLoading(true)
        setTimeout(() => {
            setBlogs(mockBlogs)
            setLoading(false)
        }, 500)
    }, [])

    const filtered = blogs.filter((b) =>
        b.title.toLowerCase().includes(search.toLowerCase())
    )

    const paginated = filtered.slice((page - 1) * size, page * size)

    return (
        <div className='flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-950 transition-colors'>
            {/* Sidebar */}
            <div className='fixed top-0 left-0 h-screen w-64 bg-[#1D1D2A] z-30'>
                <AcademySidebar />
            </div>

            {/* Main content */}
            <div className='flex-1 p-6 space-y-6'>
                <BlogSearchBar onSearch={(v) => setSearch(v)} />

                {loading ? (
                    <Loader />
                ) : (
                    <BlogTable
                        courses={paginated.map((b) => ({
                            id: b._id,
                            title: b.title,
                            image: b.image_url,
                            shortDescription: b.content.slice(0, 80) + '...',
                            createdAt: b.created_at
                        }))}
                    />
                )}

                <BlogPagination
                    pages={Math.ceil(filtered.length / size)}
                    current={page}
                    onChange={setPage}
                />
            </div>
        </div>
    )
}

export default TC_Blog
