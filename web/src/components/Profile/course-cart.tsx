/* eslint-disable react/no-children-prop */
import { StarIcon } from '@radix-ui/react-icons'
import { MessageCircle, Send } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'
import { CourseListItem } from '@/types/course-user'
import CustomButton from '@/components/common/Button'
import { useState } from 'react'
import type { MouseEvent } from 'react'
import CustomDialog from '@/components/common/Dialog'
import AddFeedback from '@/components/Profile/addFeedback'
import { useAuthStore } from '@/stores/useAuth.stores'

const courseCardShell =
  'group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 py-0 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]'

const primaryCtaClass =
  'inline-flex h-10 min-w-[118px] shrink-0 items-center justify-center rounded-full bg-blue-600 px-4 text-xs font-semibold text-white shadow-[0_6px_18px_rgba(37,99,235,0.12)] transition-all duration-200 ease-in-out hover:bg-blue-700 hover:shadow-[0_10px_24px_rgba(37,99,235,0.2)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 active:scale-95'

const secondaryCtaClass =
  'inline-flex h-10 min-w-[118px] shrink-0 items-center justify-center rounded-full bg-slate-100 px-4 text-xs font-semibold text-slate-900 shadow-none transition-all duration-200 ease-in-out hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 active:scale-95'

const CourseCard = ({ courseItem }: { courseItem: CourseListItem }) => {
  const navigate = useNavigate()
  const { data } = useAuthStore()
  const isStudent = data && data.userId !== courseItem.instructor.id
  const progressPct = Math.round((courseItem.progress || 0) * 100)
  const rating = courseItem.rating ?? 0
  const instructorLabel = data && data.userId === courseItem.instructor.id ? 'Bạn' : courseItem.instructor.name

  const handleClick = () => {
    navigate(`/course-page/${courseItem.id}`)
  }

  const [showDialog, setShowDialog] = useState(false)

  const handleAddFeedback = (e: MouseEvent) => {
    e.stopPropagation()
    setShowDialog(true)
  }

  return (
    <>
      <Card className={courseCardShell} onClick={handleClick}>
        <div className='flex flex-col md:flex-row md:items-stretch md:h-[240px]'>
          <div className='relative h-48 w-full shrink-0 overflow-hidden bg-blue-100 md:h-full md:w-[20rem]'>
            <img
              src={courseItem.thumbnailUrl}
              alt={courseItem.title}
              className='h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]'
            />
          </div>

          <div className='flex min-w-0 flex-1 flex-col justify-between gap-3 p-5 md:p-6'>
            <div className='space-y-2'>
              <div>
                <h3 className='line-clamp-2 text-sm font-bold leading-snug text-slate-900 transition-colors duration-200 group-hover:text-blue-600 md:text-base'>
                  {courseItem.title}
                </h3>
                <p className='mt-0.5 line-clamp-2 text-[13px] leading-relaxed text-slate-500'>{courseItem.shortDescription}</p>
              </div>

              {isStudent && <Progress value={progressPct} className='h-1.5 bg-slate-100' />}

              <div className='flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-500'>
                <div className='flex min-w-0 items-center gap-2'>
                  <img
                    src={courseItem.instructor.image}
                    alt={instructorLabel}
                    className='h-6 w-6 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm'
                  />
                  <span className='truncate font-semibold text-slate-700'>{instructorLabel}</span>
                </div>

                <div className='flex items-center gap-1 text-amber-500'>
                  <StarIcon className='h-3.5 w-3.5' />
                  <span className='font-semibold text-slate-700 tabular-nums'>{rating}</span>
                </div>
              </div>
            </div>

            {isStudent && (
              <>
                <div className='h-px w-full bg-slate-100' />
                <div className='flex w-full items-center justify-between gap-4'>
                  <div>
                    <p className='text-lg font-bold tabular-nums text-blue-600'>{progressPct}%</p>
                    <p className='text-[10px] font-medium text-slate-400'>Hoàn thành</p>
                  </div>
                  {(courseItem.progress || 0) > 0.3 ? (
                    <CustomButton
                      onClick={handleAddFeedback}
                      icon={<MessageCircle className='h-3.5 w-3.5' />}
                      iconPosition='right'
                      label='Thêm đánh giá'
                      className={secondaryCtaClass}
                    />
                  ) : (
                    <CustomButton
                      onClick={(e) => {
                        e.stopPropagation()
                        handleClick()
                      }}
                      icon={<Send className='h-3.5 w-3.5' />}
                      iconPosition='right'
                      label='Học ngay'
                      className={primaryCtaClass}
                    />
                  )}
                </div>
              </>
            )}
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
