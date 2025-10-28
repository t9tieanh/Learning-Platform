import { FC } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '@/components/Header'
import { Footer } from '@/components/Footer/footer2'

const HeaderLayout: FC = () => {
  return (
    <>
      <Header />
      <Outlet />
    </>
  )
}
export default HeaderLayout
