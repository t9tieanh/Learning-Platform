import { useState } from "react";
import BlogPostEditor from "@/components/TC_CreateBlog/BlogPostEditor";
import BlogPreviewSubmit from "@/components/TC_CreateBlog/BlogPreviewSubmit";
import TitleComponent from "@/components/TC_CreateCourse/common/Title";
import QuillEditor from "@/components/TC_CreateBlog/QuillEditor";
const Index = () => {
    const [html, setHtml] = useState<string>("");
    return (
        <div className="min-h-screen px-28 py-10">
            <div className="max-w-7xl mx-auto">
                <TitleComponent
                    title="Tạo bài viết mới"
                    description="Trang này giúp bạn viết và xuất bản bài viết (blog) của mình. Một bài viết được trình bày hấp dẫn, có nội dung rõ ràng và giá trị sẽ giúp bạn thu hút nhiều độc giả hơn"
                />
                <BlogPostEditor />
                <QuillEditor onChange={setHtml} />
                <BlogPreviewSubmit contentHtml={html} />
            </div>
        </div>
    );
};

export default Index;