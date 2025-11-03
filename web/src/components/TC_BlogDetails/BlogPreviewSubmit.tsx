import { useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useBlogPostStore } from "@/stores/blogPostStore";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { EditorState, SerializedEditorState } from "lexical";
import { editorTheme } from "@/components/editor/themes/editor-theme";
import { nodes } from "@/components/blocks/editor-x/nodes";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ContentEditable } from "@/components/editor/editor-ui/content-editable";
import { Separator } from "@/components/ui/separator";
import { Upload } from "lucide-react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

function ReadOnlyPlugin() {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        editor.setEditable(false);
    }, [editor]);
    return null;
}

export default function BlogPreviewSubmit() {
    const { title, image, editorState } = useBlogPostStore();

    const initialConfig = useMemo(() => ({
        namespace: "Preview",
        theme: editorTheme,
        nodes,
        onError: (error: Error) => console.error(error),
        ...(editorState
            ? { editorState: JSON.stringify(editorState as SerializedEditorState) }
            : {}),
    }), [editorState]);

    // Force LexicalComposer to remount when editorState changes so preview updates
    const previewKey = useMemo(() => {
        try {
            return editorState ? JSON.stringify(editorState).length : 0;
        } catch {
            return Math.random();
        }
    }, [editorState]);

    const handleSubmit = () => {
        if (!title.trim()) {
            toast.error("Vui lòng nhập tiêu đề bài viết");
            return;
        }
        if (!editorState) {
            toast.error("Vui lòng nhập nội dung bài viết");
            return;
        }
        // In real app: send to API; here we just log
        // You might also want to export to HTML/Markdown here depending on backend contract
        const payload = { title, image, editorState };
        // eslint-disable-next-line no-console
        console.log("Submit Blog Payload:", payload);
        toast.success("Bài viết đã được gửi");
    };

    return (
        <Card className="border-border mt-8 p-2 py-8">
            <CardHeader>
                <CardTitle className="text-2xl font-semibold">Xem trước & Đăng bài</CardTitle>
                <CardDescription>
                    Xem cách bài viết hiển thị và nhấn Đăng để gửi
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {!title && !editorState ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>Nội dung xem trước sẽ hiển thị tại đây khi bạn nhập bài viết</p>
                    </div>
                ) : (
                    <article className="space-y-4">
                        {title && (
                            <h1 className="text-3xl lg:text-4xl font-bold leading-tight">{title}</h1>
                        )}
                        {image && (
                            <div className="rounded-lg overflow-hidden border border-border">
                                <img src={image} alt={title} className="w-full h-64 object-cover" />
                            </div>
                        )}
                        <div className="prose prose-slate max-w-none">
                            <LexicalComposer key={previewKey} initialConfig={initialConfig}>
                                <ReadOnlyPlugin />
                                <RichTextPlugin
                                    contentEditable={
                                        <ContentEditable
                                            placeholder={""}
                                            className="min-h-40 px-1 py-1 focus:outline-none"
                                        />
                                    }
                                    placeholder={null}
                                    ErrorBoundary={LexicalErrorBoundary}
                                />
                            </LexicalComposer>
                        </div>
                    </article>
                )}

                <Separator />
                <div className="flex justify-center items-center mt-6">
                    <Button onClick={handleSubmit} className="w-fit px-10 py-4">
                        <Upload className="mr-2 h-5 w-5" />
                        Đăng Bài Viết
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
