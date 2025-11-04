import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import blogHero from "@/assets/images/blog1.png";

const BlogDetails = () => {
    const blog = {
        title: "Khám Phá Công Nghệ Web Hiện Đại Với React và TypeScript",
        author: {
            name: "Nguyễn Văn An",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
        },
        publishedDate: "15 Tháng 11, 2025",
        updatedDate: "20 Tháng 11, 2025",
        image: blogHero,
        content: `
Trong thế giới phát triển web hiện đại, React đã trở thành một trong những framework phổ biến nhất. Kết hợp với TypeScript, 
chúng ta có thể xây dựng các ứng dụng web mạnh mẽ, dễ bảo trì và có khả năng mở rộng cao.

React mang đến một cách tiếp cận component-based, giúp tái sử dụng code hiệu quả và tạo ra giao diện người dùng tương tác. 
TypeScript bổ sung tính năng type safety, giúp phát hiện lỗi sớm hơn trong quá trình phát triển.

Một số lợi ích chính của việc sử dụng React với TypeScript:

• Type Safety: Giảm thiểu lỗi runtime bằng cách phát hiện lỗi trong quá trình compile  
• Better IDE Support: Autocomplete và IntelliSense giúp code nhanh hơn  
• Improved Refactoring: Dễ dàng tái cấu trúc code với sự hỗ trợ của type system  
• Documentation: Types hoạt động như documentation tự động  

Khi bắt đầu với React và TypeScript, điều quan trọng là hiểu cách định nghĩa props và state với types phù hợp. 
Điều này không chỉ giúp code dễ đọc hơn mà còn giúp team làm việc hiệu quả hơn.

Các công cụ như Vite cũng giúp việc setup project trở nên đơn giản hơn bao giờ hết. Với hot module replacement 
và build optimization, quá trình development trở nên mượt mà và nhanh chóng.

Hãy bắt đầu hành trình khám phá React và TypeScript ngay hôm nay để xây dựng những ứng dụng web tuyệt vời!
        `,
    };

    return (
        <div className="min-h-screen bg-white">
            <article className="container px-16 py-12 space-y-6">
                {/* Hàng đầu tiên: ảnh + tiêu đề + thông tin tác giả */}
                <div className="flex flex-col lg:flex-row items-start gap-8">
                    {/* Hình minh họa */}
                    <Card className="h-80 overflow-hidden border-2 border-primary/20 shadow-lg lg:w-1/2 py-0">
                        <div className="aspect-video relative">
                            <img
                                src={blog.image}
                                alt={blog.title}
                                className="w-full h-full"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
                        </div>
                    </Card>

                    {/* Tiêu đề + tác giả */}
                    <div className="flex-1 space-y-6">
                        <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                            {blog.title}
                        </h1>

                        <div className="flex items-center gap-4 py-3 border-b border-border/50">
                            <Avatar className="h-16 w-16 border-2 border-blue-300">
                                <AvatarImage src={blog.author.avatar} alt={blog.author.name} />
                                <AvatarFallback className="bg-muted text-muted-foreground">
                                    {blog.author.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex flex-col gap-2">
                                <p className="font-medium text-foreground text-xl">{blog.author.name}</p>
                                <span className="items-center text-sm text-muted-foreground">
                                    <span className="font-semibold text-foreground">Đăng ngày:</span>{" "}
                                    <span className="italic">{blog.updatedDate}</span>
                                </span>
                                <span className="items-center text-sm text-muted-foreground">
                                    <span className="font-semibold text-foreground">Cập nhật:</span>{" "}
                                    <span className="italic">{blog.updatedDate}</span>
                                </span>
                            </div>
                        </div>

                    </div>
                </div>

                <Separator className="bg-border" />

                {/* Nội dung bài viết — full width */}
                <div className="prose prose-lg max-w-none">
                    <div className="text-foreground/90 leading-relaxed whitespace-pre-line text-justify">
                        {blog.content}
                    </div>
                </div>

            </article>
        </div>
    );
};

export default BlogDetails;
