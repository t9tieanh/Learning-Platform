import { FC } from 'react'
import './assets/styles/app.css'
import './assets/styles/app.scss'
import { Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import GlobalChatNotifier from '@/components/Chat/GlobalChatNotifier'
import { VipUpgradeProvider } from '@/contexts/VipUpgradeContext'

const App: FC = () => {
  return (
    <VipUpgradeProvider>
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
              width: 'fit-content',
              padding: '15px 20px 15px 20px'
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
