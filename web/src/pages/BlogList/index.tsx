import { useState, useMemo } from "react";
import { SearchBar } from "@/components/BlogList/SearchBar";
import { ArticleCard, Article } from "@/components/BlogList/ArticleCard";
import { PaginationControls } from "@/components/BlogList/PaginationControls";

const ITEMS_PER_PAGE = 6;

// Mock data - replace with API call
const MOCK_ARTICLES: Article[] = [
    {
        id: 1,
        title: "Khám phá React 19: Những tính năng mới đáng chú ý",
        image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop",
        author: "Nguyễn Văn A",
        createdAt: "15/03/2024",
    },
    {
        id: 2,
        title: "TypeScript Tips: Nâng cao kỹ năng lập trình của bạn",
        image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=450&fit=crop",
        author: "Trần Thị B",
        createdAt: "14/03/2024",
    },
    {
        id: 3,
        title: "Tailwind CSS: Hướng dẫn thiết kế giao diện hiện đại",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=450&fit=crop",
        author: "Lê Văn C",
        createdAt: "13/03/2024",
    },
    {
        id: 4,
        title: "Web Performance: Tối ưu hóa tốc độ tải trang",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop",
        author: "Phạm Thị D",
        createdAt: "12/03/2024",
    },
    {
        id: 5,
        title: "API Design: Best practices cho RESTful APIs",
        image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=450&fit=crop",
        author: "Hoàng Văn E",
        createdAt: "11/03/2024",
    },
    {
        id: 6,
        title: "Database Optimization: Cải thiện hiệu suất truy vấn",
        image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&h=450&fit=crop",
        author: "Đặng Thị F",
        createdAt: "10/03/2024",
    },
    {
        id: 7,
        title: "Git Workflows: Quản lý source code hiệu quả",
        image: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=450&fit=crop",
        author: "Vũ Văn G",
        createdAt: "09/03/2024",
    },
    {
        id: 8,
        title: "DevOps: CI/CD Pipeline cho dự án web",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop",
        author: "Bùi Thị H",
        createdAt: "08/03/2024",
    },
    {
        id: 9,
        title: "Security Best Practices trong phát triển web",
        image: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=800&h=450&fit=crop",
        author: "Mai Văn I",
        createdAt: "07/03/2024",
    },
    {
        id: 10,
        title: "Mobile-First Design: Thiết kế responsive hiệu quả",
        image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=450&fit=crop",
        author: "Lý Thị K",
        createdAt: "06/03/2024",
    },
];

const Index = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const filteredArticles = useMemo(() => {
        return MOCK_ARTICLES.filter(
            (article) =>
                article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                article.author.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedArticles = filteredArticles.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="min-h-screen bg-background px-36">
            {/* Header */}
            <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
                <div className="container mx-auto px-4 py-6">
                    <h1 className="text-3xl font-semibold text-foreground mb-6 text-center">
                        Danh mục bài viết
                    </h1>
                    <SearchBar value={searchQuery} onChange={setSearchQuery} />
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12">
                {paginatedArticles.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {paginatedArticles.map((article) => (
                                <ArticleCard key={article.id} article={article} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <PaginationControls
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-xl text-muted-foreground">
                            Không tìm thấy bài viết nào phù hợp với tìm kiếm của bạn.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Index;
