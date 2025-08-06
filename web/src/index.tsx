import React from 'react'
import App from './App'
import { ToastContainer } from 'react-toastify'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import HomePage from './pages/HomePage'
import DefaultLayout from './layouts/DefaultLayout'
import Course from './pages/Course'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: <DefaultLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'course/:id', element: <Course /> }
        ],
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <ToastContainer />
  </React.StrictMode>
)
