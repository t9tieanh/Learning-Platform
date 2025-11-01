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
  } | null
}

type authActions = {
  setData: (data: authState['data']) => void
}

export const useAuthStore = create(
  persist<authState & authActions>(
    (set) => ({
      data: null,
      setData: (data) => set(() => ({ data }))
    }),
    {
      name: 'user-storage'
    }
  )
)
