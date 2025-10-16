/* eslint-disable react/no-children-prop */
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, ChevronDown, ChevronRight, Play, FileText, HelpCircle, GripVertical, Trash2 } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import TitleComponent from '@/components/TC_CreateCourse/common/Title'

interface Lecture {
  id: string
  title: string
  type: 'video' | 'article' | 'quiz'
  duration?: string
  completed: boolean
  fileName?: string
}

interface Section {
  id: string
  title: string
  lectures: Lecture[]
  isOpen: boolean
}

const CurriculumForm = () => {
  const [sections, setSections] = useState<Section[]>([
    {
      id: '1',
      title: 'Giới thiệu',
      isOpen: true,
      lectures: [
        { id: '1', title: 'Chào mừng đến với khóa học', type: 'video', duration: '2:30', completed: false },
        { id: '2', title: 'Tổng quan khóa học', type: 'video', duration: '5:15', completed: false }
      ]
    }
  ])

  const addSection = () => {
    const newSection: Section = {
      id: Date.now().toString(),
      title: 'Phần mới',
      isOpen: true,
      lectures: []
    }
    setSections([...sections, newSection])
  }

  const addLecture = (sectionId: string, type: 'video' | 'article' | 'quiz') => {
    const newLecture: Lecture = {
      id: Date.now().toString(),
      title: '',
      type,
      completed: false,
      duration: type === 'video' ? '00:00' : undefined
    }

    setSections(
      sections.map((section) =>
        section.id === sectionId ? { ...section, lectures: [...section.lectures, newLecture] } : section
      )
    )
  }

  const toggleSection = (sectionId: string) => {
    setSections(
      sections.map((section) => (section.id === sectionId ? { ...section, isOpen: !section.isOpen } : section))
    )
  }

  const updateSectionTitle = (sectionId: string, title: string) => {
    setSections(sections.map((section) => (section.id === sectionId ? { ...section, title } : section)))
  }

  const updateLectureTitle = (sectionId: string, lectureId: string, title: string) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              lectures: section.lectures.map((lecture) => (lecture.id === lectureId ? { ...lecture, title } : lecture))
            }
          : section
      )
    )
  }

  const deleteLecture = (sectionId: string, lectureId: string) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              lectures: section.lectures.filter((lecture) => lecture.id !== lectureId)
            }
          : section
      )
    )
  }

  const deleteSection = (sectionId: string) => {
    setSections(sections.filter((section) => section.id !== sectionId))
  }

  const getLectureIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className='h-4 w-4' />
      case 'article':
        return <FileText className='h-4 w-4' />
      case 'quiz':
        return <HelpCircle className='h-4 w-4' />
      default:
        return <Play className='h-4 w-4' />
    }
  }

  const getTotalStats = () => {
    const totalLectures = sections.reduce((acc, section) => acc + section.lectures.length, 0)
    const totalDuration = sections.reduce(
      (acc, section) =>
        acc +
        section.lectures.reduce((secAcc, lecture) => {
          if (lecture.duration) {
            const [min, sec] = lecture.duration.split(':').map(Number)
            return secAcc + min * 60 + sec
          }
          return secAcc
        }, 0),
      0
    )

    const hours = Math.floor(totalDuration / 3600)
    const minutes = Math.floor((totalDuration % 3600) / 60)

    return { totalLectures, totalDuration: `${hours}h ${minutes}m` }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, sectionId: string, lectureId: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSections(
        sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                lectures: section.lectures.map((lecture) =>
                  lecture.id === lectureId
                    ? { ...lecture, fileName: file.name, title: lecture.title || file.name }
                    : lecture
                )
              }
            : section
        )
      )
    }
  }

  const stats = getTotalStats()

  return (
    <div className='max-w-6xl space-y-8 mx-auto'>
      <TitleComponent
        title='Chương trình học'
        description='Bắt đầu xây dựng khóa học bằng cách tạo các phần, bài giảng và hoạt động thực hành (quiz, bài tập, bài viết). Hãy sắp xếp nội dung rõ ràng, tổng thời lượng video miễn phí phải dưới 2 giờ.'
        children={
          <>
            <div className='flex space-x-6 mt-2 text-sm'>
              <div className='flex items-center space-x-2'>
                <span className='font-medium'>{sections.length}</span>
                <span className='text-blue-300'>phần</span>
              </div>
              <div className='flex items-center space-x-2'>
                <span className='font-medium'>{stats.totalLectures}</span>
                <span className='text-blue-300'>bài giảng</span>
              </div>
              <div className='flex items-center space-x-2'>
                <span className='font-medium'>{stats.totalDuration}</span>
                <span className='text-blue-300'>tổng thời lượng</span>
              </div>
            </div>
          </>
        }
      />

      <Card className='border border-blue-200/60 shadow-sm bg-white'>
        <CardHeader>
          <CardTitle className='text-lg font-semibold text-gray-800'>Nội dung khóa học</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {sections.map((section, sectionIndex) => (
            <div key={section.id} className='border border-blue-200 rounded-xl shadow-sm'>
              <Collapsible open={section.isOpen} onOpenChange={() => toggleSection(section.id)}>
                <CollapsibleTrigger className='w-full'>
                  <div className='flex items-center justify-between p-4 hover:bg-blue-100/50 border-b border-blue-200 rounded-t-xl'>
                    <div className='flex items-center space-x-3'>
                      <GripVertical className='h-4 w-4 text-blue-400' />
                      {section.isOpen ? (
                        <ChevronDown className='h-4 w-4 text-blue-500' />
                      ) : (
                        <ChevronRight className='h-4 w-4 text-blue-500' />
                      )}
                      <div className='flex items-center space-x-2'>
                        <span className='font-medium text-gray-800'>Phần {sectionIndex + 1}:</span>
                        <Input
                          value={section.title}
                          onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                          className='border-0 p-0 h-auto font-medium bg-transparent focus-visible:ring-0 text-gray-800'
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Badge variant='outline' className='border-blue-300 text-blue-600 bg-blue-50'>
                        {section.lectures.length} bài
                      </Badge>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='text-red-500 hover:bg-red-50'
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteSection(section.id)
                        }}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className='px-4 pb-4 space-y-2'>
                    {section.lectures.map((lecture) => (
                      <div
                        key={lecture.id}
                        className='flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200'
                      >
                        <GripVertical className='h-4 w-4 text-blue-400' />
                        {getLectureIcon(lecture.type)}
                        <div className='flex-1'>
                          <Input
                            placeholder='Nhập tiêu đề bài giảng...'
                            value={lecture.title}
                            onChange={(e) => updateLectureTitle(section.id, lecture.id, e.target.value)}
                            className='border-0 p-0 h-auto bg-transparent focus-visible:ring-0 text-gray-800'
                          />
                          {lecture.type === 'video' && lecture.fileName && (
                            <span className='text-xs text-gray-500'>Đã chọn: {lecture.fileName}</span>
                          )}
                        </div>
                        <div className='flex items-center space-x-2'>
                          <Badge variant='secondary' className='capitalize bg-blue-100 text-blue-700'>
                            {lecture.type === 'video' ? 'Video' : lecture.type === 'article' ? 'Bài viết' : 'Quiz'}
                          </Badge>
                          {lecture.duration && <span className='text-sm text-gray-500'>{lecture.duration}</span>}
                          {lecture.type === 'video' && (
                            <>
                              <input
                                type='file'
                                accept='video/*'
                                id={`upload-${lecture.id}`}
                                className='hidden'
                                onChange={(e) => handleFileSelect(e, section.id, lecture.id)}
                              />
                              <Button asChild variant='outline' size='sm' className='border-blue-300 text-blue-600'>
                                <label htmlFor={`upload-${lecture.id}`} className='cursor-pointer'>
                                  Thêm video
                                </label>
                              </Button>
                            </>
                          )}
                          <Button
                            variant='ghost'
                            size='icon'
                            className='text-red-500 hover:bg-red-50'
                            onClick={() => deleteLecture(section.id, lecture.id)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className='flex space-x-2 mt-4'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => addLecture(section.id, 'video')}
                        className='flex items-center space-x-1 border-blue-300 text-blue-600'
                      >
                        <Plus className='h-4 w-4' />
                        <span>Bài giảng (Video)</span>
                      </Button>

                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => addLecture(section.id, 'quiz')}
                        className='flex items-center space-x-1 border-blue-300 text-blue-600'
                      >
                        <Plus className='h-4 w-4' />
                        <span>Quiz</span>
                      </Button>

                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => addLecture(section.id, 'article')}
                        className='flex items-center space-x-1 border-blue-300 text-blue-600'
                      >
                        <Plus className='h-4 w-4' />
                        <span>Bài viết</span>
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}

          <Button
            variant='outline'
            onClick={addSection}
            className='w-full border-dashed border-2 border-blue-300 py-8 rounded-xl text-blue-600 hover:bg-blue-50'
          >
            <Plus className='h-4 w-4 mr-2' />
            Thêm phần
          </Button>
        </CardContent>
      </Card>

      <div className='flex justify-between pt-6 border-t'>
        <Button variant='outline'>Quay lại</Button>
        <div className='space-x-3'>
          <Button variant='outline'>Lưu nháp</Button>
          <Button className='bg-primary hover:bg-primary/90'>Tiếp tục</Button>
        </div>
      </div>
    </div>
  )
}

export default CurriculumForm
