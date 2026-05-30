import { motion } from 'framer-motion'
import { useState } from 'react'
import { Play, Calendar, Edit, Check, BadgeCheck, PlayCircle, CircleDollarSign } from 'lucide-react'
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
      return 'border-zinc-200 bg-zinc-100 text-zinc-700'
    case 'pending_review':
      return 'border-amber-200 bg-amber-50 text-amber-700'
    case 'published':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case 'rejected':
      return 'border-rose-200 bg-rose-50 text-rose-700'
    case 'archived':
      return 'border-zinc-300 bg-zinc-100 text-zinc-700'
    default:
      return 'border-slate-200 bg-slate-100 text-slate-700'
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
      return status.replace('_', ' ')
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='relative overflow-hidden rounded-[1.5rem] border border-slate-200/90 bg-white/95 p-5 shadow-[0_14px_32px_rgba(15,23,42,0.06)] lg:p-6'>
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(96,165,250,0.16),transparent_55%),radial-gradient(100%_70%_at_90%_100%,rgba(167,139,250,0.12),transparent_60%)]' />

      <div className='relative grid gap-6 lg:grid-cols-2 lg:gap-8'>
        <div className='flex flex-col space-y-5'>
          <h1 className='text-2xl font-semibold leading-tight tracking-tight text-slate-900 lg:max-w-[14ch] lg:text-4xl'>{title}</h1>

          <div className='flex flex-wrap items-center gap-2.5'>
            <Badge className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusColor(status)}`}>
              {getStatusLabel(status)}
            </Badge>

            <div className='flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm'>
              <Calendar className='h-3.5 w-3.5' />
              <span>{new Date(publishedAt).toLocaleDateString('vi-VN')}</span>
            </div>

            {price && (
              <div className='flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm'>
                <CircleDollarSign className='h-4 w-4' />
                {price.toLocaleString('vi-VN')}đ
              </div>
            )}
          </div>

          <p className='max-w-[52ch] text-base leading-relaxed text-slate-500'>
            Khóa học giúp bạn xây dựng chiến lược cạnh tranh hiệu quả, tạo lợi thế bền vững và tăng trưởng vượt trội trong mọi thị trường.
          </p>

          <div className='flex flex-wrap gap-3'>
            {isAdminRoute ? (
              <>
                {courseStatus === 'pending_review' && (
                  <Button
                    onClick={() => setOpenApproveModal(true)}
                    size='lg'
                    className='rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700'
                  >
                    <Check className='mr-2 h-4 w-4' />
                    {courseStatus === 'pending_review' && 'Phê duyệt khóa học'}
                  </Button>
                )}

                <CustomDialog
                  open={openApproveModal}
                  setOpen={setOpenApproveModal}
                  title={
                    <span className='flex items-center gap-1 font-semibold'>
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
                        className='min-h-[96px] w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                      />
                    </div>
                    <div className='flex items-center justify-end gap-2'>
                      <Button size='sm' className='bg-rose-500 text-white hover:bg-rose-600' onClick={handleRejectCourse}>
                        <AiFillDislike /> {rejecting ? 'Đang...' : 'Từ chối'}
                      </Button>
                      <Button size='sm' className='bg-blue-600 text-white hover:bg-blue-700' onClick={handleApproveCourse}>
                        <Check /> {approving ? 'Đang...' : 'Phê duyệt'}
                      </Button>
                    </div>
                  </div>
                </CustomDialog>
              </>
            ) : courseStatus !== 'published' ? (
              <Button onClick={onEdit} size='lg' className='rounded-xl bg-white text-blue-700 hover:bg-blue-50 border border-blue-200'>
                <Edit className='mr-2 h-4 w-4' />
                Chỉnh sửa
              </Button>
            ) : (
              <Button
                className='flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(79,70,229,0.3)] hover:brightness-105'
                onClick={() => navigate(`/course-page/${id}`)}
              >
                <PlayCircle className='h-5 w-5' />
                Xem chi tiết
              </Button>
            )}
          </div>
        </div>

        <div className='relative group'>
          <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.25 }} className='relative aspect-video overflow-hidden rounded-2xl border border-slate-200 shadow-[0_14px_28px_rgba(15,23,42,0.16)]'>
            <img src={coverImage} alt={title} className='h-full w-full object-cover' />
            <div className='absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent' />

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
                  className='absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/95 p-0 text-blue-600 shadow-[0_12px_22px_rgba(15,23,42,0.24)] transition-transform hover:scale-105'
                >
                  <Play className='ml-0.5 h-5 w-5' />
                </Button>

                <CustomDialog
                  open={openPreview}
                  setOpen={setOpenPreview}
                  title={
                    <div className='flex items-center gap-2 font-semibold text-slate-900'>
                      <Play className='h-5 w-5' /> Giới thiệu khóa học
                    </div>
                  }
                  size='lg'
                  className='border-slate-200 bg-white'
                >
                  {introductoryVideo ? (
                    <div className='w-full'>
                      <video src={`${introductoryVideo}`} controls autoPlay className='max-h-[500px] w-full rounded-xl border border-slate-200'>
                        <track kind='captions' srcLang='en' label='English captions' src={`${introductoryVideo}.vtt`} />
                      </video>
                    </div>
                  ) : (
                    <div className='text-sm text-slate-500'>Không có video để xem trước</div>
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
