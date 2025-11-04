import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const SearchBar = ({ value, onChange, placeholder = "Tìm kiếm bài viết..." }: SearchBarProps) => {
    return (
        <div className="relative w-full max-w-2xl mx-auto">
            {/* Icon màu xanh nhạt */}
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-accent h-5 w-5 transition-colors" />

            {/* Input có viền xanh nhạt và hiệu ứng focus rõ hơn */}
            <Input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="pl-12 h-12 text-base bg-card border border-accent/40 focus:ring-2 focus:ring-accent focus:border-accent rounded-xl shadow-sm transition-all placeholder:text-muted-foreground"
            />

            {/* Hiệu ứng ánh xanh mờ nhẹ phía dưới */}
            <div className="absolute inset-0 rounded-xl ring-1 ring-accent/20 pointer-events-none" />
        </div>
    );
};
