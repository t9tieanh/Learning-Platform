export interface Instructor {
  id: string
  name: string
  email: string
  image: string
}

export interface CourseCart {
  id: string
  title: string
  short_description: string
  long_description: string
  thumbnail_url: string
  rating: number
  introductory_video: string
  language: string
  original_price: number
  final_price: number
  instructor: Instructor
}
