import CustomDialog from '@/components/common/Dialog'
import { Play, BookOpenCheck, FileText, HelpCircle, Edit2, X, Save } from 'lucide-react'
import { Lesson } from '@/utils/create-course/curriculum'
import { useState } from 'react'
import CustomInput from '@/components/common/Input'
import QuillEditor from '@/components/common/Input/QuillEditor'
import CustomButton from '@/components/common/Button'
import CustomCheckbox from '@/components/common/CustomCheckbox'
import lessonService from '@/services/course/lesson.service'
import { toast } from 'sonner'
import formatDuration from '@/utils/time/formatDuration.utils'

const PreviewTeacherLesson = ({
  preview,
  setPreview
}: {
  preview: {
    openPreview: boolean
    lesson: Lesson | null
  }
  setPreview: any
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editIsPublic, setEditIsPublic] = useState(false)

  if (!preview.lesson) return null

  const lesson = preview.lesson
  const isVideo = lesson.type === 'video'
  const isArticle = lesson.type === 'article'

  // Initialize edit state when opening dialog
  const handleOpenEdit = () => {
    setEditTitle(lesson.title)
    setEditContent(lesson.content || '')
    setEditIsPublic(lesson.isPublic)
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      toast.error('Tiêu đề không được để trống')
      return
    }

    try {
      const result = await lessonService.updateMetaLesson({
        id: lesson.id,
        title: editTitle,
        content: editContent,
        isPublic: editIsPublic
      })

      if (result && result.code === 200) {
        toast.success('Cập nhật thông tin bài giảng thành công')
        setPreview((prev: any) => ({
          ...prev,
          lesson: {
            ...prev.lesson,
            title: editTitle,
            content: editContent,
            isPublic: editIsPublic
          }
        }))
        setIsEditing(false)
      } else {
        toast.error(result?.message || 'Cập nhật thất bại. Vui lòng thử lại')
      }
    } catch (error) {
      toast.error('Cập nhật thất bại. Vui lòng thử lại')
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const getLessonIcon = () => {
    switch (lesson.type) {
      case 'video':
        return <Play className='w-4 h-4 mr-2' />
      case 'article':
        return <FileText className='w-4 h-4 mr-2' />
      default:
        return <HelpCircle className='w-4 h-4 mr-2' />
    }
  }

  const getLessonTypeLabel = () => {
    switch (lesson.type) {
      case 'video':
        return 'Video'
      case 'article':
        return 'Bài viết'
      default:
        return 'Khác'
    }
  }

  return (
    <CustomDialog
      className='bg-[#0C356A] border-none text-white'
      open={preview.openPreview}
      setOpen={(v: boolean) => {
        setPreview((prev: any) => ({
          ...prev,
          openPreview: v
        }))
      }}
      title={
        <>
          {getLessonIcon()}
          Xem chi tiết bài học
        </>
      }
      size='xl'
    >
      <div className='preview-content p-3 flex gap-6'>
        {/* Left Side - Content (Video/Article/PDF) */}
        <div className='flex-1'>
          {/* Video Preview */}
          {isVideo && lesson.url && (
            <div className='w-full'>
              <p className='text-xs font-medium text-gray-300 uppercase mb-2'>Video</p>
              <video
                src={`https://${lesson.url}` || undefined}
                controls
                className='w-full h-[480px] rounded-md bg-black'
              >
                <track kind='captions' srcLang='en' label='English captions' src={`${lesson.url || ''}.vtt`} />
              </video>
            </div>
          )}

          {/* Article/PDF Preview */}
          {isArticle && lesson.url && (
            <div className='w-full'>
              <p className='text-xs font-medium text-gray-300 uppercase mb-2'>Nội dung bài viết</p>
              <iframe
                src={`https://${lesson.url}`}
                className='w-full h-[600px] rounded-md bg-white'
                title='Article Content'
              />
            </div>
          )}

          {/* No Content */}
          {!isVideo && !isArticle && !lesson.url && (
            <div className='text-sm text-gray-400 italic'>Bài học này chưa có nội dung</div>
          )}
        </div>

        {/* Right Side - Information */}
        <div className='w-96 space-y-4 flex-shrink-0'>
          {!isEditing ? (
            <>
              {/* View Mode */}
              <div className='flex items-center justify-between'>
                <h3 className='text-sm font-semibold text-white'>Thông tin chi tiết</h3>
                <button
                  onClick={handleOpenEdit}
                  className='p-1 rounded-md bg-blue-500 hover:bg-blue-600 transition'
                  title='Sửa thông tin'
                >
                  <Edit2 className='w-4 h-4 text-white' />
                </button>
              </div>

              {/* Lesson Title */}
              <div className='flex items-start gap-3'>
                <BookOpenCheck className='w-5 h-5 mt-1 text-[#66D2CE] flex-shrink-0' />
                <div className='flex-1'>
                  <p className='text-xs font-medium text-gray-300 uppercase'>Tiêu đề</p>
                  <p className='text-white text-sm font-semibold mt-1 line-clamp-3'>{lesson.title}</p>
                </div>
              </div>

              <hr className='border-gray-600' />

              {/* Lesson Type & Duration */}
              <div className='space-y-3'>
                <div>
                  <p className='text-xs font-medium text-gray-300 uppercase'>Loại nội dung</p>
                  <p className='text-white text-sm font-medium mt-1'>{getLessonTypeLabel()}</p>
                </div>
                {lesson.duration && (
                  <div>
                    <p className='text-xs font-medium text-gray-300 uppercase'>Thời lượng</p>
                    <p className='text-white text-sm font-medium mt-1'>
                      {formatDuration(Number(lesson.duration)) || 0}
                    </p>
                  </div>
                )}
              </div>

              <hr className='border-gray-600' />

              {/* Lesson Status */}
              <div>
                <p className='text-xs font-medium text-gray-300 uppercase mb-2'>Trạng thái</p>
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full inline-block ${
                    lesson.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-600 text-gray-100'
                  }`}
                >
                  {lesson.isPublic ? 'Công khai' : 'Riêng tư'}
                </span>
              </div>

              <hr className='border-gray-600' />

              {/* Lesson Content */}
              {lesson.content && (
                <div>
                  <p className='text-xs font-medium text-gray-300 uppercase mb-2'>Mô tả</p>
                  <div className='bg-gray-800 p-3 rounded-md max-h-48 overflow-y-auto text-xs'>
                    <div className='text-gray-200' dangerouslySetInnerHTML={{ __html: lesson.content }} />
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Edit Mode */}
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-sm font-semibold text-white'>Sửa thông tin</h3>
              </div>

              <div className='space-y-3'>
                {/* Edit Title */}
                <div>
                  <label htmlFor='edit-title' className='text-xs font-medium text-gray-300 uppercase'>
                    Tiêu đề
                  </label>
                  <CustomInput
                    id='edit-title'
                    placeholder='Nhập tiêu đề'
                    value={editTitle}
                    onChange={(e: any) => setEditTitle(e.target.value)}
                    className='mt-1 text-sm'
                  />
                </div>

                {/* Edit Content */}
                <div>
                  <label htmlFor='edit-content' className='text-xs font-medium text-gray-300 uppercase'>
                    Mô tả
                  </label>
                  <div className='bg-white rounded-lg border border-gray-200 mt-1'>
                    <QuillEditor
                      initialHtml={editContent}
                      onChange={setEditContent}
                      className='text-black min-h-[260px]'
                    />
                  </div>
                </div>

                {/* Edit isPublic */}
                <CustomCheckbox
                  id='edit-is-public'
                  label='Công khai bài học này'
                  checked={editIsPublic}
                  onChange={(e) => setEditIsPublic(e.target.checked)}
                  className='mt-2 text-white-100'
                />

                {/* Action Buttons */}
                <div className='flex gap-2'>
                  <CustomButton
                    className='flex-1 bg-blue-500 hover:bg-blue-600 text-white h-8'
                    label='Lưu'
                    icon={<Save className='w-3 h-3 mr-1' />}
                    onClick={handleSaveEdit}
                  />
                  <CustomButton
                    className='flex-1 bg-gray-600 hover:bg-gray-700 text-white h-8'
                    label='Hủy'
                    icon={<X className='w-3 h-3 mr-1' />}
                    onClick={handleCancelEdit}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </CustomDialog>
  )
}

export default PreviewTeacherLesson
