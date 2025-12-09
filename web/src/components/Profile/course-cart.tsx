/* eslint-disable react/no-children-prop */
import { Star, MessageCircle, Send } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'
import { CourseListItem } from '@/types/course-user'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions } from '@/components/ui/item'
import CustomButton from '@/components/common/Button'
import { useState } from 'react'
import type { MouseEvent } from 'react'
import CustomDialog from '@/components/common/Dialog'
import AddFeedback from '@/components/Profile/addFeedback'

const CourseCard = ({ courseItem }: { courseItem: CourseListItem }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/course-page/${courseItem.id}`)
  }

  // open dialog instead of navigating directly
  const [showDialog, setShowDialog] = useState(false)

  // stop propagation so parent Card onClick won't trigger and open dialog
  const handleAddFeedback = (e: MouseEvent) => {
    e.stopPropagation()
    setShowDialog(true)
  }

  return (
    <>
      <Card
        className='group border border-border/60 bg-card/60 backdrop-blur-sm cursor-pointer hover:shadow-md transition-all duration-300 p-0'
        onClick={handleClick}
      >
        <div className='flex flex-col sm:flex-row items-stretch sm:h-[180px]'>
          <div className='relative w-full sm:w-[280px] h-[180px] flex-shrink-0'>
            <img
              src={courseItem.thumbnailUrl}
              alt={courseItem.title}
              className='absolute inset-0 w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105'
            />
          </div>
          {/* Content dùng Item UI */}
          <div className='flex-1 flex flex-col justify-between p-5'>
            <Item variant='default' size='default' className='p-0'>
              <ItemContent>
                <ItemTitle className='text-base sm:text-lg font-semibold line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-200'>
                  {courseItem.title}
                </ItemTitle>
                <ItemDescription className='text-sm text-muted-foreground/80 line-clamp-2'>
                  {courseItem.shortDescription}
                </ItemDescription>
                <ItemActions className='flex items-center gap-1 mt-2'>
                  <Avatar>
                    <AvatarImage src={courseItem.instructor.image} />
                    <AvatarFallback>{courseItem.instructor.name}</AvatarFallback>
                  </Avatar>
                  <span className='text-xs text-muted-foreground italic'>{courseItem.instructor.name}</span>
                </ItemActions>
                <ItemActions className='flex items-center gap-2 mt-2'>
                  <span className='text-sm font-semibold text-yellow-500'>{courseItem?.rating}</span>
                  <div className='flex items-center gap-0.5'>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < Math.floor(courseItem?.rating || 0)
                            ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm'
                            : 'text-muted-foreground/20'
                        }`}
                      />
                    ))}
                  </div>
                </ItemActions>
              </ItemContent>
            </Item>
          </div>
          <div className='p-5 pt-0 sm:pt-5'>
            <CustomButton
              onClick={handleAddFeedback}
              icon={<MessageCircle size={16} />}
              label='Thêm đánh giá'
              className='w-full mt-2 bg-gray-100 text-black hover:bg-gray-200'
            />
          </div>
        </div>
      </Card>

      <CustomDialog
        open={showDialog}
        setOpen={setShowDialog}
        children={
          <>
            <AddFeedback courseItem={courseItem} onClose={() => setShowDialog(false)} />
          </>
        }
        title={
          <>
            <Send className='w-5 h-5' /> Đánh giá khóa học
          </>
        }
      />
    </>
  )
}

export default CourseCard
