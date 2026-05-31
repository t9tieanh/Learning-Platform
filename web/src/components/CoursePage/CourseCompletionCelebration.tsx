import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Award, ArrowRight, Download, Loader2, PartyPopper, Sparkles } from 'lucide-react'
import CustomDialog from '@/components/common/Dialog'
import CustomButton from '@/components/common/Button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import CelebrationFireworks from '@/components/common/CelebrationFireworks'
import courseCertificateService from '@/services/certificate/course-certificate.service'
import { toast } from 'sonner'
import logo from '@/assets/images/logo1.png'

interface CourseCompletionCelebrationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseTitle?: string
  courseThumbnailUrl?: string | null
  certificateId?: string
  certificateCode?: string
}

export default function CourseCompletionCelebration({
  open,
  onOpenChange,
  courseTitle,
  courseThumbnailUrl,
  certificateId,
  certificateCode
}: CourseCompletionCelebrationProps) {
  const navigate = useNavigate()
  const [downloading, setDownloading] = useState(false)

  const handleViewCertificate = () => {
    onOpenChange(false)
    navigate('/me?mode=cert')
  }

  const handleDownloadPdf = async () => {
    if (!certificateId) {
      handleViewCertificate()
      return
    }

    try {
      setDownloading(true)
      await courseCertificateService.downloadCertificatePdf(
        certificateId,
        certificateCode ? `Learnova-Chung-chi-${certificateCode}.pdf` : undefined
      )
      toast.success('Đã tải chứng chỉ PDF')
    } catch (error) {
      console.error('Failed to download certificate PDF', error)
      toast.error('Không thể tải file PDF. Vui lòng thử lại.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
      <CelebrationFireworks active={open} />

      <CustomDialog
        open={open}
        setOpen={onOpenChange}
        title='Chúc mừng hoàn thành khóa học'
        hideHeader
        noPadding
        size='xl'
        className='w-[95vw] max-w-4xl p-0 overflow-hidden bg-white border border-blue-100 rounded-[2.5rem] gap-0 z-[201]'
        contentClassName='my-0 w-full'
      >
        <div className='flex flex-col md:flex-row h-auto md:h-[560px] max-h-[90vh] overflow-y-auto md:overflow-hidden'>
          <div className='w-full md:w-[42%] h-[240px] md:h-full relative overflow-hidden group shrink-0 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950'>
            {courseThumbnailUrl ? (
              <img
                src={courseThumbnailUrl}
                alt={courseTitle ?? 'Khóa học'}
                className='w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90'
              />
            ) : (
              <div className='w-full h-full flex items-center justify-center'>
                <Award className='w-20 h-20 text-white/30' />
              </div>
            )}
            <div className='absolute inset-0 bg-gradient-to-t from-blue-950/80 via-blue-900/20 to-transparent' />

            <div className='absolute bottom-6 left-6 right-6 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[1.5rem]'>
              <div className='flex items-center gap-3'>
                <div className='relative shrink-0'>
                  <Avatar className='w-12 h-12 ring-2 ring-white/30'>
                    <AvatarImage src={courseThumbnailUrl ?? undefined} alt={courseTitle} className='object-cover' />
                    <AvatarFallback className='bg-blue-600 text-white font-bold'>
                      {courseTitle?.charAt(0) ?? 'L'}
                    </AvatarFallback>
                  </Avatar>
                  <div className='absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center'>
                    <Award className='w-3 h-3 text-white' />
                  </div>
                </div>
                <div className='flex flex-col min-w-0'>
                  <span className='text-white font-black text-[13px] tracking-tight truncate'>
                    {courseTitle ?? 'Khóa học'}
                  </span>
                  <span className='text-blue-100/70 text-[9px] font-bold uppercase tracking-widest'>
                    100% hoàn thành
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className='flex-1 p-8 md:p-14 flex flex-col justify-center relative bg-white'>
            <div className='absolute top-0 right-0 w-64 h-64 bg-blue-50/40 rounded-bl-full -z-10 blur-3xl' />

            <div className='flex flex-col gap-6 md:gap-8'>
              <div className='flex flex-col gap-4 md:gap-5'>
                <div className='inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-blue-50/80 text-blue-600 border border-blue-100 w-fit animate-pulse'>
                  <PartyPopper className='w-3.5 h-3.5' />
                  <span className='text-[9px] font-black uppercase tracking-[0.2em]'>Chúc mừng bạn!</span>
                </div>

                <div className='space-y-3'>
                  <h2 className='text-2xl md:text-[38px] font-black text-gray-900 leading-[1.15] tracking-tight'>
                    Bạn đã hoàn thành <br />
                    <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700'>
                      toàn bộ khóa học
                    </span>
                  </h2>
                  <p className='text-gray-500 text-sm md:text-[14px] leading-relaxed font-semibold max-w-sm'>
                    Chứng chỉ hoàn thành đã được cấp. Tải PDF ngay hoặc xem trong hồ sơ của bạn.
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100'>
                <img src={logo} alt='Learnova' className='w-10 h-10 object-contain shrink-0' />
                <div className='min-w-0'>
                  <p className='text-[11px] font-black text-blue-800 uppercase tracking-wider'>Learnova Certificate</p>
                  <p className='text-xs text-gray-600 font-medium truncate'>
                    {certificateCode ? (
                      <>
                        Mã chứng chỉ: <span className='font-mono text-blue-700'>{certificateCode}</span>
                      </>
                    ) : courseTitle ? (
                      `"${courseTitle}"`
                    ) : (
                      'Chứng chỉ khóa học của bạn'
                    )}
                  </p>
                </div>
                <Sparkles className='w-5 h-5 text-amber-500 shrink-0 animate-pulse' />
              </div>

              <div className='flex flex-wrap gap-2 pt-1'>
                <CustomButton
                  onClick={handleDownloadPdf}
                  label={downloading ? 'Đang tải...' : 'Tải PDF'}
                  icon={
                    downloading ? (
                      <Loader2 className='w-3.5 h-3.5 animate-spin' />
                    ) : (
                      <Download className='w-3.5 h-3.5' />
                    )
                  }
                  className='h-10 flex-1 min-w-[calc(50%-0.25rem)] sm:min-w-0 basis-[calc(33.333%-0.375rem)] bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 px-3 disabled:opacity-70'
                />
                <CustomButton
                  onClick={handleViewCertificate}
                  label='Xem hồ sơ'
                  icon={<Award className='w-3.5 h-3.5' />}
                  className='h-10 flex-1 min-w-[calc(50%-0.25rem)] sm:min-w-0 basis-[calc(33.333%-0.375rem)] bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 px-3'
                />
                <CustomButton
                  onClick={() => onOpenChange(false)}
                  label='Tiếp tục học'
                  icon={<ArrowRight className='w-3.5 h-3.5' />}
                  className='h-10 flex-1 min-w-full sm:min-w-0 basis-[calc(33.333%-0.375rem)] bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 px-3'
                />
              </div>
            </div>
          </div>
        </div>
      </CustomDialog>
    </>
  )
}
