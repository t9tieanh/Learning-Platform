import React, { createContext, useContext, useState, ReactNode } from 'react'
import VipUpgradeDialog from '@/components/vip-member/VipUpgradeDialog'
import { useAuthStore } from '@/stores/useAuth.stores'

interface VipUpgradeContextType {
  openVipDialog: () => void
  closeVipDialog: () => void
}

const VipUpgradeContext = createContext<VipUpgradeContextType | undefined>(undefined)

export const VipUpgradeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)

  const openVipDialog = () => setIsOpen(true)
  const closeVipDialog = () => setIsOpen(false)

  return (
    <VipUpgradeContext.Provider value={{ openVipDialog, closeVipDialog }}>
      {children}
      <VipUpgradeDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        onUpgrade={() => {
          // Toggle mock store
          useAuthStore.getState().setData({
            ...useAuthStore.getState().data,
            isVip: true
          } as any)
        }}
      />
    </VipUpgradeContext.Provider>
  )
}

const noopVip: VipUpgradeContextType = {
  openVipDialog: () => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn('[useVipUpgrade] VipUpgradeProvider is missing; openVipDialog is a no-op.')
    }
  },
  closeVipDialog: () => {},
}

/**
 * Mặc định yêu cầu VipUpgradeProvider; nếu thiếu (HMR, test, lỗi cấu trúc cây) trả về no-op
 * thay vì throw để không làm sập cả ứng dụng.
 */
export const useVipUpgrade = (): VipUpgradeContextType => {
  const context = useContext(VipUpgradeContext)
  if (!context) {
    return noopVip
  }
  return context
}
