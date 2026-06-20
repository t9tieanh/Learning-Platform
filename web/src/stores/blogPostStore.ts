import { create } from 'zustand'
import type { SerializedEditorState } from 'lexical'

interface BlogPostState {
  title: string
  image: string // data URL
  tags: string[]
  editorState: SerializedEditorState | null
  setTitle: (title: string) => void
  setImage: (image: string) => void
  setTags: (tags: string[]) => void
  setEditorState: (state: SerializedEditorState) => void
  reset: () => void
}

export const useBlogPostStore = create<BlogPostState>((set) => ({
  title: '',
  image: '',
  tags: [],
  editorState: null,
  setTitle: (title) => set({ title }),
  setImage: (image) => set({ image }),
  setTags: (tags) => set({ tags }),
  setEditorState: (editorState) => set({ editorState }),
  reset: () => set({ title: '', image: '', tags: [], editorState: null })
}))
