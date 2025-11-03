import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useBlogPostStore } from "@/stores/blogPostStore";

interface BlogPost {
    title: string;
    image: string;
    content: string;
}

const BlogPostEditor = () => {
    const [post, setPost] = useState<BlogPost>({
        title: "",
        image: "",
        content: "",
    });
    const [imagePreview, setImagePreview] = useState<string>("");
    const setTitleStore = useBlogPostStore((s) => s.setTitle);
    const setImageStore = useBlogPostStore((s) => s.setImage);

    useEffect(() => {
        setTitleStore(post.title);
    }, [post.title, setTitleStore]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Kích thước ảnh không được vượt quá 5MB");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setImagePreview(result);
                setPost({ ...post, image: result });
                setImageStore(result);
            };
            reader.readAsDataURL(file);
            toast.success("Tải ảnh thành công");
        }
    };

    return (
        <div className="mb-6">
            <Card className="p-2 py-8 border-border">
                <CardContent>
                    {/* Layout hai cột */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        {/* Cột trái */}
                        <div className="space-y-5 max-w-xl">
                            {/* Tiêu đề */}
                            <CardHeader className="px-0">
                                <CardTitle className="text-2xl font-semibold">
                                    Thông tin bài viết
                                </CardTitle>
                                <CardDescription>
                                    Nhập tiêu đề và tải ảnh đại diện cho bài viết của bạn
                                </CardDescription>
                            </CardHeader>
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-base font-medium">
                                    Tiêu đề <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    placeholder="Nhập tiêu đề bài viết..."
                                    value={post.title}
                                    onChange={(e) =>
                                        setPost({ ...post, title: e.target.value })
                                    }
                                    className="text-base"
                                />
                            </div>

                            {/* Ảnh tiêu đề */}
                            <div className="space-y-2">
                                <Label htmlFor="image" className="text-base font-medium">
                                    Ảnh tiêu đề
                                </Label>
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="h-12 cursor-pointer file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
                                />
                            </div>
                        </div>

                        {/* Cột phải */}
                        <div className="flex justify-center md:justify-end">
                            {imagePreview ? (
                                <div className="relative rounded-lg overflow-hidden border border-border w-full max-w-sm">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-48 object-cover rounded-md"
                                    />
                                </div>
                            ) : (
                                <div className="w-full max-w-sm h-48 flex items-center justify-center border border-dashed border-border rounded-md text-muted-foreground text-sm">
                                    Xem trước ảnh sau khi chọn
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default BlogPostEditor;
