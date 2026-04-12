import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PromotionState {
    homePageVisitCount: number
}

interface PromotionActions {
    incrementVisitCount: () => void
}

export const usePromotionStore = create<PromotionState & PromotionActions>()(
    persist(
        (set) => ({
            homePageVisitCount: 0,
            incrementVisitCount: () => set((state) => ({
                homePageVisitCount: state.homePageVisitCount + 1
            }))
        }),
        {
            name: 'promotion-storage'
        }
    )
)
