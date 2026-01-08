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
          className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm'
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className='relative w-full max-w-4xl'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='relative rounded-xl overflow-hidden shadow-2xl bg-black'>
              <div className='absolute top-4 right-4 z-10'>
                <Button
                  onClick={onClose}
                  size='icon'
                  variant='default'
                  className='rounded-full shadow-lg'
                  aria-label='Đóng video'
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>

              <div className='absolute top-4 left-4 z-10'>
                <h3 className='text-white font-semibold text-lg drop-shadow-lg'>{title}</h3>
              </div>

              <div className='aspect-video'>
                <video ref={videoRef} src={`http://${videoUrl}`} controls className='w-full h-full' aria-label={title}>
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
