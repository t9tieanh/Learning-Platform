/* eslint-disable react/no-unescaped-entities */
import Cover from '@/components/Course/Cover'
import WhatYouWillLearn from '@/components/Course/WhatYouWillLearn'
import CoursePurchaseBox from '@/components/Course/CoursePurchaseBox'
import CourseContent from '@/components/Course/CourseContent'
import Feedback from '@/components/Course/Feedback'
import courseUserService, { CourseResponse } from '@/services/course/courseuser.service'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useNavigate, useParams } from 'react-router-dom'

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
          console.log('Failed to fetch course details')
          toast.error(response.message || 'Không thể tải chi tiết khóa học')
          navigate('/courses')
        }
      } catch (error) {
        console.log('Error fetching course detail data:', error)
        toast.error('Không thể tải chi tiết khóa học')
        navigate('/courses')
      }
    }

    fetchCourseDetailData()
  }, [])

  console.log('Course Detail:', courseDetail)

  return (
    <div className='course-page bg-white'>
      <Cover
        image={courseDetail?.thumbnailUrl || ''}
        video={courseDetail?.introductoryVideo || ''}
        title={courseDetail?.title || ''}
        shortDescription={courseDetail?.shortDescription || ''}
        teacher={{
          name: courseDetail?.instructor.name || '',
          avatar: courseDetail?.instructor.image || 'https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png'
        }}
      />
      <WhatYouWillLearn learningPoints={courseDetail?.outcomes || []} />
      <div className='grid grid-cols-3 gap-4 bg-white'>
        <div className='col-span-2'>
          <CourseContent />
        </div>
        <div className='col-span-1'>
          <CoursePurchaseBox />
        </div>
      </div>
      <div className='feedback-container w-full py-10 bg-blue-200'>
        <Feedback />
      </div>
    </div>
  )
}

export default Course
