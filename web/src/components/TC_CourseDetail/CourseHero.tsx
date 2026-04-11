import { motion } from 'framer-motion'
import { useState } from 'react'
import { Play, Calendar, Edit, Check, BadgeCheck, PlayCircle } from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import CustomDialog from '@/components/common/Dialog'
import { Badge } from '@/components/ui/badge'
import courseAdminService from '@/services/course/course-admin.service'
import { toast } from 'sonner'
import { AiFillDislike } from 'react-icons/ai'
import useLoading from '@/hooks/useLoading.hook'
import HighGlossBackground from '@/components/common/HighGlossBackground'

interface CourseHeroProps {
  title: string
  coverImage: string
  status: string
  publishedAt: string
  price?: number
  courseStatus: string
  onPlayIntro: () => void
  onEdit: () => void
  courseId?: string
  introductoryVideo: string
}

enum EnumCourseStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED'
}

function getStatusColor(status: EnumCourseStatus | string) {
  switch (status.toString().toLowerCase()) {
    case 'draft':
      return 'bg-gray-500 text-white'
    case 'pending_review':
      return 'bg-yellow-400 text-black'
    case 'published':
      return 'bg-blue-500 text-white'
    case 'rejected':
      return 'bg-red-500 text-white'
    case 'archived':
      return 'bg-gray-700 text-white'
    default:
      return 'bg-gray-300 text-black'
  }
}

function getStatusLabel(status: string | EnumCourseStatus) {
  switch (status.toString().toLowerCase()) {
    case 'draft':
      return 'Bản nháp'
    case 'pending_review':
      return 'Chờ duyệt'
    case 'published':
      return 'Đang hoạt động'
    case 'rejected':
      return 'Đã bị quản trị viên từ chối'
    case 'archived':
      return 'Đã lưu trữ'
    default:
      return status.replace('_', ' ') // fallback
  }
}

export function CourseHero({
  introductoryVideo,
  title,
  coverImage,
  courseStatus,
  status,
  publishedAt,
  price,
  onPlayIntro,
  onEdit
}: CourseHeroProps) {
  const [openPreview, setOpenPreview] = useState(false)
  const [openApproveModal, setOpenApproveModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const { loading: approving, startLoading: startApproving, stopLoading: stopApproving } = useLoading()
  const { loading: rejecting, startLoading: startRejecting, stopLoading: stopRejecting } = useLoading()
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin/course')
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const handleApproveCourse = async () => {
    if (!id) {
      toast.error('Missing course id')
      return
    }
    try {
      startApproving()
      const res = await courseAdminService.aprovalCourse(id)
      if (res && res.code === 200) {
        toast.success('Phê duyệt khoá học thành công')
        setOpenApproveModal(false)
      } else {
        toast.error(res.message || 'Không thể phê duyệt khoá học')
      }
    } catch (err) {
      console.error(err)
      toast.error('Phê duyệt thất bại. Vui lòng thử lại.')
    } finally {
      stopApproving()
    }
  }

  const handleRejectCourse = async () => {
    if (!id) {
      toast.error('Missing course id')
      return
    }
    try {
      startRejecting()
      const res = await courseAdminService.rejectCourse(id, rejectReason)
      if (res && res.code === 200) {
        toast.success('Từ chối khoá học thành công')
        setOpenApproveModal(false)
      } else {
        toast.error(res.message || 'Không thể từ chối khoá học')
      }
    } catch (err) {
      console.error(err)
      toast.error('Lỗi khi gọi API từ chối')
    } finally {
      stopRejecting()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='relative'
    >
      <HighGlossBackground className='rounded-2xl shadow-lg'>
        <div className='relative grid gap-6 p-8 lg:grid-cols-2 lg:gap-8'>
          <div className='flex flex-col space-y-6'>
            <h1 className='text-3xl font-black tracking-tight lg:text-4xl xl:text-4xl text-white'>{title}</h1>

            <div className='flex items-center gap-3 flex-wrap'>
              <Badge className={`${getStatusColor(status)} text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider`}>
                {getStatusLabel(status)}
              </Badge>

              <div className='flex items-center gap-2 text-xs font-bold text-blue-100 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10'>
                <Calendar className='h-3 w-3' />
                <span>{new Date(publishedAt).toLocaleDateString('vi-VN')}</span>
              </div>

              {price && (
                <div className='text-xs font-black text-white bg-orange-500/80 backdrop-blur-md px-3 py-1 rounded-full border border-orange-400/30'>
                  {price.toLocaleString('vi-VN')}đ
                </div>
              )}
            </div>

            <div className='flex gap-3 flex-wrap'>
              {isAdminRoute ? (
                <>
                  {courseStatus === 'pending_review' && (
                    <Button
                      onClick={() => setOpenApproveModal(true)}
                      size='lg'
                      className='bg-white text-blue-700 hover:bg-blue-50 font-black rounded-xl'
                    >
                      <Check className='mr-2 h-4 w-4' />
                      {courseStatus === 'pending_review' && 'Phê duyệt khóa học'}
                    </Button>
                  )}

                  <CustomDialog
                    open={openApproveModal}
                    setOpen={setOpenApproveModal}
                    title={
                      <span className='flex items-center gap-1 font-black'>
                        <BadgeCheck />
                        Phê duyệt / Từ chối khoá học
                      </span>
                    }
                    size='md'
                    description='Bạn có thể phê duyệt khoá học này để nó được xuất bản trên nền tảng hoặc từ chối với lý do cụ thể.'
                  >
                    <div className='space-y-4'>
                      <div className='flex flex-col gap-2'>
                        <textarea
                          placeholder='Nếu từ chối, ghi lý do ở đây (tùy chọn)'
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className='w-full min-h-[80px] p-2 border rounded-md text-sm'
                        />
                      </div>
                      <div className='flex items-center justify-end gap-2'>
                        <Button size='sm' className='bg-red-500 text-white hover:bg-red-600' onClick={handleRejectCourse}>
                          <AiFillDislike /> {rejecting ? 'Đang...' : 'Từ chối'}
                        </Button>
                        <Button
                          size='sm'
                          className='bg-blue-600 text-white hover:bg-blue-700'
                          onClick={handleApproveCourse}
                        >
                          <Check /> {approving ? 'Đang...' : 'Phê duyệt'}
                        </Button>
                      </div>
                    </div>
                  </CustomDialog>
                </>
              ) : courseStatus !== 'published' ? (
                <Button onClick={onEdit} size='lg' className='bg-white text-blue-700 hover:bg-blue-50 font-black rounded-xl'>
                  <Edit className='mr-2 h-4 w-4' />
                  Chỉnh sửa
                </Button>
              ) : (
                <Button
                  className='bg-white text-blue-700 hover:bg-blue-50 font-black rounded-xl px-4 py-2 flex items-center gap-2'
                  onClick={() => navigate(`/course-page/${id}`)}
                >
                  <PlayCircle className='w-5 h-5' />
                  Xem chi tiết
                </Button>
              )}
            </div>
          </div>

          <div className='relative group'>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className='relative aspect-video overflow-hidden rounded-2xl shadow-2xl border-4 border-white/10'
            >
              <img src={coverImage} alt={title} className='h-full w-full object-cover' />
              <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />

              {introductoryVideo && (
                <>
                  <Button
                    onClick={() => {
                      setOpenPreview(true)
                      try {
                        onPlayIntro()
                      } catch (e) {
                        // ignore
                      }
                    }}
                    size='lg'
                    className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full h-16 w-16 p-0 bg-white/90 text-blue-600 shadow-2xl hover:scale-110 transition-transform'
                  >
                    <Play className='h-6 w-6 ml-1' />
                  </Button>

                  <CustomDialog
                    open={openPreview}
                    setOpen={setOpenPreview}
                    title={
                      <div className='flex items-center gap-2 font-black'>
                        <Play className='w-5 h-5' /> Giới thiệu khóa học
                      </div>
                    }
                    size='lg'
                    className='bg-indigo-950 border-none text-white'
                  >
                    {introductoryVideo ? (
                      <div className='w-full'>
                        <video src={`${introductoryVideo}`} controls autoPlay className='w-full max-h-[500px] rounded-xl shadow-2xl'>
                          <track kind='captions' srcLang='en' label='English captions' src={`${introductoryVideo}.vtt`} />
                        </video>
                      </div>
                    ) : (
                      <div className='text-sm text-blue-100/50'>Không có video để xem trước</div>
                    )}
                  </CustomDialog>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </HighGlossBackground>
    </motion.div>
  )
}
