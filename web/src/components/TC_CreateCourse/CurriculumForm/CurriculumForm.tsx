/* eslint-disable react/no-children-prop */
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import TitleComponent from '@/components/TC_CreateCourse/common/Title'
import { Chapter } from '@/utils/create-course/curriculum'
import ChapterForm from './ChapterForm'

const CurriculumForm = () => {
  const [Chapters, setChapters] = useState<Chapter[]>([
    {
      id: 'ch1',
      title: 'Giới thiệu về lập trình web',
      isOpen: true,
      description: 'Tổng quan về web và các công nghệ nền tảng.',
      position: 1,
      lessons: [
        {
          id: 'l1',
          title: 'Cách web hoạt động',
          content: 'Giới thiệu client, server, và giao thức HTTP.',
          position: 1,
          isPublic: true,
          duration: '09:45',
          url: 'https://example.com/video/how-web-works',
          type: 'video'
        },
        {
          id: 'l2',
          title: 'HTML, CSS, và JavaScript là gì?',
          content: 'Tìm hiểu ba thành phần chính của front-end.',
          position: 2,
          isPublic: true,
          type: 'article'
        },
        {
          id: 'l3',
          title: 'Cài đặt môi trường phát triển',
          content: 'Cài đặt VSCode, Node.js và tiện ích mở rộng hữu ích.',
          position: 3,
          isPublic: false,
          duration: '07:58',
          url: 'https://example.com/video/setup-env',
          type: 'video'
        }
      ]
    },
    {
      id: 'ch2',
      title: 'JavaScript cơ bản',
      isOpen: false,
      description: 'Làm quen với cú pháp, biến, hàm và vòng lặp trong JS.',
      position: 2,
      lessons: [
        {
          id: 'l4',
          title: 'Biến và kiểu dữ liệu',
          content: 'Phân biệt let, const, var và các kiểu dữ liệu cơ bản.',
          position: 1,
          isPublic: true,
          duration: '12:30',
          url: 'https://example.com/video/js-variables',
          type: 'video'
        },
        {
          id: 'l5',
          title: 'Cấu trúc điều khiển',
          content: 'Câu lệnh if, switch, vòng lặp for, while và do-while.',
          position: 2,
          isPublic: false,
          type: 'article'
        },
        {
          id: 'l6',
          title: 'Hàm và phạm vi',
          content: 'Cách định nghĩa hàm, closure và hoisting.',
          position: 3,
          isPublic: true,
          duration: '10:22',
          url: 'https://example.com/video/js-functions',
          type: 'video'
        }
      ]
    }
  ])

  const addChapter = () => {
    const newChapter: Chapter = {
      id: Date.now().toString(),
      title: 'Phần mới',
      isOpen: true,
      position: Chapters.length + 1,
      lessons: []
    }
    setChapters([...Chapters, newChapter])
  }

  const getTotalStats = () => {
    const totallessons = Chapters.reduce((acc, Chapter) => acc + Chapter.lessons.length, 0)
    const totalDuration = Chapters.reduce(
      (acc, Chapter) =>
        acc +
        Chapter.lessons.reduce((secAcc, lecture) => {
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

    return { totallessons, totalDuration: `${hours}h ${minutes}m` }
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
                <span className='font-medium'>{Chapters.length}</span>
                <span className='text-blue-300'>phần</span>
              </div>
              <div className='flex items-center space-x-2'>
                <span className='font-medium'>{stats.totallessons}</span>
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
          {Chapters.map((Chapter, ChapterIndex) => (
            <>
              <ChapterForm key={Chapter.id} chapter={Chapter} setChapters={setChapters} />
            </>
          ))}

          <Button
            variant='outline'
            onClick={addChapter}
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
