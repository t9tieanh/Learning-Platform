/* eslint-disable react/no-unescaped-entities */
import Cover from '@/components/Course/Cover'
import WhatYouWillLearn from '@/components/Course/WhatYouWillLearn'
import CoursePurchaseBox from '@/components/Course/CoursePurchaseBox'
import CourseContent from '@/components/Course/CourseContent'
import Feedback from '@/components/Course/Feedback'
import courseUserService, { CourseResponse } from '@/services/course/course-user.service'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useNavigate, useParams } from 'react-router-dom'
import AvatarNotFound from '@/assets/images/avatar-not-found.png'
import LearnNow from '@/components/Course/LearnNow'

const Course = () => {
  const [courseDetail, setCourseDetail] = useState<CourseResponse | null>(null)
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  useEffect(() => {
    const fetchCourseDetailData = async () => {
      try {
        const response = await courseUserService.getCourseDetails(id as string)
        if (response && response.code === 200 && response.result) {
          setCourseDetail(response.result)
        } else {
          toast.error(response.message || 'Không thể tải chi tiết khóa học')
          navigate('/courses')
        }
      } catch (error) {
        toast.error('Không thể tải chi tiết khóa học')
        navigate('/courses')
      }
    }

    fetchCourseDetailData()
  }, [id, navigate])

  // show a compact top header with course title when cover scrolls out of view
  const [showSmallHeader, setShowSmallHeader] = useState(false)
  useEffect(() => {
    const el = document.querySelector('.cover-container')
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setShowSmallHeader(!entry.isIntersecting)
        })
      },
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [courseDetail?.id])

  return (
    <div className='course-page bg-white'>
      <Cover
        showSmallHeader={showSmallHeader}
        image={courseDetail?.thumbnailUrl || ''}
        video={courseDetail?.introductoryVideo || ''}
        title={courseDetail?.title || ''}
        shortDescription={courseDetail?.shortDescription || ''}
        teacher={{
          name: courseDetail?.instructor.name || '',
          avatar: courseDetail?.instructor.image || AvatarNotFound
        }}
        tags={courseDetail?.tags || []}
      />
      <WhatYouWillLearn learningPoints={courseDetail?.outcomes || []} />
      <div className='grid grid-cols-3 gap-4 bg-white'>
        <div className='col-span-2'>
          <CourseContent
            requirements={courseDetail?.requirements || []}
            sections={courseDetail?.chapters || []}
            content={courseDetail?.longDescription || ''}
            instructor={
              courseDetail?.instructor as unknown as {
                id: string
                name: string
                image: string
                phone: string
                description: string
                email: string
                username: string | null
                numCourse: number
                expertise: {
                  id: string
                  name: string
                  image: string
                }[]
              }
            }
          />
        </div>
        <div className='col-span-1'>
          {courseDetail && courseDetail.purchased !== undefined && courseDetail.purchased ? (
            <LearnNow courseId={courseDetail.id} />
          ) : (
            <>
              <CoursePurchaseBox
                originalPrice={courseDetail?.originalPrice || 0}
                finalPrice={courseDetail?.finalPrice || 0}
                courseId={courseDetail?.id || ''}
              />
            </>
          )}
        </div>
      </div>
      {courseDetail?.feedbacks && courseDetail.feedbacks.length > 0 && (
        <div className='feedback-container w-full py-10 bg-[#0C356A]'>
          <Feedback feedbacks={courseDetail?.feedbacks || []} />
        </div>
      )}
    </div>
  )
}

export default Course
