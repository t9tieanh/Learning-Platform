import * as React from 'react'
import { Textarea } from '@/components/ui/textarea'
import CustomButton from '@/components/common/Button'
import lessonStudentService from '@/services/course/lesson-student.service'
import { toast } from 'sonner'
import useLoading from '@/hooks/useLoading.hook'
import { Send, NotebookPen, Sparkles, Save } from 'lucide-react'

const NoteSection = ({
  lessonId,
  note,
  setNote
}: {
  lessonId: string
  note: string
  setNote: (note: string) => void
}) => {
  const { loading, startLoading, stopLoading } = useLoading()

  const handleSaveNote = async () => {
    try {
      startLoading()
      const response = await lessonStudentService.makeNote(lessonId, note)
      if (response && response.code === 200) {
        toast.success(response.message)
      } else {
        toast.error(response.message || 'Ghi chú không được lưu. Vui lòng thử lại!')
      }
    } catch (error) {
      toast.error('Ghi chú không được lưu. Vui lòng thử lại!')
      console.error('Failed to save note', error)
    } finally {
      stopLoading()
    }
  }

  return (
    <div className='py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700'>
      <div className='relative group'>
        <div className='absolute -inset-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000'></div>
        <div className='relative bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm space-y-8'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-5'>
              <div className='w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner border border-blue-100/50'>
                <NotebookPen className='w-6 h-6' />
              </div>
              <div className='flex flex-col'>
                <h3 className='text-gray-800 font-bold text-[18px] tracking-tight'>Sổ tay bài học</h3>
                <p className='text-[11px] text-gray-400 mt-1 flex items-center gap-2 font-bold uppercase tracking-widest'>
                  <Sparkles className='w-3 h-3 text-blue-400' /> Lưu trữ kiến thức cá nhân
                </p>
              </div>
            </div>
            {note && note.trim().length > 0 && (
              <div className='bg-green-50 px-4 py-1.5 rounded-full border border-green-100 flex items-center gap-2'>
                <div className='w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse'></div>
                <span className='text-[9px] font-black uppercase tracking-widest text-green-600'>Đã ghi nhận</span>
              </div>
            )}
          </div>

          <div className='relative border border-gray-100 rounded-[2rem] overflow-hidden focus-within:border-blue-300 transition-all bg-gray-50/30'>
            <Textarea
              placeholder='Nhập những điểm quan trọng bạn muốn ghi nhớ từ bài học này...'
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className='min-h-[300px] resize-none border-none focus-visible:ring-0 bg-transparent text-gray-700 text-[14px] font-medium p-8 placeholder:text-gray-300 leading-relaxed scrollbar-none'
            />

            <div className='absolute bottom-4 right-4 flex items-center gap-3 bg-white/80 backdrop-blur-md p-1.5 rounded-xl border border-gray-100 shadow-sm'>
              <CustomButton
                icon={<Save className='w-3.5 h-3.5 mr-2' />}
                isLoader={loading}
                onClick={() => handleSaveNote()}
                className='bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 h-9 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 transition-all hover:scale-[1.02] active:scale-[0.98]'
              >
                Lưu ghi chú
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NoteSection
