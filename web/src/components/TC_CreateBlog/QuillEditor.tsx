import React, { useRef, useState, useEffect, forwardRef, useLayoutEffect } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

interface RichTextEditorProps {
    defaultValue?: any; // legacy delta support
    initialHtml?: string; // preferred: set initial HTML content
    readOnly?: boolean;
    onChange?: (html: string) => void;
}

const QuillEditor = forwardRef<Quill | null, RichTextEditorProps>(
    ({ defaultValue, initialHtml, readOnly = false, onChange }, ref) => {
        const containerRef = useRef<HTMLDivElement | null>(null);
        const quillRef = useRef<Quill | null>(null);

        useLayoutEffect(() => {
            if (!containerRef.current) return;

            const editorContainer = document.createElement("div");
            containerRef.current.appendChild(editorContainer);

            const quill = new Quill(editorContainer, {
                theme: "snow",
                placeholder: "Nhập nội dung bài viết ở đây...",
            });

            quillRef.current = quill;
            if (ref) {
                if (typeof ref === "function") ref(quill);
                else ref.current = quill;
            }

            if (initialHtml && typeof initialHtml === 'string') {
                quill.clipboard.dangerouslyPasteHTML(initialHtml);
                onChange?.(quill.root.innerHTML);
            } else if (defaultValue) {
                quill.setContents(defaultValue);
                onChange?.(quill.root.innerHTML);
            }

            quill.on("text-change", () => {
                onChange?.(quill.root.innerHTML);
            });

            return () => {
                containerRef.current!.innerHTML = "";
            };
        }, []);

        useEffect(() => {
            if (quillRef.current) {
                quillRef.current.enable(!readOnly);
            }
        }, [readOnly]);

        useEffect(() => {
            const quill = quillRef.current;
            if (!quill) return;
            if (typeof initialHtml !== 'string') return;
            const current = quill.root.innerHTML;
            if (current.trim() !== initialHtml.trim()) {
                quill.setSelection(0, 0);
                quill.clipboard.dangerouslyPasteHTML(initialHtml);
                onChange?.(quill.root.innerHTML);
            }
        }, [initialHtml]);

        return (
            <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
                <div ref={containerRef} className="min-h-[300px]" />
            </div>
        );
    }
);

QuillEditor.displayName = "QuillEditor";
export default QuillEditor;
