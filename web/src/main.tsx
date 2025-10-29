import React from 'react'
import App from './App'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import HomePage from './pages/HomePage'
import DefaultLayout from './layouts/DefaultLayout'
import HeaderLayout from './layouts/HeaderLayout'
import Course from './pages/Course'
import CartPage from './pages/Cart'
import AuthLayout from './layouts/AuthLayout'
import TC_Layout from './layouts/TC_Layout'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'
import User from '@/pages/User'
import TCHomePage from './pages/TC_HomePage'
import ForgotPass from './pages/ForgotPass'
import CoursePage from './pages/CoursePage'
import AllCourse from './pages/AllCourse'
import Chat from './pages/Chat'
import TC_Course from './pages/TC_Courses'
import TC_CreateCourse from './pages/TC_CreateCourse'
import TC_Profile from './pages/TC_Profile'
import TC_CourseDetail from './pages/TC_CourseDetail'
import { SocketProvider } from '@/api/socket/socket.context'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // Default Layout (Header & Footer)
      {
        path: '',
        element: <DefaultLayout />,
        children: [
          { path: '', element: <HomePage /> },
          { path: 'course/:id', element: <Course /> },
          { path: 'my-cart', element: <CartPage /> },
          { path: 'profile', element: <Profile /> },
          { path: 'courses', element: <AllCourse /> },
        ]
      },
      // Header Layout
      {
        path: '',
        element: <HeaderLayout />,
        children: [
          { path: 'chat/:id', element: <Chat /> }
        ]
      },
      // Not has Layout
      { path: 'auth', element: <AuthLayout /> },
      { path: 'user/verify', element: <User /> },
      { path: '*', element: <NotFound /> },
      { path: 'forgot', element: <ForgotPass /> },
      { path: 'course-page', element: <CoursePage /> },

      // Instructor
      {
        path: 'teacher',
        children: [
          { path: '', element: <TCHomePage /> },
          { path: 'course', element: <TC_Course /> },
          { path: 'course/:id', element: <TC_CreateCourse /> },
          { path: 'profile', element: <TC_Profile /> },
          { path: 'course-details/:id', element: <TC_CourseDetail /> },
          // Alias cũ (nếu ai truy cập không có id sẽ 404 hoặc có thể điều hướng)
          { path: 'course-details', element: <NotFound /> }
        ]
      },
      {
        path: 'teacher',
        element: <TC_Layout />,
        children: [
          { path: 'chat/:id', element: <Chat /> }
        ]
      },
      { path: 'user/verify', element: <User /> },
      { path: 'TC_CourseDetail/:id', element: <TC_CourseDetail /> },
      { path: '*', element: <NotFound /> },
      // { path: 'chat', element: <Chat /> }

    ]
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <>
    <SocketProvider>
      <RouterProvider router={router} />
    </SocketProvider>
  </>
)
