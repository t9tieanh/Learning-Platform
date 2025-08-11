import Banner from '@/components/Cart/Banner'
import CardSection from '@/components/Cart/CartSection'
import CheckoutSummary from '@/components/Cart/CheckoutSummary'
import RecommendedCourses from '@/components/Cart/RecommendedCourses'
import './style.scss'

const CartPage = () => {
  return (
    <div className='cart-page'>
      <Banner />
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mx-4 lg:mx-12 min-h-[60vh] mt-5 gap-6'>
        <div className='lg:col-span-3 md:col-span-1'>
          <CardSection />
        </div>
        <div className='lg:col-span-1 md:col-span-1'>
          <CheckoutSummary />
        </div>
      </div>
      <div className='mx-12 min-h-[60vh]'>
        <RecommendedCourses />
      </div>
      <div className='end-cart'/>
    </div>
  )
}

export default CartPage
