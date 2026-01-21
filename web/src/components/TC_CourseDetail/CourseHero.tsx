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

interface CourseHeroProps {
  title: string
  coverImage: string
  status: string
  publishedAt: string
  price?: number
  courseStatus: string
  onPlayIntro: () => void
  onEdit: () => void
  // onApprove handled internally via admin API
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
      return 'bg-gray-500 text-white' // Bản nháp
    case 'pending_review':
      return 'bg-yellow-400 text-black' // Chờ duyệt
    case 'published':
      return 'bg-blue-500 text-white' // Đang mở
    case 'rejected':
      return 'bg-red-500 text-white' // Bị từ chối
    case 'archived':
      return 'bg-gray-700 text-white' // Đã lưu trữ
    default:
      return 'bg-gray-300 text-black' // Mặc định
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

  // Handle approve course
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

  // Handle reject course
  const handleRejectCourse = async () => {
    if (!id) {
      toast.error('Missing course id')
      return
    }
    if (!rejectReason) {
      // require reason? we allow empty
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
      className='relative overflow-hidden rounded-2xl shadow-lg'
    >
      <div className='absolute inset-0 bg-[#0C356A]' />

      <div className='relative grid gap-6 p-8 lg:grid-cols-2 lg:gap-8'>
        <div className='flex flex-col space-y-6'>
          <h1 className='text-3xl font-bold tracking-tight lg:text-4xl xl:text-4xl text-white'>{title}</h1>

          <div className='flex items-center gap-3 flex-wrap'>
            <Badge className={`${getStatusColor(status)} text-sm p-1 px-2`}>{getStatusLabel(status)}</Badge>

            {/* Ngày: trung tính, không cần màu đậm */}
            <div className='flex items-center gap-2 text-sm text-muted-foreground bg-gray-100 p-1 rounded-md'>
              <Calendar className='h-4 w-4 text-gray-600' />
              <span>{new Date(publishedAt).toLocaleDateString('vi-VN')}</span>
            </div>

            {/* Giá: nổi bật nhẹ (cam), nhưng có thể dùng outline cho đỡ nặng */}
            {price && (
              <Badge variant='outline' className='text-sm border-orange-500 text-orange-600 font-semibold p-1'>
                {price.toLocaleString('vi-VN')}đ
              </Badge>
            )}
          </div>

          <div className='flex gap-3 flex-wrap'>
            {isAdminRoute ? (
              <>
                {courseStatus === 'pending_review' && (
                  <Button
                    onClick={() => setOpenApproveModal(true)}
                    size='lg'
                    className='shadow-primary bg-blue-600 text-white hover:bg-blue-700'
                  >
                    <Check className='mr-2 h-4 w-4' />
                    {courseStatus === 'pending_review' && 'Phê duyệt khóa học'}
                  </Button>
                )}

                <CustomDialog
                  open={openApproveModal}
                  setOpen={setOpenApproveModal}
                  title={
                    <span className='flex items-center gap-1'>
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
              <Button onClick={onEdit} size='lg' className='shadow-primary'>
                <Edit className='mr-2 h-4 w-4' />
                Chỉnh sửa
              </Button>
            ) : (
              <Button
                className='text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1 shadow-sm'
                onClick={() => navigate(`/course-page/${id}`)}
                aria-label={`Xem chi tiết`}
              >
                <PlayCircle className='w-4 h-4 mr-1' />
                Xem chi tiết
              </Button>
            )}
          </div>
        </div>

        <div className='relative group'>
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className='relative aspect-video overflow-hidden rounded-xl shadow-md'
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
                  className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full h-16 w-16 p-0 shadow-lg group-hover:scale-110 transition-transform'
                  aria-label='Phát video giới thiệu'
                >
                  <Play className='h-6 w-6 ml-1' />
                </Button>

                <CustomDialog
                  open={openPreview}
                  setOpen={setOpenPreview}
                  title={
                    <>
                      <Play className='w-4 h-4 mr-1' /> Giới thiệu khóa học
                    </>
                  }
                  size='lg'
                  className='bg-[#0C356A] border-none text-white'
                >
                  {introductoryVideo ? (
                    <div className='w-full'>
                      <video
                        src={`${introductoryVideo}`}
                        controls
                        autoPlay
                        className='w-full h-[480px] rounded-md'
                      >
                        <track kind='captions' srcLang='en' label='English captions' src={`${introductoryVideo}.vtt`} />
                      </video>
                    </div>
                  ) : (
                    <div className='text-sm text-muted-foreground'>Không có video để xem trước</div>
                  )}
                </CustomDialog>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
