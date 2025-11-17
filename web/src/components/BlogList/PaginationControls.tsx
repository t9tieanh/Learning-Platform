import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const PaginationControls = ({
    currentPage,
    totalPages,
    onPageChange,
}: PaginationControlsProps) => {
    const getPageNumbers = () => {
        const pages = [];
        const showEllipsisStart = currentPage > 3;
        const showEllipsisEnd = currentPage < totalPages - 2;

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            if (showEllipsisStart) pages.push("...");

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (showEllipsisEnd) pages.push("...");
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-12">
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-10 w-10 rounded-lg border-border hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
            >
                <ChevronLeft className="h-5 w-5" />
            </Button>

            {getPageNumbers().map((page, index) => (
                <Button
                    key={index}
                    variant={page === currentPage ? "default" : "outline"}
                    onClick={() => typeof page === "number" && onPageChange(page)}
                    disabled={typeof page !== "number"}
                    className={`h-10 min-w-10 px-4 rounded-lg transition-all ${page === currentPage
                            ? "bg-accent text-accent-foreground shadow-md"
                            : "border-border hover:bg-secondary"
                        }`}
                >
                    {page}
                </Button>
            ))}

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-10 w-10 rounded-lg border-border hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
            >
                <ChevronRight className="h-5 w-5" />
            </Button>
        </div>
    );
};
