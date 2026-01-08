import { useState, useEffect } from 'react'
import { TestimonialCard } from './TestimonialCard'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import student1 from '@/assets/images/user1.jpg'
import student2 from '@/assets/images/user2.jpg'
import student3 from '@/assets/images/user3.jpg'
import student4 from '@/assets/images/user4.jpg'
const testimonials = [
  {
    id: 1,
    name: 'Nguyễn Hải Lam',
    role: 'Học viên Lập trình Web',
    image: student1,
    content:
      'Nền tảng học trực tuyến rất dễ sử dụng, giao diện trực quan. Khóa học lập trình Web được thiết kế chi tiết, giảng viên giải thích rõ ràng, tôi tiến bộ nhanh chóng.',
    rating: 5
  },
  {
    id: 2,
    name: 'Nguyễn Đức Sang',
    role: 'Học viên DevOps',
    image: student2,
    content:
      'Các khóa học DevOps trên nền tảng này rất thực tế, bài tập và tài liệu đầy đủ. Giảng viên hỗ trợ nhiệt tình, hệ thống quản lý học tập mượt mà và tiện lợi.',
    rating: 5
  },
  {
    id: 3,
    name: 'Trần Thị Quỳnh Anh',
    role: 'Học viên Data Science',
    image: student3,
    content:
      'Tôi rất hài lòng với chất lượng khóa học Data Science. Hệ thống trực tuyến giúp tôi học mọi lúc, giảng viên giải thích các khái niệm phức tạp dễ hiểu, bài tập thực hành đa dạng.',
    rating: 5
  },
  {
    id: 4,
    name: 'Phạm Tiến Anh',
    role: 'Học viên Frontend Development',
    image: student4,
    content:
      'Nền tảng này thật tuyệt, các khóa học Frontend được tổ chức khoa học. Hỗ trợ từ giảng viên và cộng đồng nhanh chóng, giúp tôi hoàn thành dự án thực tế dễ dàng.',
    rating: 5
  }
]

export const TestimonialsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const goToPrev = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const getVisibleTestimonials = () => {
    const visible = []
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % testimonials.length
      visible.push(testimonials[index])
    }
    return visible
  }

  return (
    <section className='py-6 bg-gradient-to-b from-background to-blue-500/30'>
      <h4 className='font-bold bg-blue-500 text-white p-2 max-w-80 pl-12 rounded-r-3xl'>Học viên nói gì</h4>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center mb-12 animate-fade-in'>
          <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
            Hàng nghìn học viên đã tin tưởng và đạt được mục tiêu của mình cùng nền tảng của chúng tôi
          </p>
        </div>

        <div className='relative'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
            {getVisibleTestimonials().map((testimonial, index) => (
              <div key={testimonial.id} className='animate-fade-in' style={{ animationDelay: `${index * 0.1}s` }}>
                <TestimonialCard {...testimonial} />
              </div>
            ))}
          </div>

          <div className='flex justify-center items-center gap-4'>
            <Button
              variant='outline'
              size='icon'
              onClick={goToPrev}
              className='rounded-full hover:bg-primary hover:text-primary-foreground transition-colors'
            >
              <ChevronLeft className='h-5 w-5' />
            </Button>

            <div className='flex gap-2'>
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAutoPlaying(false)
                    setCurrentIndex(index)
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-muted hover:bg-muted-foreground'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant='outline'
              size='icon'
              onClick={goToNext}
              className='rounded-full hover:bg-primary hover:text-primary-foreground transition-colors'
            >
              <ChevronRight className='h-5 w-5' />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
