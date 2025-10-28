import { FC } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '@/components/Header'
import { Footer } from '@/components/Footer/footer2'
import ScrollToTop from '@/components/common/ScrollToTop'

const DefaultLayout: FC = () => {
  return (
    <>
      <Header />
      <ScrollToTop />
      <Outlet />
      <Footer />
    </>
  )
}
export default DefaultLayout
