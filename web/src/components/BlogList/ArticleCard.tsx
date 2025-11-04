import { Calendar, User } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface Article {
    id: number;
    title: string;
    image: string;
    author: string;
    createdAt: string;
}

interface ArticleCardProps {
    article: Article;
}

export const ArticleCard = ({ article }: ArticleCardProps) => {
    return (
        <Card className="group overflow-hidden border border-border bg-card hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 cursor-pointer">
            <div className="aspect-video overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
            </div>
            <div className="p-6">
                <h3 className="text-xl font-semibold text-card-foreground mb-4 line-clamp-2 group-hover:text-accent transition-colors duration-300">
                    {article.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <User className="h-4 w-4" />
                        <span>{article.author}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>{article.createdAt}</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};
