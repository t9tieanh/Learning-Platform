/* eslint-disable react/no-children-prop */
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Upload, RotateCw, X } from 'lucide-react'
import TitleComponent from '@/components/TC_CreateCourse/common/Title'
import { Chapter, CreationLessonFormValues } from '@/utils/create-course/curriculum'
import ChapterForm from './ChapterForm'
import chapterService from '@/services/course/chapter.service'
import { toast } from 'sonner'
import UploadProgress from './UploadProgress'
import useMultiUpload from '@/hooks/useMultiUpload'
import { useAuthStore } from '@/stores/useAuth.stores'
import CustomButton from '@/components/common/Button'
import CurriculumFormSkeleton from './Skeleton/CurriculumFormSkeleton'

export type HandleAddLesson = (
  selectedFile: File,
  chapterId: string,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
  uri: string
) => (newVideo: CreationLessonFormValues) => Promise<void>

const CurriculumForm: React.FC<{ id: string }> = ({ id }: { id: string }) => {
  const [Chapters, setChapters] = useState<Chapter[]>([])

  const { data } = useAuthStore()
  const token = data?.accessToken

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChapters()
  }, [id])

  // fetch chapters when component mounts or id changes
  const fetchChapters = async () => {
    if (!id) return

    if (Chapters.length === 0) {
      setLoading(true)
    }

    try {
      const response = await chapterService.getChaptersByCourseId(id)
      if (response && response.code === 200 && response.result) {
        const newChapters = response.result
        setChapters((prev) => {
          const openChapterIds = new Set(prev.filter((ch) => ch.isOpen).map((ch) => ch.id))
          return newChapters.map((ch: Chapter, index: number) => ({
            ...ch,
            isOpen: openChapterIds.size > 0 ? openChapterIds.has(ch.id) : index === 0
          }))
        })
      }
    } catch (error) {
      console.log('Error fetching chapters:', error)
    } finally {
      setLoading(false)
    }
  }

  // hook must be called at top level of component
  const { uploads, startUpload } = useMultiUpload({
    accessToken: token,
    callback: fetchChapters
  })
  const [showUpload, setShowUpload] = useState(true)
  const isAnyUploading = uploads.some((u) => u.status === 'uploading')

  const handleAddChapter = async () => {
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
        const dur = lecture.duration
        if (!dur) return secAcc

        if (typeof dur === 'number') return secAcc + dur
        if (typeof dur === 'string') {
          const parts = dur.split(':').map(Number).reverse()
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

  // Handle form submission for save lesson
  const handleAddLesson: HandleAddLesson = (
    selectedFile: File,
    chapterId: string,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
    uri: string
  ) => {
    return async (newVideo: CreationLessonFormValues) => {
      if (!selectedFile) {
        toast.error('Vui lòng chọn file video trước khi lưu bài giảng')
        return
      }

      // FormData cho cả video và lesson metadata
      const formData = new FormData()
      formData.append(
        'lesson',
        new Blob(
          [
            JSON.stringify({
              title: newVideo.title,
              content: newVideo.content,
              isPublic: newVideo.isPublic,
              duration: newVideo.duration,
              chapterId: chapterId
            })
          ],
          { type: 'application/json' }
        )
      )

      try {
        startUpload(selectedFile, formData, newVideo.title, uri)
        // Close the modal add video -> start upload video
        setOpen(false)
      } catch (err) {
        console.error(err)
      }
    }
  }

  if (loading) {
    return <CurriculumFormSkeleton />
  }

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

      {/* Floating Upload Button */}
      {uploads && (
        <>
          <div className="fixed z-50 bottom-8 right-8">
            {isAnyUploading && (
              <div className="absolute -inset-2 rounded-full border-4 border-blue-400/30 border-t-blue-600 animate-spin" />
            )}
            <CustomButton
              className={cn(
                'shadow-lg bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full w-14 h-14 flex items-center justify-center transition-all relative',
                !isAnyUploading && 'hover:scale-105'
              )}
              onClick={() => setShowUpload(true)}
              style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)' }}
              title='Xem tiến độ tải lên'
              label={
                <>
                  <Upload className={cn('w-7 h-7 text-white', isAnyUploading && 'animate-bounce')} />
                  <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 border-2 border-white'>
                    {uploads.length}
                  </span>
                </>
              }
            />
          </div>

          {showUpload && (
            <div className='fixed z-50 bottom-24 right-8 w-[400px] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300'>
              <div className='flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-blue-50 rounded-full ring-1 ring-blue-100'>
                    <Upload className='h-4 w-4 text-blue-600' />
                  </div>
                  <div>
                    <h4 className='text-sm font-semibold text-gray-800'>Trình quản lý tải lên</h4>
                    <p className='text-xs text-gray-500 font-medium'>
                      {uploads.filter((u) => u.status === 'uploading').length} đang xử lý
                    </p>
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors'
                  onClick={() => setShowUpload(false)}
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>

              <div className='max-h-[320px] overflow-y-auto p-3 bg-gray-50/30 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent'>
                <div className='flex flex-col gap-2'>
                  <UploadProgress progressLst={uploads} />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <Card className='border border-blue-200/60 shadow-lg bg-white'>
        <CardHeader className='flex flex-row items-center justify-between pb-0'>
          <CardTitle className='text-lg font-semibold text-gray-800'>
            <span>Nội dung khóa học</span>
          </CardTitle>
          <Button variant='ghost' size='icon' onClick={fetchChapters} title='Tải lại'>
            <RotateCw className='h-4 w-4' />
          </Button>
        </CardHeader>
        <CardContent className='space-y-4'>
          {Chapters?.map((chapter) => (
            <ChapterForm
              key={chapter.id}
              chapter={chapter}
              setChapters={setChapters}
              handleAddLesson={handleAddLesson}
              uploads={uploads}
              startUpload={startUpload}
              fetchChapters={fetchChapters}
            />
          ))}

          <Button
            variant='outline'
            onClick={handleAddChapter}
            className='w-full border-dashed border-2 border-blue-300 py-8 rounded-xl text-blue-600 hover:bg-blue-50'
          >
            <Plus className='h-4 w-4 mr-2' />
            Thêm chương
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default CurriculumForm
