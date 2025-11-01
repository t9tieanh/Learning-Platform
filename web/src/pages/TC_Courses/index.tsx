import React, { Component } from 'react'
import CourseSearchBar from '@/components/TC_Courses/CourseSearchBar'
import CoursesTable from '@/components/TC_Courses/CoursesTable'
import CoursePagination from '@/components/TC_Courses/CoursePagination'
import { Course } from '@/components/TC_Courses/CourseTypes'
import AcademySidebar from '@/components/TC_HomePage/AcademySidebar'
import courseService from '@/services/course/course.service'
import { Loader } from '@/components/ui/loader'

interface State {
  courses: Course[]
  page: number
  size: number
  totalPages: number
  totalElements: number
  loading: boolean
  search: string
  statusFilter: '' | 'PUBLISHED' | 'DRAFT' | 'PENDING_REVIEW'
}

class TC_Course extends Component<Record<string, never>, State> {
  state: State = {
    courses: [],
    page: 1,
    size: 5,
    totalPages: 1,
    totalElements: 0,
    loading: false,
    search: '',
    statusFilter: ''
  }

  async componentDidMount() {
    await this.fetchCourses()
  }

  fetchCourses = async (nextPage?: number) => {
    this.setState({ loading: true })
    try {
      const page = nextPage ?? this.state.page
      const res = await courseService.getTeacherCourses(undefined, { page, limit: this.state.size })
      const payload = res.result
      const list = payload?.items as any[] | undefined
      const mapped: Course[] = (list || []).map((c, idx) => ({
        id: String(c.id ?? `temp-${idx}`),
        title: c.title ?? 'Chưa có tiêu đề',
        shortDescription: c.shortDescription ?? null,
        longDescription: c.longDescription ?? null,
        thumbnailUrl: c.thumbnailUrl ?? null,
        language: c.language ?? null,
        originalPrice: c.originalPrice ?? null,
        finalPrice: c.finalPrice ?? null,
        status: (c.status as Course['status']) ?? 'DRAFT',
        instructorId: c.instructorId ?? null,
        chapterIds: c.chapterIds ?? null,
        enrollmentIds: c.enrollmentIds ?? null,
        tagNames: c.tagNames ?? null,
        categoryName: c.categoryName ?? null,
        progressStep: c.progressStep ?? null,
        outcomes: c.outcomes ?? null,
        requirements: c.requirements ?? null,
        image: c.thumbnailUrl ?? undefined,
        tags: c.tagNames ?? undefined,
        duration: undefined,
        students: undefined,
        createdAt: undefined
      }))
      this.setState({
        courses: mapped,
        page: payload?.page ?? page,
        size: payload?.size ?? this.state.size,
        totalPages: payload?.totalPages ?? 1,
        totalElements: payload?.totalElements ?? mapped.length,
        loading: false
      })
    } catch (e) {
      console.error('Failed to load teacher courses', e)
      this.setState({ courses: [], loading: false })
    }
  }

  render() {
    const { courses } = this.state
    const filtered = courses.filter((c) => {
      const matchSearch = this.state.search ? c.title.toLowerCase().includes(this.state.search.toLowerCase()) : true
      const matchStatus = this.state.statusFilter ? c.status === this.state.statusFilter : true
      return matchSearch && matchStatus
    })

    return (
      <div className='flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-950 transition-colors'>
        {/* Sidebar */}
        <div className='fixed top-0 left-0 h-screen w-64 bg-[#1D1D2A] z-30'>
          <AcademySidebar />
        </div>
        {/* Main content */}
        <div className='flex-1 p-6 space-y-6'>
          <CourseSearchBar onSearch={(v) => this.setState({ search: v })} />
          {this.state.loading ? (
            <Loader />
          ) : (
            <CoursesTable
              courses={filtered}
              statusFilter={this.state.statusFilter}
              onChangeStatusFilter={(s) => this.setState({ statusFilter: s as State['statusFilter'] })}
            />
          )}
          <CoursePagination
            pages={this.state.totalPages}
            current={this.state.page}
            onChange={(p) => this.fetchCourses(p)}
          />
        </div>
      </div>
    )
  }
}

export default TC_Course
