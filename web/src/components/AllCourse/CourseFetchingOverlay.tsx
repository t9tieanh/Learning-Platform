import logo from '@/assets/images/logo1.png'

interface CourseFetchingOverlayProps {
  visible: boolean
}

export const CourseFetchingOverlay = ({ visible }: CourseFetchingOverlayProps) => {
  if (!visible) return null

  return (
    <div
      className='fixed inset-0 z-[100] flex cursor-wait items-center justify-center bg-white/55 backdrop-blur-[2px]'
      role='status'
      aria-live='polite'
      aria-label='Đang tải danh sách khóa học'
    >
      <div className='flex flex-col items-center gap-4 rounded-3xl border border-blue-100 bg-white/95 px-8 py-7 shadow-[0_24px_70px_rgba(15,23,42,0.16)]'>
        <div className='relative flex h-24 w-24 items-center justify-center'>
          <div className='absolute inset-0 rounded-full border-4 border-blue-100' />
          <div className='absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-cyan-400 animate-spin' />
          <div className='flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_10px_26px_rgba(37,99,235,0.12)]'>
            <img src={logo} alt='Learnova' className='h-8 w-8 object-contain' />
          </div>
        </div>
        <div className='text-center'>
          <p className='text-sm font-bold text-slate-900'>Đang cập nhật khóa học</p>
          <p className='mt-1 text-xs font-medium text-slate-500'>Vui lòng chờ trong giây lát...</p>
        </div>
      </div>
    </div>
  )
}
