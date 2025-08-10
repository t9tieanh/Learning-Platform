import Banner from '@/components/Cart/Banner'
import CardSection from '@/components/Cart/CartSection'
import CheckoutSummary from '@/components/Cart/CheckoutSummary'
import './style.scss'

const CartPage = () => {
  return (
    <div className='cart-page'>
      <Banner />
      <div className='grid grid-cols-4 mx-12 max-w-5xl min-h-[60vh] mt-5'>
        <div className='col-span-3'>
          <CardSection />
        </div>
        <div>
          <CheckoutSummary />
        </div>
      </div>
    </div>
  )
}

export default CartPage
