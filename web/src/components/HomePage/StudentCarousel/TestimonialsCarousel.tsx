import { useState, useEffect } from 'react'
import { TestimonialCard } from './TestimonialCard'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import student1 from '@/assets/images/user1.jpg'
import student2 from '@/assets/images/user2.jpg'
import student3 from '@/assets/images/user3.jpg'
import student4 from '@/assets/images/user4.jpg'
import student5 from '@/assets/images/user5.jpeg'
import student6 from '@/assets/images/user6.jpeg'
import student7 from '@/assets/images/user7.jpeg'

const testimonials = [
  {
    id: 1,
    name: 'Nguyễn Minh Khôi',
    role: 'Nhân viên Marketing',
    image: student5,
    content:
      'Nền tảng học trực tuyến rất dễ sử dụng, giao diện trực quan. Khóa học Marketing được thiết kế bài bản, giúp tôi áp dụng hiệu quả vào công việc hằng ngày.',
    rating: 5
  },
  {
    id: 2,
    name: 'Trần Ngọc Ánh',
    role: 'Nhà thiết kế đồ họa',
    image: student7,
    content:
      'Các khóa học thiết kế rất thực tế, bài tập đa dạng và sát với nhu cầu doanh nghiệp. Giảng viên hỗ trợ tận tình, giúp tôi nâng cao kỹ năng và mở rộng tư duy sáng tạo.',
    rating: 5
  },
  {
    id: 3,
    name: 'Lê Hoàng Nam',
    role: 'Chuyên viên kinh doanh',
    image: student2,
    content:
      'Tôi rất hài lòng với chất lượng khóa học kinh doanh. Nội dung dễ hiểu, có nhiều ví dụ thực tế. Hệ thống học linh hoạt giúp tôi vừa làm việc vừa nâng cao kiến thức.',
    rating: 5
  },
  {
    id: 4,
    name: 'Phạm Thu Trang',
    role: 'Giáo viên tiếng Anh',
    image: student1,
    content:
      'Nền tảng này giúp tôi cải thiện phương pháp giảng dạy đáng kể. Nội dung bài học phong phú, dễ áp dụng và mang lại hiệu quả rõ rệt cho học sinh của tôi.',
    rating: 5
  },
  {
    id: 5,
    name: 'Đỗ Quang Huy',
    role: 'Chuyên viên tài chính',
    image: student4,
    content:
      'Khóa học tài chính cung cấp kiến thức rõ ràng từ cơ bản đến nâng cao. Nội dung thực tế, dễ tiếp cận và giúp tôi hiểu sâu hơn về quản lý tài chính và đầu tư.',
    rating: 5
  },
  {
    id: 6,
    name: 'Võ Hải Lam',
    role: 'Sinh viên năm 3',
    image: student3,
    content:
      'Là sinh viên, tôi thấy nền tảng này rất hữu ích để học thêm kỹ năng ngoài chương trình chính. Nội dung đa dạng, dễ tiếp cận và giúp tôi tự tin hơn khi đi thực tập.',
    rating: 5
  },
]

import HighGlossBackground from '@/components/common/HighGlossBackground'

export const TestimonialsCarousel = ({ className }: { className?: string }) => {
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
    <HighGlossBackground className={`py-16 px-4 md:px-0 ${className}`}>
      <h4 className='font-bold bg-white text-blue-600 p-2 max-w-80 pl-4 md:pl-12 rounded-r-3xl shadow-lg'>
        Học viên nói gì
      </h4>
      <div className='max-w-7xl mx-auto mt-6'>
        <div className='text-center mb-12 animate-fade-in'>
          <p className='text-base md:text-lg text-blue-100/80 max-w-2xl mx-auto font-medium'>
            Hàng nghìn học viên đã tin tưởng và đạt được mục tiêu của mình cùng nền tảng của chúng tôi
          </p>
        </div>

        <div className='relative'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
            {getVisibleTestimonials().map((testimonial, index) => (
              <div
                key={testimonial.id}
                className='animate-fade-in h-full'
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <TestimonialCard {...testimonial} />
              </div>
            ))}
          </div>

          <div className='flex justify-center items-center gap-4'>
            <Button
              variant='outline'
              size='icon'
              onClick={goToPrev}
              className='rounded-full bg-white/10 border-white/20 text-white hover:bg-white hover:text-blue-600 transition-all'
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
                  className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'
                    }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant='outline'
              size='icon'
              onClick={goToNext}
              className='rounded-full bg-white/10 border-white/20 text-white hover:bg-white hover:text-blue-600 transition-all'
            >
              <ChevronRight className='h-5 w-5' />
            </Button>
          </div>
        </div>
      </div>
    </HighGlossBackground>
  )
}
