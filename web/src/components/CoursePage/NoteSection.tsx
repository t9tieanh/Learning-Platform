import * as React from 'react'
import { Textarea } from '@/components/ui/textarea'
import CustomButton from '@/components/common/Button'
import lessonStudentService from '@/services/course/lesson-student.service'
import { toast } from 'sonner'
import useLoading from '@/hooks/useLoading.hook'
import { NotebookPen, Sparkles, Save } from 'lucide-react'
import HighGlossBackground from '@/components/common/HighGlossBackground'

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
    <div className='py-4 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700'>
      <HighGlossBackground className='rounded-xl shadow-md shadow-blue-900/10 overflow-hidden'>
        <div className='px-4 py-3.5 md:px-5 md:py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-start gap-3 min-w-0'>
            <div className='w-9 h-9 mt-0.5 shrink-0 bg-white/10 rounded-lg flex items-center justify-center text-white border border-white/15'>
              <NotebookPen className='w-[18px] h-[18px]' strokeWidth={2} />
            </div>
            <div className='min-w-0 flex flex-col pt-0.5'>
              <h2 className='text-white font-black text-[15px] tracking-tight leading-snug flex items-center gap-1.5 flex-wrap'>
                Sổ tay bài học
                <Sparkles className='w-3 h-3 text-amber-200/90 shrink-0' aria-hidden />
              </h2>
              <p className='text-[11px] text-blue-100/80 mt-0.5 font-medium leading-snug'>
                Ghi nhanh ý chính để ôn sau.
              </p>
            </div>
          </div>
          {note && note.trim().length > 0 ? (
            <div className='flex shrink-0 sm:justify-end'>
              <div className='bg-white/15 border border-white/25 rounded-md px-2.5 py-1 flex items-center gap-1.5 backdrop-blur-sm'>
                <div className='w-1 h-1 bg-emerald-300 rounded-full animate-pulse' />
                <span className='text-[10px] font-bold uppercase tracking-wider text-blue-50'>Đã lưu nội dung</span>
              </div>
            </div>
          ) : null}
        </div>
      </HighGlossBackground>

      <div className='relative group'>
        <div className='absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000'></div>
        <div className='relative bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-sm'>
          <div className='relative border border-gray-100 rounded-xl overflow-hidden focus-within:border-blue-300 transition-all bg-gray-50/30'>
            <Textarea
              placeholder='Nhập những điểm quan trọng bạn muốn ghi nhớ từ bài học này...'
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className='min-h-[260px] resize-none border-none focus-visible:ring-0 bg-transparent text-gray-700 text-[12.5px] font-medium p-5 placeholder:text-gray-300 leading-relaxed scrollbar-none'
            />

            <div className='absolute bottom-3 right-3 flex items-center gap-2 bg-white/90 backdrop-blur-sm p-1 rounded-lg border border-gray-100 shadow-sm'>
              <CustomButton
                icon={<Save className='w-3 h-3 mr-1.5' />}
                isLoader={loading}
                onClick={() => handleSaveNote()}
                className='bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 h-9 text-[11px] font-bold tracking-[0.1em] shadow-sm'
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
