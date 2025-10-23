import { FC, useState } from 'react'
import './assets/styles/app.css'
import './assets/styles/app.scss'
import { Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'

const App: FC = () => {
  return (
    <div>
      <Outlet />
      <Toaster
        position='top-center'
        richColors
        expand={true}
        toastOptions={{
          style: {
            background: 'white',
            color: 'black'
          }
        }}
      />
    </div>
  )
}

export default App
