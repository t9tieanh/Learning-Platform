import { HeroSection } from "@/components/Blog/HeroSection";
import { ArticleCard } from "@/components/Blog/ArticleCard";
import { FeaturedCard } from "@/components/Blog/FeaturedCard";
import { ImageCard } from "@/components/Blog/ImageCard";

const Index = () => {
  const featuredArticles = [
    {
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRf8GeTISd7jte64-n4rC99Ceicb3tk0dTnTg&s',
      category: "Loa tin tức",
      title: "Vieclam24h cho ra mắt: Tôm lược Thị trường Lao động Việt Nam đầu năm 2025",
      slug: "vieclam24h-bao-cao-thi-truong-2025"
    },
    {
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRf8GeTISd7jte64-n4rC99Ceicb3tk0dTnTg&s',
      category: "Loa tin tức",
      title: "Tính năng Fast update: Giải pháp cập nhật trang thái ứng tuyển nhanh nhất",
      slug: "tinh-nang-fast-update"
    },
    {
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRf8GeTISd7jte64-n4rC99Ceicb3tk0dTnTg&s',

      category: "Dân trọn công sở",
      title: "Gen Z thấy việc: Xu hướng mới và những lý do thúc đẩy thế hệ trẻ mới tìm kiếm cơ hội",
      slug: "gen-z-thay-viec"
    },
  ];

  const latestArticles = [
    {
      title: "Môi trường làm việc hiện đại - Xu hướng mới của doanh nghiệp",
      slug: "moi-truong-lam-viec-hien-dai"
    },
    {
      title: "Công nghệ trong công việc: Tối ưu hóa năng suất làm việc",
      slug: "cong-nghe-trong-cong-viec"
    },
    {
      title: "Kỹ năng làm việc nhóm: Chìa khóa thành công trong sự nghiệp",
      slug: "ky-nang-lam-viec-nhom"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <main className="container py-4 space-y-12 px-16">
        <HeroSection />

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Cột 1 - Bài viết nổi bật */}
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-6">Bài viết nổi bật</h2>
              <div className="space-y-6">
                {featuredArticles.map((article, index) => (
                  <ArticleCard key={index} {...article} />
                ))}
              </div>
            </section>
          </div>

          {/* Cột 2 - Bài viết đặc biệt / FeaturedCard */}
          <aside className="space-y-6">
            <FeaturedCard
              title="Vieclam24h cho ra mắt: Báo cáo Thị trường Lao động Q2.2025"
              description="Bức tranh toàn diện về tâm lý, hành vi và kỳ vọng của người lao động sau làn sóng cắt giảm. Báo cáo phân tích thách thức tuyển dụng từ phía doanh nghiệp và đưa ra các góc nhìn thực tiễn."
              date="15/09/2025"
              readTime="8 phút đọc"
              slug="bao-cao-thi-truong-q2-2025"
            />
          </aside>
        </div>


        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Bài viết mới nhất</h2>

            <button
              className="text-blue-600 font-medium hover:underline underline-offset-4 decoration-2 decoration-blue-600"
            >
              Xem tất cả
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestArticles.map((article, index) => (
              <ImageCard key={index} {...article} />
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

export default Index;
