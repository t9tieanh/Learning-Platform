import { FC, useState } from 'react'
import './assets/styles/app.css'
import './assets/styles/app.scss'
import { Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import 'ckeditor5/ckeditor5.css';
import 'ckeditor5-premium-features/ckeditor5-premium-features.css';

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
