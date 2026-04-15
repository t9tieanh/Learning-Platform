import { Banner } from '@/components/HomePage/Banner'
import CourseList from '@/components/HomePage/CourseList'
import TrendingCategories from '@/components/HomePage/TrendingCategories'
import WhyChooseUsSection from '@/components/HomePage/WhyChooseUsSection'
import HighlightedArticles from '@/components/HomePage/HighlightedArticles'
import courseService from '@/services/course/course-user.service'
import { TestimonialsCarousel } from '@/components/HomePage/StudentCarousel/TestimonialsCarousel'
import { useCallback, useState, useEffect } from 'react'
import { usePromotionStore } from '@/stores/usePromotionStore'
import CourseCreationPromotion from '@/components/promotion/CourseCreationPromotion'
import DiscountPromotion from '@/components/promotion/DiscountPromotion'

const HomePage = () => {
  const [recommendationRefreshKey, setRecommendationRefreshKey] = useState(0)
  const [showCoursePromotion, setShowCoursePromotion] = useState(false)
  const [showDiscountPromotion, setShowDiscountPromotion] = useState(false)
  const { homePageVisitCount, incrementVisitCount } = usePromotionStore()

  const handlePreferencesSaved = useCallback(() => {
    setRecommendationRefreshKey((prev) => prev + 1)
  }, [])

  useEffect(() => {
    incrementVisitCount()
  }, [])

  useEffect(() => {
    if (homePageVisitCount > 0) {
      // Rotation logic:
      // Visit 1, 4, 7... -> Course Promotion
      // Visit 2, 5, 8... -> Discount Promotion
      // Visit 3, 6, 9... -> Nothing

      const mod = homePageVisitCount % 3

      if (mod === 1) {
        const timer = setTimeout(() => setShowCoursePromotion(true), 1500)
        return () => clearTimeout(timer)
      } else if (mod === 2) {
        const timer = setTimeout(() => setShowDiscountPromotion(true), 1500)
        return () => clearTimeout(timer)
      }
    }
  }, [homePageVisitCount])

  return (
    <div className='home-page-container overflow-x-hidden'>
      <Banner onPreferencesSaved={handlePreferencesSaved} />
      <CourseList
        title='Khóa học gợi ý'
        fetcher={courseService.getPersonalizationCourse}
        refreshKey={recommendationRefreshKey}
      />
      <CourseList title='Khóa học bán chạy' fetcher={courseService.getBestSellerCourses} />
      <TrendingCategories />
      <WhyChooseUsSection />
      <TestimonialsCarousel className='mt-14' />
      <HighlightedArticles />

      <CourseCreationPromotion
        open={showCoursePromotion}
        onOpenChange={setShowCoursePromotion}
      />

      <DiscountPromotion
        open={showDiscountPromotion}
        onOpenChange={setShowDiscountPromotion}
      />
    </div>
  )
}

export default HomePage
