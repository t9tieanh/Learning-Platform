import { Link } from "react-router-dom";

interface FeaturedCardProps {
    title: string;
    description: string;
    date: string;
    readTime: string;
    slug: string;
}

export const FeaturedCard = ({ title, description, date, readTime, slug }: FeaturedCardProps) => {
    return (
        <Link to={`/article/${slug}`}>
            <article className="relative bg-blue-500 rounded-3xl overflow-hidden bg-gradient-card shadow-glow p-8 text-white hover:scale-[1.02] transition-transform">
                <div className="absolute top-4 right-4 opacity-20">
                    <svg className="w-32 h-32" viewBox="0 0 100 100" fill="none">
                        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" />
                        <path d="M30 50 L45 65 L70 35" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                <div className="relative">
                    <div className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold mb-4">
                        NỔI BẬT
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
                        {title}
                    </h2>

                    <p className="text-white/90 mb-6 leading-relaxed">
                        {description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-white/80">
                        <span>Đăng ngày {date}</span>
                    </div>
                </div>
            </article>
        </Link>
    );
};
