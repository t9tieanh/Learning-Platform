"use client"

import { useState } from "react"
import { SerializedEditorState } from "lexical"

import { Editor } from "@/components/blocks/editor-x/editor"
import { Card, CardTitle, CardDescription } from "../ui/card"
import { useBlogPostStore } from "@/stores/blogPostStore"

export const initialValue = {
    root: {
        children: [
            {
                children: [
                    {
                        text: "",
                        type: "text",
                    },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "paragraph",
                version: 1,
            },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
    },
} as unknown as SerializedEditorState

export default function EditorPage() {
    const [editorState, setEditorState] =
        useState<SerializedEditorState>(initialValue)
    const setEditorStateStore = useBlogPostStore((s) => s.setEditorState)
    return (
        <Card className="p-8 gap-3">
            <CardTitle className="text-2xl font-semibold">Nội dung bài viết</CardTitle>
            <CardDescription>
                Nhập thông nội dung của bài viết
            </CardDescription>
            <Editor
                editorSerializedState={editorState}
                onSerializedChange={(value) => {
                    setEditorState(value)
                    setEditorStateStore(value)
                }}
            />
        </Card>
    )
}
