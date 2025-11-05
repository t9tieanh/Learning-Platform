import { create } from 'zustand'
import cartService from '@/services/sale/cart.service'
import { CourseCart } from '@/types/cart.type'

type CartState = {
  /** number of courses in the cart */
  count: number
  loading: boolean
  error: string | null

  //   setCount: (n: number) => void
  //   increment: () => void
  //   decrement: () => void
  /** Fetch cart items from server and update count */
  refresh: () => Promise<void>
}

export const useCartStore = create<CartState>((set) => ({
  count: 0,
  loading: false,
  error: null,

  //   setCount: (n: number) => set(() => ({ count: n })),

  //   increment: () => set((s) => ({ count: s.count + 1 })),

  //   decrement: () => set((s) => ({ count: Math.max(0, s.count - 1) })),

  refresh: async () => {
    set(() => ({ loading: true, error: null }))
    try {
      const res = await cartService.getCartItems()
      const items: CourseCart[] = res?.result ?? []
      set(() => ({ count: Array.isArray(items) ? items.length : 0 }))
    } catch (err: any) {
      set(() => ({ error: err?.message ?? 'Failed to fetch cart items' }))
    } finally {
      set(() => ({ loading: false }))
    }
  }
}))
