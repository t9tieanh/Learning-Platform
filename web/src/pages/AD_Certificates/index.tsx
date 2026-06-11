import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Certificate } from '@/types/mockData'
import certificateService from '@/services/certificate/certificate.service'
import { Award, Check, Clock3, ExternalLink, ShieldCheck, X } from 'lucide-react'
import { toast } from 'sonner'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { AdminCertificatesTableSkeleton, AdminStatCardsSkeleton } from '@/components/Admin/Skeleton'

const statCardClass =
  'rounded-[26px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.2)]'

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [actionType, setActionType] = useState<'confirmed' | 'reject'>('confirmed')
  const [rejectReason, setRejectReason] = useState('')
  const [rejectOption, setRejectOption] = useState<string | null>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)

  const REJECT_PRESETS = [
    'Thông tin không khớp',
    'Hình ảnh mờ/không rõ',
    'Liên kết không hợp lệ',
    'Không đúng khóa học',
    'Khác'
  ]

  useEffect(() => {
    if (selectedCert) {
      console.log('selectedCert updated:', selectedCert)
    }
  }, [selectedCert])

  useEffect(() => {
    let active = true
    const fetchCertificates = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await certificateService.adminGetCertificates()
        console.log('RESPONSE', res)
        if (!active) return
        const items = res.result ?? []
        const mapped: Certificate[] = items.map((c: any) => ({
          id: c.id,
          userName: c.userName ?? '—',
          userEmail: c.userEmail ?? '-',
          courseName: c.title ?? '—',
          courseId: c.courseId ?? '',
          submittedAt: c.issueDate ?? new Date().toISOString(),
          status: (String(c.status).toLowerCase() as any) || 'pending',
          certificateUrl: c.credentialUrl,
          imageUrl: c.imageUrl,
          organization: c.organization,
          reason: c.reason ?? undefined
        }))
        setCertificates(mapped)
      } catch (e: any) {
        if (!active) return
        const msg = e?.response?.data?.message || e?.message || 'Lỗi tải danh sách chứng chỉ'
        setError(msg)
        toast.error(msg)
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchCertificates()
    return () => {
      active = false
    }
  }, [])

  const handleAction = (cert: Certificate, type: 'confirmed' | 'reject') => {
    setSelectedCert(cert)
    setActionType(type)
    setRejectOption(null)
    setRejectReason('')
    setShowDialog(true)
  }

  const confirmAction = async () => {
    if (!selectedCert) return
    const newStatus = actionType === 'confirmed' ? 'confirmed' : 'rejected'

    const effectiveReason =
      newStatus === 'rejected' ? (rejectOption === 'Khác' ? rejectReason.trim() : rejectOption || '').trim() : ''

    try {
      setConfirmLoading(true)
      const res = await certificateService.updateCertificate(selectedCert.id, newStatus, effectiveReason)
      if (res.code && res.code !== 200) {
        throw new Error(res.message || 'Cập nhật chứng chỉ thất bại')
      }

      setCertificates(
        certificates.map((c) =>
          c.id === selectedCert.id
            ? { ...c, status: newStatus, reason: newStatus === 'rejected' ? effectiveReason : undefined }
            : c
        )
      )

      toast.success(newStatus === 'confirmed' ? 'Đã xác nhận chứng chỉ' : 'Đã từ chối chứng chỉ')
      setShowDialog(false)
      setRejectReason('')
      setRejectOption(null)
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Không thể cập nhật chứng chỉ'
      toast.error(msg)
    } finally {
      setConfirmLoading(false)
    }
  }

  const getStatusBadge = (status: Certificate['status'], reason?: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant='outline' className='rounded-full border-amber-200 bg-amber-50 px-3 py-1 text-amber-700'>
            Chờ duyệt
          </Badge>
        )
      case 'confirmed':
        return (
          <Badge variant='outline' className='rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700'>
            Đã xác nhận
          </Badge>
        )
      case 'rejected':
        return (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant='outline'
                  className='cursor-help rounded-full border-rose-200 bg-rose-50 px-3 py-1 text-rose-700'
                >
                  Từ chối
                </Badge>
              </TooltipTrigger>
              <TooltipContent className='max-w-xs rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-lg'>
                <p>{reason?.trim() ? reason : 'Không có lý do'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
    }
  }

  const stats = {
    total: certificates.length,
    pending: certificates.filter((cert) => cert.status === 'pending').length,
    confirmed: certificates.filter((cert) => cert.status === 'confirmed').length,
    rejected: certificates.filter((cert) => cert.status === 'rejected').length
  }

  return (
    <div className='space-y-8'>
      <section className='relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-6 py-7 text-white shadow-[0_24px_60px_-34px_rgba(15,23,42,0.55)]'>
        <div className='absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-400/15 blur-3xl' />
        <div className='absolute bottom-0 left-12 h-28 w-28 rounded-full bg-sky-300/10 blur-3xl' />
        <div className='relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between'>
          <div className='max-w-2xl'>
            <p className='text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/80'>HỆ THỐNG CHỨNG CHỈ</p>
            <h1 className='mt-3 text-3xl font-semibold tracking-tight'>Xác nhận chứng chỉ</h1>
            <p className='mt-2 text-sm leading-6 text-slate-300'>
              Kiểm tra, duyệt và theo dõi trạng thái chứng chỉ trong một giao diện gọn gàng, dễ ra quyết định hơn.
            </p>
          </div>

          <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
            <div className='rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm'>
              <p className='text-xs uppercase tracking-[0.18em] text-slate-300'>Tổng yêu cầu</p>
              <p className='mt-3 text-2xl font-semibold'>{stats.total}</p>
            </div>
            <div className='rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm'>
              <p className='text-xs uppercase tracking-[0.18em] text-amber-200'>Chờ duyệt</p>
              <p className='mt-3 text-2xl font-semibold'>{stats.pending}</p>
            </div>
            <div className='rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm'>
              <p className='text-xs uppercase tracking-[0.18em] text-emerald-200'>Đã xác nhận</p>
              <p className='mt-3 text-2xl font-semibold'>{stats.confirmed}</p>
            </div>
            <div className='rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm'>
              <p className='text-xs uppercase tracking-[0.18em] text-rose-200'>Từ chối</p>
              <p className='mt-3 text-2xl font-semibold'>{stats.rejected}</p>
            </div>
          </div>
        </div>
      </section>

      <section className='grid gap-4 md:grid-cols-3 xl:grid-cols-4'>
        {loading ? (
          <AdminStatCardsSkeleton count={4} columnsClassName='grid gap-4 md:grid-cols-3 xl:grid-cols-4' />
        ) : (
          <>
        <div className={statCardClass}>
          <div className='flex items-center gap-3'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600'>
              <Award className='h-5 w-5' />
            </div>
            <div>
              <p className='text-sm font-medium text-slate-500'>Tổng chứng chỉ</p>
              <p className='mt-1 text-2xl font-semibold text-slate-950'>{stats.total}</p>
            </div>
          </div>
        </div>
        <div className={statCardClass}>
          <div className='flex items-center gap-3'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600'>
              <Clock3 className='h-5 w-5' />
            </div>
            <div>
              <p className='text-sm font-medium text-slate-500'>Đang chờ duyệt</p>
              <p className='mt-1 text-2xl font-semibold text-slate-950'>{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className={statCardClass}>
          <div className='flex items-center gap-3'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600'>
              <ShieldCheck className='h-5 w-5' />
            </div>
            <div>
              <p className='text-sm font-medium text-slate-500'>Đã xác nhận</p>
              <p className='mt-1 text-2xl font-semibold text-slate-950'>{stats.confirmed}</p>
            </div>
          </div>
        </div>
        <div className={statCardClass}>
          <div className='flex items-center gap-3'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600'>
              <X className='h-5 w-5' />
            </div>
            <div>
              <p className='text-sm font-medium text-slate-500'>Bị từ chối</p>
              <p className='mt-1 text-2xl font-semibold text-slate-950'>{stats.rejected}</p>
            </div>
          </div>
        </div>
          </>
        )}
      </section>

      <section className='overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/95 shadow-[0_22px_55px_-36px_rgba(15,23,42,0.24)]'>
        <div className='border-b border-slate-200/80 bg-slate-50/80 px-6 py-5'>
          <h2 className='text-lg font-semibold tracking-tight text-slate-950'>Danh sách chứng chỉ</h2>
          <p className='mt-1 text-sm text-slate-500'>Xem nhanh trạng thái và xử lý từng yêu cầu ngay trong bảng.</p>
        </div>

        {loading ? (
          <AdminCertificatesTableSkeleton rows={8} />
        ) : error ? (
          <div className='flex min-h-[320px] items-center justify-center px-6 text-sm font-medium text-rose-600'>
            {error}
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <Table className='min-w-full'>
              <TableHeader>
                <TableRow className='border-b border-slate-200 bg-slate-50/70 hover:bg-slate-50/70'>
                  <TableHead className='px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>
                    Người dùng
                  </TableHead>
                  <TableHead className='px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>
                    Khóa học
                  </TableHead>
                  <TableHead className='px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>
                    Ngày gửi
                  </TableHead>
                  <TableHead className='px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>
                    Trạng thái
                  </TableHead>
                  <TableHead className='px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>
                    Liên kết
                  </TableHead>
                  <TableHead className='px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {certificates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className='px-6 py-16 text-center text-sm text-slate-500'>
                      Chưa có chứng chỉ nào cần xử lý.
                    </TableCell>
                  </TableRow>
                ) : (
                  certificates.map((cert) => (
                    <TableRow key={cert.id} className='border-b border-slate-100 transition-colors hover:bg-sky-50/40'>
                      <TableCell className='px-6 py-4'>
                        <div className='space-y-1'>
                          <p className='font-medium text-slate-900'>{cert.userName}</p>
                          <p className='text-sm text-slate-500'>{cert.userEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className='px-6 py-4'>
                        <div className='space-y-1'>
                          <p className='font-medium text-slate-800'>{cert.courseName}</p>
                          <p className='text-sm text-slate-500'>{cert.organization || 'Không có tổ chức cấp'}</p>
                        </div>
                      </TableCell>
                      <TableCell className='px-6 py-4 text-sm text-slate-500'>
                        {new Date(cert.submittedAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell className='px-6 py-4'>{getStatusBadge(cert.status, cert.reason)}</TableCell>
                      <TableCell className='px-6 py-4'>
                        {cert.certificateUrl ? (
                          <a
                            href={cert.certificateUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-100'
                          >
                            <ExternalLink className='h-3.5 w-3.5' />
                            Xem chứng chỉ
                          </a>
                        ) : (
                          <span className='text-sm text-slate-400'>Không có</span>
                        )}
                      </TableCell>
                      <TableCell className='px-6 py-4 text-right'>
                        <div className='flex justify-end gap-2'>
                          {cert.status === 'pending' && (
                            <>
                              <Button
                                size='sm'
                                className='rounded-xl bg-slate-950 px-4 text-white shadow-sm hover:bg-slate-800'
                                onClick={() => handleAction(cert, 'confirmed')}
                              >
                                <Check className='mr-2 h-4 w-4' />
                                Duyệt
                              </Button>
                              <Button
                                variant='outline'
                                size='sm'
                                className='rounded-xl border-rose-200 bg-rose-50 px-4 text-rose-700 hover:bg-rose-100 hover:text-rose-800'
                                onClick={() => handleAction(cert, 'reject')}
                              >
                                <X className='mr-2 h-4 w-4' />
                                Từ chối
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className='max-w-3xl rounded-[28px] border border-slate-200/80 bg-white p-0 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.28)]'>
          <DialogHeader className='border-b border-slate-200/80 px-6 py-5'>
            <DialogTitle className='text-xl font-semibold tracking-tight text-slate-950'>
              {actionType === 'confirmed' ? 'Xác nhận chứng chỉ?' : 'Từ chối chứng chỉ?'}
            </DialogTitle>
            <DialogDescription className='mt-1 text-sm leading-6 text-slate-500'>
              Kiểm tra nhanh thông tin trước khi thực hiện hành động.
            </DialogDescription>
          </DialogHeader>

          {selectedCert && (
            <div className='grid gap-6 px-6 py-6 lg:grid-cols-[1fr_350px]'>
              <div className='space-y-5'>
                <div className='grid gap-3 sm:grid-cols-2'>
                  <div className='rounded-2xl border border-slate-200 bg-slate-50/80 p-4'>
                    <p className='text-xs font-semibold uppercase tracking-[0.18em] text-slate-500'>Người dùng</p>
                    <p className='mt-2 line-clamp-2 font-medium text-slate-950 break-words'>{selectedCert.userName}</p>
                    <p className='mt-1 line-clamp-2 text-sm text-slate-500 break-all'>{selectedCert.userEmail}</p>
                  </div>
                  <div className='rounded-2xl border border-slate-200 bg-slate-50/80 p-4'>
                    <p className='text-xs font-semibold uppercase tracking-[0.18em] text-slate-500'>Khóa học</p>
                    <p className='mt-2 line-clamp-2 font-medium text-slate-950 break-words'>
                      {selectedCert.courseName}
                    </p>
                    <p className='mt-1 text-sm text-slate-500'>
                      {new Date(selectedCert.submittedAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>

                <div className='rounded-2xl border border-slate-200 bg-white p-4'>
                  <div className='space-y-3'>
                    <div>
                      <p className='text-xs font-semibold uppercase tracking-[0.18em] text-slate-500'>
                        Trạng thái hiện tại
                      </p>
                      <div className='mt-2'>{getStatusBadge(selectedCert.status, selectedCert.reason)}</div>
                    </div>
                    {selectedCert.organization && (
                      <div>
                        <p className='text-xs font-semibold uppercase tracking-[0.18em] text-slate-500'>Nơi cấp</p>
                        <p className='mt-2 line-clamp-2 text-sm font-medium text-slate-700 break-words'>
                          {selectedCert.organization}
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedCert.certificateUrl && (
                    <a
                      href={selectedCert.certificateUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='mt-4 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-100'
                    >
                      <ExternalLink className='h-3.5 w-3.5' />
                      Mở liên kết chứng chỉ
                    </a>
                  )}
                </div>

                {actionType === 'reject' && (
                  <div className='rounded-2xl border border-rose-200 bg-rose-50/60 p-4'>
                    <p className='text-sm font-medium text-rose-900'>Lý do từ chối</p>
                    <div className='mt-3 flex flex-wrap gap-2'>
                      {REJECT_PRESETS.map((opt) => (
                        <Button
                          key={opt}
                          type='button'
                          variant={rejectOption === opt ? 'default' : 'outline'}
                          className={
                            rejectOption === opt
                              ? 'rounded-full bg-rose-600 text-white hover:bg-rose-700'
                              : 'rounded-full border-rose-200 bg-white text-rose-700 hover:bg-rose-100'
                          }
                          onClick={() => setRejectOption(opt)}
                        >
                          {opt}
                        </Button>
                      ))}
                    </div>
                    {rejectOption === 'Khác' && (
                      <Textarea
                        placeholder='Nhập lý do...'
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={4}
                        className='mt-4 rounded-2xl border-rose-200 bg-white focus:border-rose-300 focus:ring-rose-200'
                      />
                    )}
                  </div>
                )}
              </div>

              <div className='flex items-center justify-center'>
                <div className='h-[320px] w-[320px] rounded-[24px] border border-slate-200 bg-slate-50/70 p-4'>
                  {selectedCert.imageUrl ? (
                    <img
                      src={selectedCert.imageUrl}
                      alt='Chứng chỉ'
                      className='h-full w-full rounded-[20px] border border-slate-200 object-cover shadow-sm'
                    />
                  ) : (
                    <div className='flex h-full items-center justify-center rounded-[20px] border border-dashed border-slate-200 bg-white text-sm text-slate-400'>
                      Không có ảnh
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className='border-t border-slate-200/80 px-6 py-5'>
            <Button variant='outline' onClick={() => setShowDialog(false)} className='rounded-xl'>
              Hủy
            </Button>
            <Button
              onClick={confirmAction}
              disabled={
                confirmLoading ||
                (actionType === 'reject' && (!rejectOption || (rejectOption === 'Khác' && !rejectReason.trim())))
              }
              className='rounded-xl bg-slate-950 px-5 text-white hover:bg-slate-800 disabled:opacity-50'
            >
              {confirmLoading ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
