import App from './App'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import HomePage from './pages/HomePage'
import DefaultLayout from './layouts/DefaultLayout'
import CheckoutPage from './pages/Checkout'
import Course from './pages/Course'
import CartPage from './pages/Cart'
import AuthLayout from './layouts/AuthLayout'
import TC_Layout from './layouts/TC_Layout'
import AdminLayout from './layouts/AdminLayout'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'
import User from '@/pages/User'
import TCHomePage from './pages/TC_HomePage'
import ForgotPass from './pages/ForgotPass'
import CoursePage from './pages/CoursePage'
import AllCourse from './pages/AllCourse'
import About from './pages/AboutUs'
import Chat from './pages/Chat'
import Blog from './pages/Blog'
import BlogList from './pages/BlogList'
import BlogDetails from './pages/BlogDetails'
import Terms from './pages/GeneralTerms'
import TC_Course from './pages/TC_Courses'
import TC_CreateCourse from './pages/TC_CreateCourse'
import TC_CourseDetail from './pages/TC_CourseDetail'
import TC_Blog from './pages/TC_Blog'
import TC_CreateBlog from './pages/TC_CreateBlog'
import TC_BlogDetails from './pages/TC_BlogDetails'
import TC_UpdateBlog from './pages/TC_UpdateBlog'
import AD_HomePage from './pages/AD_HomePage'
import AD_Courses from './pages/AD_Courses'
import AD_CourseDetails from './pages/AD_CourseDetails'
import AD_Instructor from './pages/AD_Instructor'
import AD_Certificates from './pages/AD_Certificates'
import AD_Blogs from './pages/AD_Blogs'
import AD_BlogDetails from './pages/AD_BlogDetails'
import Home2 from './pages/Home2'
import { SocketProvider } from '@/api/socket/socket.context'
import DiscountsAdmin from './pages/AD_Discounts'
import AuthenticationGate from '@/components/auth-gate/AuthenticationGate'

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
          { path: 'me', element: <Profile /> },
          { path: 'courses', element: <AllCourse /> },
          { path: 'chat/:id', element: <Chat />, handle: { hideFooter: true, hideBubble: true } },
          { path: 'blog', element: <Blog /> },
          { path: 'blogs', element: <BlogList /> },
          { path: 'blog-details/:id', element: <BlogDetails /> },
          { path: 'home2', element: <Home2 /> },
          { path: 'about', element: <About /> },
          { path: 'check-out', element: <CheckoutPage /> },
          { path: 'check-out/:id', element: <CheckoutPage /> }
        ]
      },
      { path: 'auth', element: <AuthLayout /> },
      { path: 'user/verify', element: <User /> },
      { path: '*', element: <NotFound /> },
      { path: 'forgot', element: <ForgotPass /> },
      { path: 'course-page/:courseId', element: <CoursePage /> },
      { path: 'term', element: <Terms /> },
      {
        path: 'teacher',
        element: <TC_Layout />,
        children: [
          { path: '', element: <TCHomePage /> },
          { path: 'course', element: <TC_Course /> },
          { path: 'course-details/:id', element: <TC_CourseDetail /> },
          { path: 'chat/:id', element: <Chat /> },
          { path: 'blogs', element: <TC_Blog /> },
          { path: 'create-blog', element: <TC_CreateBlog /> },
          { path: 'course-details', element: <NotFound /> },
          { path: 'blog/:id', element: <TC_BlogDetails /> },
          { path: 'update-blog/:id', element: <TC_UpdateBlog /> }
        ]
      },
      {
        path: 'teacher/course/:id',
        element: (
          <AuthenticationGate>
            <TC_CreateCourse />
          </AuthenticationGate>
        )
      },
      {
        path: 'admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <AD_HomePage /> },
          { path: 'courses', element: <AD_Courses /> },
          { path: 'course/:id', element: <AD_CourseDetails /> },
          { path: 'instructors', element: <AD_Instructor /> },
          { path: 'certificates', element: <AD_Certificates /> },
          { path: 'discounts', element: <DiscountsAdmin /> },
          { path: 'blogs', element: <AD_Blogs /> },
          { path: 'blog/:id', element: <AD_BlogDetails /> }
        ]
      },
      { path: 'user/verify', element: <User /> },
      { path: 'TC_CourseDetail/:id', element: <TC_CourseDetail /> },
      { path: '*', element: <NotFound /> }
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
