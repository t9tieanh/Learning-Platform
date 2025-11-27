import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TestimonialCardProps {
    name: string;
    role: string;
    image: string;
    content: string;
    rating: number;
}

export const TestimonialCard = ({ name, role, image, content, rating }: TestimonialCardProps) => {
    return (
        <Card className="p-6 h-full flex flex-col shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1 bg-card border-border/50">
            <div className="flex items-center gap-4 mb-4">
                <img
                    src={image}
                    alt={name}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20"
                />
                <div className="flex-1">
                    <h3 className="font-semibold text-lg text-card-foreground">{name}</h3>
                    <p className="text-sm text-muted-foreground">{role}</p>
                </div>
            </div>

            <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`w-4 h-4 ${i < rating
                                ? "fill-yellow-400 text-yellow-100"
                                : "fill-muted text-muted"
                            }`}
                    />
                ))}
            </div>

            <p className="text-card-foreground/80 leading-relaxed flex-1">
                "{content}"
            </p>
        </Card>
    );
};
