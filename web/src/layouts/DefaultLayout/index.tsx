import { FC } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '@/components/Header'

const DefaultLayout: FC = () => {
  return (
    <>
      <Header />
      <Outlet />
    </>
  )
}
export default DefaultLayout
