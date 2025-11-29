import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Clock } from "lucide-react";

interface CourseCardProps {
    title: string;
    image: string;
    rating: number;
    hours: string;
}

export const CourseCard = ({
    title,
    image,
    rating,
    hours,
}: CourseCardProps) => {
    return (
        <Card className="overflow-hidden border border-border hover:shadow-[var(--shadow-hover)] transition-[var(--transition-smooth)] cursor-pointer group">
            <div className="relative overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>
            <div className="p-4 space-y-3">
                <h3 className="font-bold text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-300" />
                        <span className="font-semibold text-foreground">{rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{hours}</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};
