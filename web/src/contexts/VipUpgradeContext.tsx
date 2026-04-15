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

export const useVipUpgrade = (): VipUpgradeContextType => {
  const context = useContext(VipUpgradeContext)
  if (!context) {
    throw new Error('useVipUpgrade must be used within a VipUpgradeProvider')
  }
  return context
}
