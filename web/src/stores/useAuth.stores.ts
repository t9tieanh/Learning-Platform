import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AUTH_STORAGE_KEY } from '@/utils/auth/crossTabAuth.utils'

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
    isVip?: boolean
  } | null
}

type authActions = {
  setData: (data: authState['data']) => void
  setConversationId: (conversationId: string) => void
  setIsVip: (isVip: boolean) => void
  logout: () => void
}

export const useAuthStore = create(
  persist<authState & authActions>(
    (set) => ({
      data: null,
      setData: (data) => set(() => ({ data })),
      setConversationId: (conversationId) => set((s) => ({ data: s.data ? { ...s.data, conversationId } : s.data })),
      setIsVip: (isVip) => set((s) => ({ data: s.data ? { ...s.data, isVip } : s.data })),
      logout: () => set(() => ({ data: null }))
    }),
    {
      name: AUTH_STORAGE_KEY
    }
  )
)
