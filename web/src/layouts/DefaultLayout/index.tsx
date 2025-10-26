import { FC } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '@/components/Header'
import { Footer } from '@/components/Footer/footer2'
import AuthenticationGate from '@/components/auth-gate/AuthenticationGate'

const DefaultLayout: FC = () => {
  return (
    <AuthenticationGate>
      <Header />
      <Outlet />
      <Footer />
    </AuthenticationGate>
  )
}
export default DefaultLayout
