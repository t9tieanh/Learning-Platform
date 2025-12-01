import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type authState = {
  data: {
    accessToken: string
    refreshToken: string
    userId: string
    name?: string
    username?: string
    email?: string
    avatarUrl?: string
    conversationId?: string
    role?: string
  } | null
}

type authActions = {
  setData: (data: authState['data']) => void
  setConversationId: (conversationId: string) => void
  logout: () => void
}

export const useAuthStore = create(
  persist<authState & authActions>(
    (set) => ({
      data: null,
      setData: (data) => set(() => ({ data })),
      setConversationId: (conversationId) => set((s) => ({ data: s.data ? { ...s.data, conversationId } : s.data })),
      logout: () => set(() => ({ data: null }))
    }),
    {
      name: 'user-storage'
    }
  )
)
