import { FC, useState } from 'react'
import { CertificateResponse } from '@/types/certificate'
import { Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '../ui/badge'

interface Props {
  cert: CertificateResponse
  onDelete?: (id: string) => void
}

const CertificateItem: FC<Props> = ({ cert, onDelete }) => {
  const [openDialog, setOpenDialog] = useState(false)
  const handleDelete = () => {
    onDelete?.(cert.id)
    setOpenDialog(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-500'
      case 'PENDING':
        return 'bg-yellow-500'
      case 'REJECTED':
        return 'bg-red-500'
      default:
        return 'bg-gray-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Đã xác nhận'
      case 'PENDING':
        return 'Đang chờ'
      case 'REJECTED':
        return 'Bị từ chối'
      default:
        return 'Không xác định'
    }
  }

  return (
    <div className='relative flex border-2 rounded-lg p-4 bg-white hover:bg-blue-50 transition-colors items-center'>
      {/* Badge hiển thị status tiếng Việt */}
      <div
        className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold text-white rounded ${getStatusColor(
          cert.status
        )}`}
      >
        {getStatusLabel(cert.status)}
      </div>
      {/* Hình ảnh */}
      <div className='flex-shrink-0 w-24 h-24 mr-4'>
        <img
          src={cert.imageUrl || '/placeholder-cert.png'}
          alt={cert.name}
          className='w-full h-full object-contain rounded-md'
        />
      </div>

      {/* Thông tin */}
      <div className='flex-1 flex flex-col justify-between'>
        <div className='space-y-1'>
          <div className='font-medium text-lg'>{cert.name}</div>
          <div className='text-muted-foreground text-base'>Bên cung cấp: {cert.issuer}</div>
          <div className='text-base text-muted-foreground'>
            Ngày tạo: {cert.verifiedAt ? new Date(cert.verifiedAt).toLocaleDateString('vi-VN') : 'Không có ID'}
          </div>
          {cert.status === 'REJECTED' && cert.reason && (
            <div className='text-sm text-red-600 mt-1'>Lý do từ chối: {cert.reason}</div>
          )}
        </div>
      </div>

      {/* Nút mở Dialog */}
      <button
        onClick={() => setOpenDialog(true)}
        className='ml-4 text-red-600 hover:text-red-800'
        title='Xóa chứng chỉ'
      >
        <Trash2 className='w-5 h-5' />
      </button>

      {/* Dialog xác nhận xóa */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa chứng chỉ</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa chứng chỉ "{cert.name}" không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='flex justify-end space-x-2'>
            <Button variant='outline' onClick={() => setOpenDialog(false)}>
              Hủy
            </Button>
            <Button variant='destructive' onClick={handleDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CertificateItem
