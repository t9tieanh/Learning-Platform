"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import blog1 from "@/assets/images/blog1.png"
import blog2 from "@/assets/images/blog2.jpg"
import blog3 from "@/assets/images/blog3.jpg"

export const HeroSection = () => {
    const images = [blog1, blog2, blog3]
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length)
        }, 300000)

        return () => clearInterval(interval)
    }, [images.length])

    return (
        <section className="relative w-full">
            <Carousel className="w-fit mx-auto rounded-3xl overflow-hidden h-fit">
                <CarouselContent
                    style={{
                        transform: `translateX(-${currentIndex * 100}%)`,
                        transition: "transform 0.8s ease-in-out",
                        display: "flex",
                    }}
                >
                    {images.map((img, index) => (
                        <CarouselItem key={index} className="flex-shrink-0 w-full h-72">
                            <Card className="border-0 bg-transparent shadow-none">
                                <CardContent className="p-0 bg-transparent">
                                    <img
                                        src={img}
                                        alt={`Hero slide ${index + 1}`}
                                        className="w-full h-72 object-cover rounded-3xl"
                                    />
                                </CardContent>
                            </Card>
                        </CarouselItem>
                    ))}
                </CarouselContent>

                {/* Nút điều hướng */}
                <CarouselPrevious
                    onClick={() =>
                        setCurrentIndex((prev) =>
                            prev === 0 ? images.length - 1 : prev - 1
                        )
                    }
                    className="left-3 bg-white/70 hover:bg-white text-gray-800"
                />
                <CarouselNext
                    onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
                    className="right-3 bg-white/70 hover:bg-white text-gray-800"
                />
            </Carousel>
        </section>
    )
}
