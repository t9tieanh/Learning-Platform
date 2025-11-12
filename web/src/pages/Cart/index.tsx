import Banner from '@/components/Cart/Banner'
import CardSection from '@/components/Cart/CartSection'
import CheckoutSummary from '@/components/Cart/CheckoutSummary'
import RecommendedCourses from '@/components/Cart/RecommendedCourses'
import { CourseCart } from '@/types/cart.type'
import { useState } from 'react'

const CartPage = () => {
  const [courseSelected, setCourseSelected] = useState<CourseCart[]>([])

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        <Banner />
        <div className='py-5 grid grid-cols-1 md:grid-cols-4 items-start min-h-[60vh] gap-6'>
          <div className='md:col-span-3'>
            <CardSection setCourseSelected={setCourseSelected} />
          </div>
          <div className='md:col-span-1'>
            <CheckoutSummary selectedCourses={courseSelected} setCourseSelected={setCourseSelected} />
          </div>
        </div>
        <div className='bg-white p-6 rounded-lg shadow-sm'>
          <RecommendedCourses />
        </div>
      </div>
    </div>
  )
}

export default CartPage
