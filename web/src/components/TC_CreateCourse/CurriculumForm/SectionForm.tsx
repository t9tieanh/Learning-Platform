import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, ChevronDown, ChevronRight, Play, FileText, HelpCircle, GripVertical, Trash2 } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface Chapter {
  id: string
  title: string
  isOpen: boolean
  description?: string
  lectures: Lecture[]
}

const SectionForm = ({
  chapter,
  toggleSection,
  updateSectionTitle
}: {
  chapter: Chapter
  toggleSection: (sectionId: string) => void
  updateSectionTitle: (sectionId: string, title: string) => void
}) => {
  return (
    <div key={chapter.id} className='border border-blue-200 rounded-xl shadow-sm'>
      <Collapsible open={chapter.isOpen} onOpenChange={() => toggleSection(chapter.id)}>
        <CollapsibleTrigger className='w-full'>
          <div className='flex items-center justify-between p-4 hover:bg-blue-100/50 border-b border-blue-200 rounded-t-xl'>
            <div className='flex items-center space-x-3'>
              <GripVertical className='h-4 w-4 text-blue-400' />
              {chapter.isOpen ? (
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
  )
}

export default SectionForm
