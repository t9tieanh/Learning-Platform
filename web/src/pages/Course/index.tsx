/* eslint-disable react/no-unescaped-entities */
import Cover from '@/components/Course/Cover'
import WhatYouWillLearn from '@/components/Course/WhatYouWillLearn'
import CoursePurchaseBox from '@/components/Course/CoursePurchaseBox'
import CourseContent from '@/components/Course/CourseContent'
import Feedback from '@/components/Course/Feedback'
import CourseLoadingSkeleton from '@/components/Course/CourseLoadingSkeleton'
import courseUserService, { CourseResponse } from '@/services/course/course-user.service'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useNavigate, useParams } from 'react-router-dom'
import AvatarNotFound from '@/assets/images/avatar-not-found.png'
import LearnNow from '@/components/Course/LearnNow'

const Course = () => {
  const [courseDetail, setCourseDetail] = useState<CourseResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  useEffect(() => {
    const fetchCourseDetailData = async () => {
      try {
        setIsLoading(true)
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
      } finally {
        setIsLoading(false)
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
  }, [courseDetail, isLoading])

  return (
    <div>
      {isLoading ? (
        <CourseLoadingSkeleton />
      ) : (
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
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 bg-white px-4 md:px-0'>
            <div className='md:col-span-2'>
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
            <div className='col-span-1 md:sticky md:top-4 md:h-fit mt-6 md:mt-0'>
              {courseDetail && courseDetail.purchased !== undefined && courseDetail.purchased ? (
                <LearnNow courseId={courseDetail.id} instructorId={courseDetail?.instructor?.id} />
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
            <div className='feedback-container w-full py-16 md:py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-950 relative overflow-hidden'>
              <div className='absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_-20%,#ffffff,transparent)]' />
              <div className='absolute inset-0 opacity-10 bg-[url("https://www.transparenttextures.com/patterns/cubes.png")]' />
              <div className='absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full -ml-32 -mb-32 blur-3xl' />
              <div className='relative z-10'>
                <Feedback feedbacks={courseDetail?.feedbacks || []} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Course
