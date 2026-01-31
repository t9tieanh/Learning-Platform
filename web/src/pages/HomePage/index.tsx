import { Banner } from '@/components/HomePage/Banner'
import CourseList from '@/components/HomePage/CourseList'
import TrendingCategories from '@/components/HomePage/TrendingCategories'
import WhyChooseUsSection from '@/components/HomePage/WhyChooseUsSection'
import HighlightedArticles from '@/components/HomePage/HighlightedArticles'
import courseService from '@/services/course/course-user.service'
import { TestimonialsCarousel } from '@/components/HomePage/StudentCarousel/TestimonialsCarousel'
import eventTracker from '@/services/personalize/eventTracker'
import { useEffect } from 'react'

const HomePage = () => {
  useEffect(() => {
    void eventTracker.trackingEvent('HOME_PAGE_VIEW').catch(() => {
      // ignore tracking errors
    })
  }, [])

  return (
    <div className='home-page-container '>
      <Banner />
      <CourseList title='Khóa học bán chạy nhất' fetcher={courseService.getBestSellerCourses} />
      <CourseList title='Khóa học hot tháng này' fetcher={courseService.getTrendyCourseThisMonth} />
      <TrendingCategories />
      <WhyChooseUsSection />
      <TestimonialsCarousel />
      <HighlightedArticles />
    </div>
  )
}

export default HomePage
