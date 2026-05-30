import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  videoUrl: string
  title: string
}

export function VideoModal({ isOpen, onClose, videoUrl, title }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play()
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm'
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.35 }}
            className='relative w-full max-w-4xl'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='relative overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-2xl'>
              <div className='absolute right-4 top-4 z-10'>
                <Button onClick={onClose} size='icon' variant='default' className='rounded-full bg-white/95 text-slate-700 hover:bg-white' aria-label='Đóng video'>
                  <X className='h-4 w-4' />
                </Button>
              </div>

              <div className='absolute left-4 top-4 z-10'>
                <h3 className='text-base font-semibold text-white drop-shadow-lg'>{title}</h3>
              </div>

              <div className='aspect-video'>
                <video ref={videoRef} src={`${videoUrl}`} controls className='h-full w-full' aria-label={title}>
                  <track kind='captions' />
                  Trình duyệt của bạn không hỗ trợ phát video.
                </video>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
