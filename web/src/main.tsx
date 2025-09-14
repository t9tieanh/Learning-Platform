import React from 'react'
import App from './App'
import { ToastContainer } from 'react-toastify'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import HomePage from './pages/HomePage'
import DefaultLayout from './layouts/DefaultLayout'
import Course from './pages/Course'
import CartPage from './pages/Cart'
import AuthLayout from './layouts/AuthLayout'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'
import User from '@/pages/User'
import TCHomePage from './pages/TC_HomePage'
import ForgotPass from './pages/ForgotPass'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: <DefaultLayout />,
        children: [
          { path: '', element: <HomePage /> },
          { path: 'course/:id', element: <Course /> },
          { path: 'my-cart', element: <CartPage /> },
          { path: 'profile', element: <Profile /> }
        ]
      },
      { path: 'auth', element: <AuthLayout /> },
      { path: 'user/verify', element: <User /> },
      { path: '*', element: <NotFound /> },
      { path: 'forgot', element: <ForgotPass /> },
      {
        path: 'teacher',
        children: [{ path: '', element: <TCHomePage /> }]
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <>
    <RouterProvider router={router} />
    <ToastContainer />
  </>
)
