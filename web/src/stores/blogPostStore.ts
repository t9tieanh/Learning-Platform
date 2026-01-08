import { create } from 'zustand'
import type { SerializedEditorState } from 'lexical'

interface BlogPostState {
  title: string
  image: string // data URL
  editorState: SerializedEditorState | null
  setTitle: (title: string) => void
  setImage: (image: string) => void
  setEditorState: (state: SerializedEditorState) => void
  reset: () => void
}

export const useBlogPostStore = create<BlogPostState>((set) => ({
  title: '',
  image: '',
  editorState: null,
  setTitle: (title) => set({ title }),
  setImage: (image) => set({ image }),
  setEditorState: (editorState) => set({ editorState }),
  reset: () => set({ title: '', image: '', editorState: null })
}))
