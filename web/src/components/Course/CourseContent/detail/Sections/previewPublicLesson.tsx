import CustomDialog from '@/components/common/Dialog'
import { Play, BookOpenCheck, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import logo from '@/assets/images/logo1.png'
import { LoadingDots } from '@/components/common/Loading/LoadingDots'
import HighGlossBackground from '@/components/common/HighGlossBackground'
import { motion, AnimatePresence } from 'framer-motion'

const PreviewPublicLesson = ({
  preview,
  setPreview
}: {
  preview: {
    openPreview: boolean
    previewUrl: string | null
    previewTitle: string
    subTitle?: string
  }
  setPreview: any
}) => {
  const [isVideoLoading, setIsVideoLoading] = useState(true)

  return (
    <CustomDialog
      className='bg-transparent border-none shadow-none'
      hideHeader
      noPadding
      open={preview.openPreview}
      setOpen={(v: boolean) => {
        setPreview((prev: any) => ({
          ...prev,
          openPreview: v
        }))
      }}
      size='xl'
      showCloseButton={false}
    >
      <div className='relative min-h-[400px] max-h-[90vh] flex flex-col rounded-[32px] overflow-hidden'>
        <HighGlossBackground className='absolute inset-0 z-0' />

        <button
          onClick={(e) => {
            e.stopPropagation()
            setPreview((prev: any) => ({
              ...prev,
              openPreview: false
            }))
          }}
          className='absolute top-4 right-4 z-50 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white'
          aria-label='Close'
        >
          <X className='w-5 h-5 text-white' />
        </button>

        <div className='relative z-10 flex-1 flex flex-col p-4 md:p-6 gap-6 overflow-y-auto'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='space-y-6'
          >
            <div className='flex flex-col gap-2'>
              <div className='flex items-center gap-3'>
                <div className='w-1 md:w-1.5 h-6 md:h-8 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]' />
                <h2 className='text-white text-lg md:text-2xl font-extrabold tracking-tight leading-tight'>
                  {preview.previewTitle}
                </h2>
              </div>
              <div className='flex items-center gap-2 text-blue-200/60 ml-4 md:ml-5'>
                <BookOpenCheck className='w-3.5 h-3.5' />
                <span className='text-[10px] md:text-xs font-bold uppercase tracking-widest'>Nội dung bài giảng công khai</span>
              </div>
            </div>

            <div className='bg-white/5 backdrop-blur-xl border border-white/10 p-4 md:p-6 rounded-3xl shadow-2xl relative overflow-hidden group'>
              <div className='absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl' />
              <div className='relative z-10'>
                <div className='flex items-center gap-2 mb-2'>
                  <Sparkles className='w-4 h-4 text-[#66D2CE] animate-pulse' />
                  <span className='text-[#66D2CE] text-[11px] md:text-xs font-black uppercase tracking-wider'>Lời nhắn từ Learnova</span>
                </div>
                <p className='text-white/80 text-xs md:text-sm leading-relaxed font-medium italic'>
                  {preview.subTitle ||
                    `Hãy đăng ký khóa học ngay hôm nay để mở khóa toàn bộ nội dung chuyên sâu và bắt đầu hành trình chinh phục kiến thức của bạn cùng cộng đồng Learnova! 🚀`}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className='flex-1 flex flex-col'
          >
            {preview.previewUrl ? (
              <div className='w-full relative aspect-video rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 bg-black group'>
                <video
                  src={`${preview.previewUrl}` || undefined}
                  controls
                  autoPlay
                  className='w-full h-full object-contain'
                  onLoadStart={() => setIsVideoLoading(true)}
                  onCanPlay={() => setIsVideoLoading(false)}
                  onLoadedData={() => setIsVideoLoading(false)}
                >
                  <track kind='captions' srcLang='en' label='English captions' src={`${preview.previewUrl || ''}.vtt`} />
                </video>

                <AnimatePresence>
                  {isVideoLoading && (
                    <motion.div
                      exit={{ opacity: 0 }}
                      className='absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-20'
                    >
                      <div className='flex flex-col items-center gap-6'>
                        <div className='relative w-16 h-16 md:w-20 md:h-20'>
                          <div className='absolute inset-0 bg-blue-500/20 rounded-full animate-ping' />
                          <img src={logo} alt='Loading' className='w-full h-full object-contain relative z-10 animate-bounce' />
                        </div>
                        <div className='text-center space-y-2'>
                          <LoadingDots text='Đang xử lý' className='text-blue-200 text-xs md:text-sm font-bold tracking-tight' />
                          <p className='text-white/30 text-[10px] uppercase font-bold tracking-[0.2em]'>Sẵn sàng kiến thức</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className='flex-1 flex items-center justify-center bg-white/5 rounded-3xl border border-dashed border-white/20 p-12'>
                <div className='text-center space-y-4 opacity-40'>
                  <div className='w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto'>
                    <Play className='w-6 h-6 text-white' />
                  </div>
                  <p className='text-white text-sm font-bold uppercase tracking-widest'>Video đang được chuẩn bị</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </CustomDialog>
  )
}

export default PreviewPublicLesson
