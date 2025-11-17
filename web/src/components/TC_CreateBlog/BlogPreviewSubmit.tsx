import { useEffect, useMemo, useState } from "react";
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useBlogPostStore } from "@/stores/blogPostStore";
import { Separator } from "@/components/ui/separator";
import { Upload } from "lucide-react";
// Ensure Quill content styles (lists, headings, indents) also apply in preview
import "quill/dist/quill.snow.css";
import "./blog-preview.css";
import blogService from "@/services/blog.service"
import { useAuthStore } from "@/stores/useAuth.stores";
import userService from "@/services/user/user.service";
import type { Profile } from "@/types/profile";

type BlogPreviewSubmitProps = {
    contentHtml?: string;
    blogId?: string; // if provided, submit will update instead of create
};

export default function BlogPreviewSubmit({ contentHtml, blogId }: BlogPreviewSubmitProps) {
    const navigate = useNavigate();
    const { title, image } = useBlogPostStore();
    const { data } = useAuthStore();
    const [submitting, setSubmitting] = useState(false);
    const [profile, setProfile] = useState<Profile | null>(null);

    const hasContent = useMemo(() => Boolean(contentHtml && contentHtml.trim().length > 0), [contentHtml]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await userService.getProfile();
                if (!mounted) return;
                if (res?.result) setProfile(res.result);
            } catch (_) {
                // ignore, show fallback avatar/name
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const initials = useMemo(() => {
        const name = profile?.name || title || "";
        if (!name) return "BL";
        const parts = name.trim().split(/\s+/);
        const first = parts[0]?.[0] || "";
        const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
        return (first + last).toUpperCase() || "BL";
    }, [profile?.name, title]);

    const handleSubmit = async () => {
        const instructorId = data?.userId || (data as any)?.id;
        if (!instructorId) {
            toast.error("Bạn cần đăng nhập để đăng bài viết");
            return;
        }
        if (!title || !title.trim()) {
            toast.error("Vui lòng nhập tiêu đề bài viết");
            return;
        }
        if (!image || !image.trim()) {
            toast.error("Vui lòng chọn/nhập ảnh bìa (image)");
            return;
        }
        if (!hasContent) {
            toast.error("Vui lòng nhập nội dung bài viết");
            return;
        }

        try {
            setSubmitting(true);
            if (blogId) {
                const updated = await blogService.update(blogId, {
                    title: title.trim(),
                    image_url: image,
                    content: contentHtml as string,
                });
                toast.success("Cập nhật blog thành công");
                navigate('/teacher/blogs');
                console.log("Updated Blog:", updated);
            } else {
                const created = await blogService.create({
                    instructor_id: instructorId,
                    title: title.trim(),
                    image_url: image,
                    content: contentHtml as string,
                });
                toast.success("Tạo blog thành công");
                navigate('/teacher/blogs');
                console.log("Created Blog:", created);
            }
        } catch (err: any) {
            // eslint-disable-next-line no-console
            console.error(err);
            toast.error(err?.response?.data?.message || (blogId ? "Cập nhật blog thất bại" : "Tạo blog thất bại"));
        } finally {
            setSubmitting(false);
        }
    };

    const today = useMemo(() => {
        const d = new Date();
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        const hh = String(d.getHours()).padStart(2, "0");
        const min = String(d.getMinutes()).padStart(2, "0");
        return `${hh}:${min} ${dd}/${mm}/${yyyy} `;
    }, []);


    return (
        <Card className="border-border mt-8 p-2 py-8">
            <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-semibold">Xem trước & Đăng bài</CardTitle>
                <CardDescription>
                    Xem cách bài viết hiển thị và nhấn Đăng để gửi
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {!title && !hasContent ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>Nội dung xem trước sẽ hiển thị tại đây khi bạn nhập bài viết</p>
                    </div>
                ) : (
                    <>
                        {/* Hero Section */}
                        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start !mb-0">
                            <div className="lg:col-span-7">
                                <div className="rounded-lg overflow-hidden border border-border bg-muted/10">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={image || "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1200&q=80&auto=format&fit=crop"}
                                        alt={title || "preview cover"}
                                        className="w-full h-[240px] object-cover"
                                    />
                                </div>
                            </div>
                            <div className="lg:col-span-5 flex flex-col gap-4">
                                {title && (
                                    <h1 className="text-3xl font-extrabold leading-tight tracking-tight">
                                        {title}
                                    </h1>
                                )}
                                <div className="flex items-center gap-3 mt-1">
                                    {profile?.image ? (
                                        <img
                                            src={profile.image}
                                            alt={profile.name}
                                            className="h-12 w-12 rounded-full object-cover border"
                                        />
                                    ) : (
                                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center border text-base font-semibold">
                                            {initials}
                                        </div>
                                    )}
                                    <div className="text-sm text-muted-foreground">
                                        <div className="text-lg font-semibold text-foreground">{profile?.name || "Blogger"}</div>
                                        <div className="flex flex-col gap-0">
                                            <span>
                                                <span className="font-medium text-foreground">Đăng ngày:</span> {today}
                                            </span>
                                            <span>
                                                <span className="font-medium text-foreground">Cập nhật:</span> {today}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <Separator />

                        {/* Content */}
                        {hasContent && (
                            <div className="prose prose-slate max-w-none blog-preview !mt-0">
                                {/* Quill-compatible wrapper so lists/heading/indent styles render */}
                                <div className="ql-editor !px-0 !py-0" dangerouslySetInnerHTML={{ __html: contentHtml as string }} />
                            </div>
                        )}
                    </>
                )}

                <Separator />
                <div className="flex justify-center items-center mt-0">
                    <Button onClick={handleSubmit} disabled={submitting} className="w-fit px-10 py-4">
                        <Upload className="mr-2 h-5 w-5" />
                        {submitting ? (blogId ? "Đang cập nhật..." : "Đang tạo...") : (blogId ? "Cập nhật Bài Viết" : "Đăng Bài Viết")}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
