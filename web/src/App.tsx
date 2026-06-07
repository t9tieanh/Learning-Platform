import { FC } from 'react'
import './assets/styles/app.css'
import './assets/styles/app.scss'
import { Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import GlobalChatNotifier from '@/components/Chat/GlobalChatNotifier'
import { VipUpgradeProvider } from '@/contexts/VipUpgradeContext'
import AuthCrossTabSync from '@/components/auth-gate/AuthCrossTabSync'

const App: FC = () => {
  return (
    <VipUpgradeProvider>
      <AuthCrossTabSync />
      <div>
        {/* Global chat notifier must be inside Router context */}
        <GlobalChatNotifier />
        <Outlet />
        <Toaster
          position='top-center'
          richColors
          expand={true}
          style={{ zIndex: 99999 }}
          toastOptions={{
            style: {
              background: 'white',
              color: '#1f2937',
              width: 'fit-content',
              padding: '12px 20px',
              borderRadius: '16px',
              border: '1px solid #f3f4f6',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
            },
            classNames: {
              success: 'bg-green-500 text-white',
              error: 'bg-red-400 text-white'
            }
          }}
        />
      </div>
    </VipUpgradeProvider>
  )
}

export default App
