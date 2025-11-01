import { FC } from 'react'
import { Outlet, useMatches } from 'react-router-dom'
import Header from '@/components/Header'
import { Footer } from '@/components/Footer/footer2'
import AuthenticationGate from '@/components/auth-gate/AuthenticationGate'
import ScrollToTop from '@/components/common/ScrollToTop'

const DefaultLayout: FC = () => {
  const matches = useMatches();
  const current = matches[matches.length - 1];
  const hideFooter = current?.handle?.hideFooter;

  return (
    <AuthenticationGate>
      <Header />
      <ScrollToTop />
      <Outlet />
      {!hideFooter && <Footer />}
    </AuthenticationGate>
  )
}
export default DefaultLayout
