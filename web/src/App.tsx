import { FC, useState } from 'react'
import './assets/styles/app.css'
import './assets/styles/app.scss'
import { Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import GlobalChatNotifier from '@/components/Chat/GlobalChatNotifier'

const App: FC = () => {
  return (
    <div>
      {/* Global chat notifier must be inside Router context */}
      <GlobalChatNotifier />
      <Outlet />
      <Toaster
        position='top-center'
        richColors
        expand={true}
        toastOptions={{
          style: {
            background: 'white',
            width: 'fit-content',
            padding: '15px 20px 15px 20px'
          },
          classNames: {
            success: "bg-green-500 text-white",
            error: "bg-red-400 text-white",
          },
        }}
      />
    </div>
  )
}

export default App
