import React, { Component } from 'react'
import CourseSearchBar from '@/components/TC_Courses/CourseSearchBar'
import CoursesTable from '@/components/TC_Courses/CoursesTable'
import CoursePagination from '@/components/TC_Courses/CoursePagination'
import { Course } from '@/components/TC_Courses/CourseTypes'
import AcademySidebar from '@/components/TC_HomePage/AcademySidebar'

interface State {
  courses: Course[]
}

class TC_Course extends Component<Record<string, never>, State> {
  state: State = {
    courses: [
      {
        id: 1,
        title: 'Spring Boot v1',
        tags: ['Java', 'Spring', 'MySQL'],
        duration: '48 giờ 26 phút',
        students: 16,
        createdAt: '04/08/2024',
        image:
          'https://images.shiksha.com/mediadata/ugcDocuments/images/wordpressImages/2022_08_MicrosoftTeams-image-13-2-1.jpg',
        status: 'closed'
      },
      {
        id: 2,
        title: 'React v1',
        tags: ['React', 'Frontend'],
        duration: '30 giờ 26 phút',
        students: 42,
        createdAt: '04/09/2024',
        image:
          'https://images.shiksha.com/mediadata/ugcDocuments/images/wordpressImages/2022_08_MicrosoftTeams-image-13-2-1.jpg',
        status: 'pending'
      },
      {
        id: 3,
        title: 'MongoDB (Mongoose)',
        tags: ['Database', 'NoSQL'],
        duration: '25 giờ 26 phút',
        students: 27,
        createdAt: '12/09/2024',
        image:
          'https://images.shiksha.com/mediadata/ugcDocuments/images/wordpressImages/2022_08_MicrosoftTeams-image-13-2-1.jpg',
        status: 'active'
      }
    ]
  }

  render() {
    const { courses } = this.state

    return (
      <div className='flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-950 transition-colors'>
        {/* Sidebar */}
        <div className='fixed top-0 left-0 h-screen w-64 bg-[#1D1D2A] z-30'>
          <AcademySidebar />
        </div>
        {/* Main content */}
        <div className='flex-1 ml-64 p-6 space-y-6'>
          <CourseSearchBar />
          <CoursesTable courses={courses} />
          <CoursePagination />
        </div>
      </div>
    )
  }
}

export default TC_Course
