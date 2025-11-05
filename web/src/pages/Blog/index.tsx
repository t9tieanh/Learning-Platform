import { HeroSection } from "@/components/Blog/HeroSection";
import { ArticleCard } from "@/components/Blog/ArticleCard";
import { FeaturedCard } from "@/components/Blog/FeaturedCard";
import { ImageCard } from "@/components/Blog/ImageCard";
import { useEffect, useState } from "react";
import { blogService, type BlogItem } from "@/services/blog.service";

const Index = () => {
  const [trending, setTrending] = useState<BlogItem[]>([]);
  const [latest, setLatest] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [tr, nw] = await Promise.all([
          blogService.getTrending(),
          blogService.getNew(),
        ]);
        if (!mounted) return;
        setTrending(tr);
        setLatest(nw);
      } catch (e) {
        console.error(e);
        if (mounted) setError("Không thể tải dữ liệu blog");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

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
                {loading && (
                  <div className="text-sm text-muted-foreground">Đang tải bài viết thịnh hành...</div>
                )}
                {error && (
                  <div className="text-sm text-red-500">{error}</div>
                )}
                {!loading && !error && trending.map((item) => (
                  <ArticleCard
                    key={item._id}
                    image={item.image_url}
                    category={"Blog"}
                    title={item.title}
                    slug={item._id}
                  />
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
            {loading && (
              <div className="text-sm text-muted-foreground">Đang tải bài viết mới nhất...</div>
            )}
            {error && (
              <div className="text-sm text-red-500">{error}</div>
            )}
            {!loading && !error && latest.map((item) => (
              <ImageCard
                key={item._id}
                image={item.image_url}
                title={item.title}
                slug={item._id}
              />
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

export default Index;
