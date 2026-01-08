import { FC, useEffect, useState } from 'react'
import CertificateItem from './CertificateItem'
import CustomButton from '@/components/common/Button'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { CertificateResponse } from '@/types/certificate'
import certificateService, { CreateCertReq, CreateCertRes } from '@/services/certificate/certificate.service'
import { useAuthStore } from '@/stores/useAuth.stores'
import useLoading from '@/hooks/useLoading.hook'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface Props {
  userId: string
}

// Removed mock; will use API results (if a list endpoint is added later)

const CertificateList: FC<Props> = () => {
  const [certificates, setCertificates] = useState<CertificateResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [newCert, setNewCert] = useState({
    credentialUrl: '',
    issueDate: ''
  })
  const { data } = useAuthStore()
  const currentUserId = (data as any)?.userId || (data as any)?.id
  const { loading: isSubmitting, startLoading, stopLoading } = useLoading()

  const handleDelete = async (id: string) => {
    try {
      setLoading(true)
      const res = await certificateService.deleteCertificate(id)
      if (res?.result) {
        setCertificates((prev) => prev.filter((cert) => cert.id !== id))
        toast.success('Xóa chứng chỉ thành công!')
      } else {
        toast.error(res?.message || 'Xóa chứng chỉ thất bại')
      }
    } catch (e) {
      console.error(e)
      toast.error('Đã xảy ra lỗi khi xóa chứng chỉ')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!currentUserId) {
        setLoading(false)
        return
      }
      try {
        const res = await certificateService.getCertificates(String(currentUserId))
        const items = Array.isArray(res?.result) ? res.result : []
        const mapped: CertificateResponse[] = items.map((c: CreateCertRes & any) => ({
          id: c.id || c._id || Math.random().toString(36).slice(2),
          name: c.title,
          issuer: c.organization,
          credentialUrl: c.credentialUrl,
          verified: false,
          verificationSource: 'SYSTEM',
          verifiedAt: c.issueDate,
          imageUrl: c.imageUrl,
          status: c.status,
          reason: c.reason || ''
        }))
        if (mounted) setCertificates(mapped)
      } catch (e) {
        console.error(e)
        if (mounted) toast.error('Không thể tải danh sách chứng chỉ')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [currentUserId])

  const handleAddCertificate = () => {
    setOpenModal(true)
  }

  const handleSubmitCertificate = async () => {
    const { credentialUrl, issueDate } = newCert
    if (!credentialUrl || !issueDate) {
      toast.error('Vui lòng điền đầy đủ thông tin!')
      return
    }
    if (!currentUserId) {
      toast.error('Không xác định được người dùng')
      return
    }
    try {
      startLoading()
      const payload: CreateCertReq = { credentialUrl, issueDate }
      const res = await certificateService.createCertificate(String(currentUserId), payload)
      if (res?.result) {
        // Map backend response (title->name, organization->issuer, issueDate->verifiedAt)
        const mapped: CertificateResponse = {
          id: (res.result as any).id || Date.now().toString(),
          name: res.result.title,
          issuer: res.result.organization,
          credentialUrl: res.result.credentialUrl,
          verified: false,
          verificationSource: 'MANUAL',
          verifiedAt: res.result.issueDate,
          imageUrl: res.result.imageUrl,
          status: res.result.status
        }
        setCertificates((prev) => [mapped, ...prev])
        toast.success('Thêm chứng chỉ thành công!')
        setOpenModal(false)
        setNewCert({ credentialUrl: '', issueDate: '' })
      } else {
        toast.error(res?.message || 'Không thể tạo chứng chỉ')
      }
    } catch (e) {
      console.error(e)
      toast.error('Tạo chứng chỉ thất bại')
    } finally {
      stopLoading()
    }
  }

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <h2 className='font-semibold text-base'>Chứng chỉ</h2>
        <CustomButton label='Thêm chứng chỉ' icon={<Plus className='w-4 h-4' />} onClick={handleAddCertificate} />
      </div>

      <div className='space-y-2'>
        {loading ? (
          <div>Đang tải...</div>
        ) : certificates.length === 0 ? (
          <div className='text-sm text-muted-foreground'>Chưa có chứng chỉ nào</div>
        ) : (
          certificates.map((cert) => <CertificateItem key={cert.id} cert={cert} onDelete={handleDelete} />)
        )}
      </div>

      {/* --- Modal thêm chứng chỉ --- */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className='max-w-md'>
          <DialogHeader className='space-y-2'>
            <DialogTitle>Thêm chứng chỉ</DialogTitle>
            <DialogDescription>
              Hệ thống chỉ chấp nhận link chứng chỉ từ Credly.{' '}
              <a
                href='https://www.credly.com/'
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-600 hover:underline font-medium'
              >
                Tìm hiểu thêm
              </a>
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3 py-2'>
            <div className='space-y-2'>
              <Label>Link chứng chỉ</Label>
              <Input
                value={newCert.credentialUrl}
                onChange={(e) => setNewCert({ ...newCert, credentialUrl: e.target.value })}
                placeholder='https://www.credly.com/badges...'
              />
            </div>

            <div className='space-y-2'>
              <Label>Ngày cấp</Label>
              <Input
                type='date'
                value={newCert.issueDate}
                onChange={(e) => setNewCert({ ...newCert, issueDate: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setOpenModal(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button onClick={handleSubmitCertificate} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {isSubmitting ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CertificateList
