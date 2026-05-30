import React, { Component, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CourseSearchBar from '@/components/TC_Courses/CourseSearchBar'
import CoursesTable from '@/components/TC_Courses/CoursesTable'
import CoursePagination from '@/components/TC_Courses/CoursePagination'
import { Course } from '@/components/TC_Courses/CourseTypes'
import courseService from '@/services/course/course.service'
import CoursesTableSkeleton from '@/components/TC_Courses/CoursesTableSkeleton'

interface TC_CourseProps {
  createModalOpen: boolean
  onCreateModalOpenChange: (open: boolean) => void
}

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

class TC_Course extends Component<TC_CourseProps, State> {
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

  handleCreateModalOpenChange = (open: boolean) => {
    this.props.onCreateModalOpenChange(open)
  }

  async componentDidMount() {
    await this.fetchCourses()
  }

  fetchCourses = async (nextPage?: number) => {
    this.setState({ loading: true })
    try {
      const page = nextPage ?? this.state.page
      const res = await courseService.getTeacherCourses({ page, limit: this.state.size })
      const payload = res.result
      const list = payload?.items as any[] | undefined
      const mapped: Course[] = (list || []).map((c, idx) => this.mapApiItemToCourse(c, idx))
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

  mapApiItemToCourse = (c: any, idx: number): Course => ({
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
    createdAt: c.createdAt != null ? new Date(c.createdAt).toLocaleDateString() : undefined
  })

  handleCourseCreated = (course: Course) => {
    this.props.onCreateModalOpenChange(false)
    this.setState(
      (prev) => {
        const totalElements = prev.totalElements + 1
        const totalPages = Math.max(1, Math.ceil(totalElements / prev.size))
        if (prev.page === 1) {
          return {
            courses: [course, ...prev.courses].slice(0, prev.size),
            totalElements,
            totalPages,
            page: 1
          }
        }
        return {
          page: 1,
          totalElements,
          totalPages
        }
      },
      () => {
        if (this.state.page === 1 && this.state.courses[0]?.id === course.id) {
          return
        }
        void this.fetchCourses(1)
      }
    )
  }

  render() {
    const { courses } = this.state
    const { createModalOpen } = this.props
    const filtered = courses.filter((c) => {
      const matchSearch = this.state.search ? c.title.toLowerCase().includes(this.state.search.toLowerCase()) : true
      const matchStatus = this.state.statusFilter ? c.status === this.state.statusFilter : true
      return matchSearch && matchStatus
    })

    return (
      <div className='relative min-h-[calc(100vh-100px)] px-4 pb-6 pt-16 sm:px-6 lg:px-8 lg:pt-6'>
        <div className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-r from-cyan-50 via-blue-50/70 to-indigo-50 blur-3xl' />

        <div className='mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6'>
          <CourseSearchBar
            onSearch={(v) => this.setState({ search: v })}
            onCourseCreated={this.handleCourseCreated}
            createModalOpen={createModalOpen}
            onCreateModalOpenChange={this.handleCreateModalOpenChange}
          />

          {this.state.loading ? (
            <CoursesTableSkeleton />
          ) : (
            <CoursesTable
              courses={filtered}
              statusFilter={this.state.statusFilter}
              onChangeStatusFilter={(s) => this.setState({ statusFilter: s as State['statusFilter'] })}
              fetchCourses={this.fetchCourses}
              onRequestCreate={() => this.props.onCreateModalOpenChange(true)}
            />
          )}

          {courses.length > 0 && (
            <div className='mt-2 border-t border-slate-200/70 pt-5'>
              <CoursePagination
                pages={this.state.totalPages}
                current={this.state.page}
                onChange={(p) => this.fetchCourses(p)}
              />
            </div>
          )}
        </div>
      </div>
    )
  }
}

/** Bọc ngoài: đọc ?openCreate=true (modal quảng cáo) và mở modal tạo khóa học, đồng bộ URL với React Router */
const TC_CoursePage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [createModalOpen, setCreateModalOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    return new URLSearchParams(window.location.search).get('openCreate') === 'true'
  })

  useEffect(() => {
    if (searchParams.get('openCreate') !== 'true') return
    setCreateModalOpen(true)
    const next = new URLSearchParams(searchParams)
    next.delete('openCreate')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  return (
    <TC_Course createModalOpen={createModalOpen} onCreateModalOpenChange={setCreateModalOpen} />
  )
}

export default TC_CoursePage
