import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { IoPaperPlane } from 'react-icons/io5'
import { ShoppingCart } from 'lucide-react'
import cartService from '@/services/sale/cart.service'
import { toast } from 'sonner'
import { useCartStore } from '@/stores/useCart.stores'
import './style.scss'
import { Course } from '@/types/course.type'
import { useNavigate } from 'react-router-dom'
import ImageNotFound from '@/assets/images/image-not-found.png'

const CourseCard = ({ course, className }: { course: Course; className?: string }) => {
  const navigate = useNavigate()
  const refresh = useCartStore((s) => s.refresh)

  const handleClick = () => {
    navigate(`/course/${course.id}`)
  }

  const handleAddToCart = async () => {
      try {
        const response = await cartService.addToCart(course.id)
        if (response && response.code === 200) {
          toast.success(response.message || 'Thêm vào giỏ hàng thành công!')
          await refresh()
        } else {
          toast.error(response.message || 'Không thể thêm vào giỏ hàng')
        }
      } catch (error) {
        toast.error('Không thể thêm vào giỏ hàng')
        console.error('Error adding to cart:', error)
      }
    }

  return (
    <>
      <Card className={`p-0 gap-0 course-card group relative ${className}`} onClick={handleClick}>
        <CardHeader className='p-0'>
          <div className='relative'>
            <img
              alt='Course'
              className='h-48 w-full object-cover rounded-2xl'
              src={course.thumbnailUrl || ImageNotFound}
            />

            {/* add-to-cart overlay shown on card hover */}
            <Button
              onClick={async (e) => {
                e.stopPropagation()
                try {
                  const res = await cartService.addToCart(course.id)
                  if (res && res.code === 200) {
                    toast.success(res.message || 'Đã thêm vào giỏ hàng')
                    // refresh cart count if store available
                    useCartStore.getState().refresh()
                  } else {
                    toast.error(res?.message || 'Thêm vào giỏ hàng thất bại')
                  }
                } catch (err: any) {
                  console.error(err)
                  toast.error(err?.message || 'Thêm vào giỏ hàng thất bại')
                }
              }}
              className='hidden group-hover:flex items-center justify-center absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:scale-105 transition-transform'
              aria-label='Thêm vào giỏ hàng'
            >
              <ShoppingCart className='w-4 h-4 text-gray-700' />
            </Button>
          </div>
        </CardHeader>
        <CardContent className='p-4 pt-1'>
          <CardTitle className='text-lg font-bold'>{course.title}</CardTitle>
          <CardDescription className='flex text-sm text-muted-foreground gap-2'>
            <p className='line-through'>{course.originalPrice} VND</p>
            <p className='text-red-500 font-bold'>{course.finalPrice} VND</p>
          </CardDescription>
          <CardDescription className='flex justify-between gap-2 mt-2'>
            <div className='flex items-center gap-2'>
              <Avatar>
                <AvatarImage src={course.instructor.image} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <p>{course.instructor.name}</p>
            </div>
            <Button
              className='rounded-3xl btn-detail bg-primary hover:bg-primary-hover hover:scale-105 transition-transform duration-300 ease-in-out'
              onClick={handleClick}
            >
              <IoPaperPlane />
              Xem chi tiết
            </Button>
          </CardDescription>
        </CardContent>
      </Card>
    </>
  )
}

export default CourseCard
