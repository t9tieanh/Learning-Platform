import BlogPostEditor from "@/components/TC_BlogDetails/BlogPostEditor";
import RichTextEditor from '@/components/TC_BlogDetails/RichTextEditor';
import BlogPreviewSubmit from "@/components/TC_BlogDetails/BlogPreviewSubmit";
import TitleComponent from "@/components/TC_CreateCourse/common/Title";
const Index = () => {
    return (
        <div className="min-h-screen px-28 py-10">
            <div className="max-w-7xl mx-auto">
                <TitleComponent
                    title="Tạo bài viết mới"
                    description="Trang này giúp bạn viết và xuất bản bài viết (blog) của mình. Một bài viết được trình bày hấp dẫn, có nội dung rõ ràng và giá trị sẽ giúp bạn thu hút nhiều độc giả hơn"
                />
                <BlogPostEditor />
                <RichTextEditor />
                <BlogPreviewSubmit />
            </div>
        </div>
    );
};

export default Index;