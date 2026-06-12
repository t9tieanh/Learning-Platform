import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import lessonStudentService from '@/services/course/lesson-student.service'
import { useAuthStore } from '@/stores/useAuth.stores'
import { toast } from 'sonner'

interface RemediationArticleViewerProps {
  lessonId: string
}

const RemediationArticleViewer: React.FC<RemediationArticleViewerProps> = ({ lessonId }) => {
  const { data } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [docSrc, setDocSrc] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetchUrl = async () => {
      if (!lessonId || !data?.accessToken) return
      setLoading(true)
      try {
        const res = await lessonStudentService.getLessonVideoUrl(lessonId)
        if (!cancelled && res.code === 200) {
          setDocSrc(res.result || null)
        }
      } catch (err) {
        console.error('Failed to fetch remediation article url', err)
        toast.error('Không thể tải tài liệu.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchUrl()
    return () => {
      cancelled = true
    }
  }, [lessonId, data?.accessToken])

  if (loading) {
    return (
      <div className='aspect-video w-full flex items-center justify-center bg-slate-900 rounded-2xl border border-white/10'>
        <Loader2 className='w-6 h-6 text-blue-500 animate-spin' />
      </div>
    )
  }

  if (!docSrc) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className='overflow-hidden rounded-2xl border border-blue-200/50 shadow-xl bg-white'
    >
      <iframe
        src={docSrc}
        title='Tài liệu bài học'
        className='aspect-video w-full border-none'
      />
    </motion.div>
  )
}

export default RemediationArticleViewer
