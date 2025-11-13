import { useState } from "react";
import BlogSearchBar from "@/components/TC_Blog/BlogSearchBar";
import BlogTable from "@/components/TC_Blog/BlogTable";
import BlogPagination from "@/components/TC_Blog/BlogPagination";

export const mockBlogs: Blog[] = [
    {
        _id: "1",
        instructor_id: "101",
        title: "10 mẹo học lập trình hiệu quả",
        image_url: "https://picsum.photos/400/200?random=1",
        content: "Trong bài viết này, chúng ta sẽ khám phá 10 mẹo giúp việc học lập trình trở nên hiệu quả hơn...",
        markdown_file_url: ["https://example.com/blog1.md"],
        created_at: "2024-03-20",
    },
    {
        _id: "2",
        instructor_id: "102",
        title: "Xu hướng công nghệ 2024",
        image_url: "https://picsum.photos/400/200?random=2",
        content: "Công nghệ luôn thay đổi nhanh chóng. Trong năm 2024, những xu hướng đáng chú ý gồm AI, blockchain...",
        markdown_file_url: ["https://example.com/blog2.md"],
        created_at: "2024-03-18",
    },
    {
        _id: "3",
        instructor_id: "103",
        title: "Thiết kế responsive với Tailwind CSS",
        image_url: "https://picsum.photos/400/200?random=3",
        content: "Tailwind CSS giúp xây dựng giao diện responsive nhanh chóng và linh hoạt. Hãy cùng tìm hiểu cách áp dụng...",
        created_at: "2024-03-15",
    },
    {
        _id: "4",
        instructor_id: "104",
        title: "Học React cơ bản trong 7 ngày",
        image_url: "https://picsum.photos/400/200?random=4",
        content: "React là một thư viện mạnh mẽ cho việc xây dựng giao diện người dùng. Hướng dẫn 7 ngày này sẽ giúp bạn...",
        created_at: "2024-03-10",
    },
    {
        _id: "5",
        instructor_id: "101",
        title: "Node.js Backend từ cơ bản đến nâng cao",
        image_url: "https://picsum.photos/400/200?random=5",
        content: "Node.js là công cụ tuyệt vời để xây dựng backend. Bài viết này hướng dẫn từ cơ bản đến nâng cao...",
        created_at: "2024-03-05",
    },
];


interface Blog {
    _id: string;
    instructor_id: string;
    title: string;
    image_url: string;
    content: string;
    markdown_file_url?: string[];
    created_at: string;
}

const AD_Blogs = () => {
    const [blogs, setBlogs] = useState<Blog[]>(mockBlogs);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // filter blogs theo search (ví dụ đơn giản)
    const filteredBlogs = blogs.filter((b) =>
        b.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex-1 space-y-8 p-6">
            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : error ? (
                <div className="text-center text-red-500 py-10">{error}</div>
            ) : (
                <BlogTable
                    courses={filteredBlogs.map((b) => ({
                        id: b._id,
                        title: b.title,
                        image: b.image_url,
                        shortDescription: b.content.slice(0, 80) + "...",
                        createdAt: b.created_at,
                    }))}
                    onDeleted={(id) =>
                        setBlogs((prev) => prev.filter((b) => b._id !== id))
                    }
                />
            )}

            <BlogPagination
                pages={totalPages}
                current={page}
                onChange={setPage}
            />
        </div>
    );
};

export default AD_Blogs;