import { Banner } from '@/components/HomePage/Banner'
import CourseList from '@/components/HomePage/CourseList'
import TrendingCategories from '@/components/HomePage/TrendingCategories'
import WhyChooseUsSection from '@/components/HomePage/WhyChooseUsSection'
import HighlightedArticles from '@/components/HomePage/HighlightedArticles'

const HomePage = () => {
  return (
    <div className='home-page-container'>
      <Banner />
      <CourseList />
      <TrendingCategories />
      <WhyChooseUsSection />
      <HighlightedArticles />
    </div>
  )
}

export default HomePage
