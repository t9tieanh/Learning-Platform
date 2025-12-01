import * as React from 'react'
import { Textarea } from '@/components/ui/textarea'
import CustomButton from '@/components/common/Button'
import lessonStudentService from '@/services/course/lesson-student.service'
import { toast } from 'sonner'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer'
import { useEffect } from 'react'
import { Send, NotebookPen } from 'lucide-react'

const NoteSection = ({
  lessonId,
  open,
  setOpen,
  note
}: {
  lessonId: string
  open: boolean
  setOpen: (open: boolean) => void
  note: string
}) => {
  const [noteContent, setNoteContent] = React.useState(note || '')

  const handleSaveNote = async () => {
    try {
      const response = await lessonStudentService.makeNote(lessonId, noteContent)
      if (response && response.code === 200) {
        toast.success(response.message)
      } else {
        toast.error(response.message || 'Ghi chú không được lưu. Vui lòng thử lại!')
      }
    } catch (error) {
      toast.error('Ghi chú không được lưu. Vui lòng thử lại!')
      console.error('Failed to save note', error)
    }
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent>
        <div className='mx-auto text-start w-full max-w-sm'>
          <DrawerHeader>
            <DrawerTitle className='flex items-center gap-2 text-center'>
              <NotebookPen />
              Nhập ghi chú cho bài học này !
            </DrawerTitle>
            <DrawerDescription className='text-left'>
              Hãy viết những điểm bạn muốn ghi nhớ từ bài học.
            </DrawerDescription>
          </DrawerHeader>
          <div className='p-4 pb-0'>
            <Textarea
              placeholder='Nhập ghi chú của bạn tại đây...'
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
            />
          </div>
          <DrawerFooter className='flex flex-row gap-2 justify-end'>
            <CustomButton icon={<Send />} onClick={() => handleSaveNote()}>
              Lưu
            </CustomButton>
            <DrawerClose asChild>
              <CustomButton className='bg-white text-black hover:bg-gray-100'>Hủy</CustomButton>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default NoteSection
