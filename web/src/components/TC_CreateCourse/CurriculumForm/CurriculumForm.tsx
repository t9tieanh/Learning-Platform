/* eslint-disable react/no-children-prop */
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import TitleComponent from '@/components/TC_CreateCourse/common/Title'
import { Chapter } from '@/utils/create-course/curriculum'
import ChapterForm from './ChapterForm'
import chapterService from '@/services/course/chapter.service'
import { toast } from 'react-toastify'

const CurriculumForm: React.FC<{ id: string }> = ({ id }: { id: string }) => {
  const [Chapters, setChapters] = useState<Chapter[]>([])

  useEffect(() => {
    const fetchChapters = async () => {
      if (!id) return
      try {
        const response = await chapterService.getChaptersByCourseId(id)
        if (response && response.code === 200 && response.result) {
          setChapters(response.result)
        }
      } catch (error) {
        console.log('Error fetching chapters:', error)
      }
    }
    fetchChapters()
  }, [id])

  const addChapter = async () => {
    const data = await chapterService.addChapter({
      courseId: id,
      title: 'Phần mới',
      position: Chapters.length + 1
    })
    if (!data || data.code !== 200 || !data.result) {
      toast.error(data?.message || 'Có lỗi xảy ra, vui lòng thử lại')
      return
    }

    const result = data.result!

    setChapters((prev) => [
      ...prev,
      {
        id: result.id,
        title: 'Phần mới',
        position: prev.length + 1,
        lessons: [],
        isOpen: true
      }
    ])
  }

  const getTotalStats = () => {
    const totallessons = (Chapters || []).reduce((acc, chap) => acc + (chap.lessons?.length || 0), 0)

    const totalSeconds = (Chapters || []).reduce((acc, chap) => {
      const chapterSeconds = (chap.lessons || []).reduce((secAcc, lecture) => {
        // lecture.duration may be number (seconds) or string ("mm:ss" or "hh:mm:ss")
        const dur = lecture.duration
        if (typeof dur === 'number') return secAcc + dur
        if (typeof dur === 'string') {
          const parts = dur.split(':').map(Number).reverse() // sec, min, hour
          let seconds = 0
          if (parts[0]) seconds += parts[0]
          if (parts[1]) seconds += parts[1] * 60
          if (parts[2]) seconds += parts[2] * 3600
          return secAcc + seconds
        }
        return secAcc
      }, 0)
      return acc + chapterSeconds
    }, 0)

    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)

    const totalDuration = `${hours}h ${minutes}m`

    return { totallessons, totalDuration, totalSeconds }
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
          {Chapters?.map((Chapter) => (
            <ChapterForm key={Chapter.id} chapter={Chapter} setChapters={setChapters} />
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
