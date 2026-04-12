'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import blog1 from '@/assets/images/blog1.png'
import blog2 from '@/assets/images/blog2.jpg'
import blog3 from '@/assets/images/blog3.jpg'
import learnovaLogo from '@/assets/images/logo1.png'

export const HeroSection = () => {
  const slides = [
    { image: blog1, title: 'Khám phá Learnova', subtitle: 'Nền tảng giáo dục hiện đại' },
    { image: blog2, title: 'Học tập không giới hạn', subtitle: 'Trải nghiệm học tập tối ưu' },
    { image: blog3, title: 'Nâng cao kỹ năng', subtitle: 'Cùng các chuyên gia hàng đầu' }
  ]
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [slides.length])

  return (
    <section className='relative w-full'>
      <Carousel className='w-full mx-auto rounded-3xl overflow-hidden'>
        <CarouselContent
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: 'transform 0.8s ease-in-out',
            display: 'flex'
          }}
        >
          {slides.map((slide, index) => (
            <CarouselItem key={index} className='flex-shrink-0 w-full h-96 md:h-[500px] relative'>
              <Card className='border-0 bg-transparent shadow-none h-full'>
                <CardContent className='p-0 bg-transparent h-full relative'>
                  <img src={slide.image} alt={`Hero slide ${index + 1}`} className='w-full h-full object-cover rounded-3xl' />
                  {/* Gradient overlay */}
                  <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent rounded-3xl' />
                  {/* Logo */}
                  <div className='absolute top-4 md:top-6 left-4 md:left-6 z-10'>
                    <img src={learnovaLogo} alt='Learnova' className='h-8 md:h-10 w-auto object-contain' />
                  </div>
                  {/* Text content */}
                  <div className='absolute inset-0 flex flex-col items-start justify-end p-6 md:p-10 rounded-3xl'>
                    <h2 className='text-2xl md:text-4xl font-bold text-white mb-2 leading-tight'>
                      {slide.title}
                    </h2>
                    <p className='text-sm md:text-base text-white/90'>{slide.subtitle}</p>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious
          onClick={() => setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
          className='left-3 md:left-6 bg-white/70 hover:bg-white text-gray-800'
        />
        <CarouselNext
          onClick={() => setCurrentIndex((prev) => (prev + 1) % slides.length)}
          className='right-3 md:right-6 bg-white/70 hover:bg-white text-gray-800'
        />
      </Carousel>
    </section>
  )
}
