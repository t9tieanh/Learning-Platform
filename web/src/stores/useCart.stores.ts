import { create } from 'zustand'
import cartService from '@/services/sale/cart.service'

type CartState = {
  count: number
  loading: boolean
  error: string | null

  /** Fetch cart items from server and update count */
  refresh: () => Promise<void>
}

export const useCartStore = create<CartState>((set) => ({
  count: 0,
  loading: false,
  error: null,

  refresh: async () => {
    set(() => ({ loading: true, error: null }))
    try {
      const res = await cartService.getCartItemCount()
      set(() => ({ count: res?.result?.count ?? 0 }))
    } catch (err: any) {
      set(() => ({ error: err?.message ?? 'Failed to fetch cart items' }))
    } finally {
      set(() => ({ loading: false }))
    }
  }
}))
