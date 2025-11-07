import Banner from '@/components/Checkout/baner'
import PaymentForm from '@/components/Checkout/paymentForm'
import OrderSummary from '@/components/Checkout/summary'

const CheckoutPage = () => {
  return (
    <div className='bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        <Banner />
        <div className='py-5 grid grid-cols-1 md:grid-cols-5 items-start min-h-[60vh] gap-6'>
          <div className='md:col-span-3'>
            <PaymentForm />
          </div>
          <div className='md:col-span-2'>
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
