import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Edit2, Trash2, Eye, Lock } from 'lucide-react'
import { Discount, DiscountType } from '@/types/discount.type'
import { mockDiscounts } from '@/data/mockDiscounts'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function DiscountsAdmin() {
  const [discounts, setDiscounts] = useState<Discount[]>(mockDiscounts)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize] = useState(10)
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'valid' | 'expired'>('upcoming')
  const [formData, setFormData] = useState<Partial<Discount>>({
    type: DiscountType.FIXED,
    minOrderValue: 0,
    maxDiscount: 0
  })

  // Filter discounts by status
  const getDiscountStatus = (discount: Discount) => {
    const startDate = new Date(discount.startDate)
    const endDate = new Date(discount.endDate)
    const now = new Date()

    if (now > endDate) return 'expired'
    if (now < startDate) return 'upcoming'
    return 'valid'
  }

  const filteredDiscounts = useMemo(() => {
    return discounts.filter((d) => getDiscountStatus(d) === activeTab)
  }, [discounts, activeTab])

  const pageDiscounts = useMemo(() => {
    const start = pageIndex * pageSize
    return filteredDiscounts.slice(start, start + pageSize)
  }, [filteredDiscounts, pageIndex, pageSize])

  const totalPages = Math.ceil(filteredDiscounts.length / pageSize)

  const stats = useMemo(
    () => ({
      total: discounts.length,
      active: discounts.filter((d) => d.isActive).length,
      fixed: discounts.filter((d) => d.type === DiscountType.FIXED).length,
      percent: discounts.filter((d) => d.type === DiscountType.PERCENT).length
    }),
    [discounts]
  )

  const handleOpenDialog = (discount?: Discount) => {
    if (discount) {
      setEditingId(discount.id)
      setFormData(discount)
    } else {
      setEditingId(null)
      setFormData({ type: DiscountType.FIXED, minOrderValue: 0, maxDiscount: 0 })
    }
    setShowDialog(true)
  }

  const handleCloseDialog = () => {
    setShowDialog(false)
    setEditingId(null)
    setFormData({ type: DiscountType.FIXED })
  }

  const handleSave = () => {
    if (!formData.name || !formData.code || formData.value === undefined) {
      alert('Vui lòng điền đầy đủ thông tin')
      return
    }

    if (editingId) {
      setDiscounts(discounts.map((d) => (d.id === editingId ? { ...d, ...formData } : d)))
    } else {
      const newDiscount: Discount = {
        id: Date.now().toString(),
        name: formData.name!,
        code: formData.code!,
        value: formData.value,
        type: formData.type || DiscountType.FIXED,
        minOrderValue: formData.minOrderValue || 0,
        maxDiscount: formData.maxDiscount || 0,
        startDate: formData.startDate || new Date().toISOString(),
        endDate: formData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true
      }
      setDiscounts([...discounts, newDiscount])
    }

    handleCloseDialog()
  }

  const handleDelete = (id: string) => {
    if (confirm('Bạn chắc chắn muốn xóa mã giảm giá này?')) {
      setDiscounts(discounts.filter((d) => d.id !== id))
    }
  }

  const handleToggleActive = (id: string) => {
    setDiscounts(discounts.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d)))
  }

  const typeLabel = (type: DiscountType) => (type === DiscountType.FIXED ? 'Cố định (VNĐ)' : 'Phần trăm (%)')

  const isDateValid = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return true
    return new Date(startDate) < new Date(endDate)
  }

  return (
    <div className='space-y-8 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent'>
            Quản lý mã giảm giá
          </h2>
          <p className='text-muted-foreground mt-2'>Quản lý và theo dõi các mã khuyến mãi</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className='gap-2'>
          <Plus className='h-4 w-4' />
          Thêm mã giảm giá
        </Button>
      </div>

      {/* Stats */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card className='p-4 border-none shadow-md bg-gradient-to-br from-background to-primary/5'>
          <div>
            <p className='text-sm text-muted-foreground'>Tổng mã</p>
            <p className='text-3xl font-bold'>{stats.total}</p>
          </div>
        </Card>
        <Card className='p-4 border-none shadow-md bg-gradient-to-br from-background to-gray-500/5'>
          <div>
            <p className='text-sm text-muted-foreground'>Sắp diễn ra</p>
            <p className='text-3xl font-bold text-gray-600'>
              {discounts.filter((d) => getDiscountStatus(d) === 'upcoming').length}
            </p>
          </div>
        </Card>
        <Card className='p-4 border-none shadow-md bg-gradient-to-br from-background to-green-500/5'>
          <div>
            <p className='text-sm text-muted-foreground'>Đang hiệu lực</p>
            <p className='text-3xl font-bold text-green-600'>
              {discounts.filter((d) => getDiscountStatus(d) === 'valid').length}
            </p>
          </div>
        </Card>
        <Card className='p-4 border-none shadow-md bg-gradient-to-br from-background to-red-500/5'>
          <div>
            <p className='text-sm text-muted-foreground'>Đã kết thúc</p>
            <p className='text-3xl font-bold text-red-600'>
              {discounts.filter((d) => getDiscountStatus(d) === 'expired').length}
            </p>
          </div>
        </Card>
      </div>

      {/* Table with Tabs */}
      <Card className='rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden'>
        <div className='border-b border-gray-200 px-6 pt-6'>
          <div className='flex gap-8'>
            <button
              onClick={() => {
                setActiveTab('upcoming')
                setPageIndex(0)
              }}
              className={`pb-4 font-medium text-sm relative transition-colors ${
                activeTab === 'upcoming' ? 'text-blue-600' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sắp diễn ra
              {activeTab === 'upcoming' && <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600' />}
            </button>
            <button
              onClick={() => {
                setActiveTab('valid')
                setPageIndex(0)
              }}
              className={`pb-4 font-medium text-sm relative transition-colors ${
                activeTab === 'valid' ? 'text-green-600' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Đang hiệu lực
              {activeTab === 'valid' && <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-green-600' />}
            </button>
            <button
              onClick={() => {
                setActiveTab('expired')
                setPageIndex(0)
              }}
              className={`pb-4 font-medium text-sm relative transition-colors ${
                activeTab === 'expired' ? 'text-red-600' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Đã kết thúc
              {activeTab === 'expired' && <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-red-600' />}
            </button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className='bg-gray-50 border-b border-gray-200'>
              <TableHead className='text-gray-700 font-semibold py-4 px-4'>Mã code</TableHead>
              <TableHead className='text-gray-700 font-semibold py-4 px-4'>Tên khuyến mãi</TableHead>
              <TableHead className='text-gray-700 font-semibold py-4 px-4'>Loại / Giá trị</TableHead>
              <TableHead className='text-gray-700 font-semibold py-4 px-4'>Thời hạn</TableHead>
              <TableHead className='text-gray-700 font-semibold py-4 px-4'>Trạng thái</TableHead>
              <TableHead className='text-right text-gray-700 font-semibold py-4 px-4'>Hành động</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pageDiscounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className='py-8 text-center text-muted-foreground'>
                  Không có mã giảm giá nào
                </TableCell>
              </TableRow>
            ) : (
              pageDiscounts.map((discount) => {
                const startDate = new Date(discount.startDate)
                const endDate = new Date(discount.endDate)
                const now = new Date()
                const isExpired = now > endDate
                const hasStarted = now >= startDate
                const canEdit = activeTab === 'upcoming'
                const editButtonClass = canEdit
                  ? 'text-gray-600 hover:text-blue-600'
                  : 'text-gray-300 cursor-not-allowed'
                const deleteButtonClass = canEdit
                  ? 'text-gray-600 hover:text-red-600'
                  : 'text-gray-300 cursor-not-allowed'

                return (
                  <TableRow
                    key={discount.id}
                    className='hover:bg-blue-50/40 transition-colors border-b border-gray-100 last:border-0'
                  >
                    <TableCell className='py-4 px-4 font-mono font-semibold text-blue-600'>{discount.code}</TableCell>
                    <TableCell className='py-4 px-4 font-medium'>{discount.name}</TableCell>
                    <TableCell className='py-4 px-4'>
                      <div>
                        <p className='text-sm font-medium'>{typeLabel(discount.type)}</p>
                        <p className='text-sm text-muted-foreground'>
                          {discount.type === DiscountType.FIXED
                            ? `${discount.value.toLocaleString('vi-VN')} VNĐ`
                            : `${discount.value}%`}
                        </p>
                        {discount.maxDiscount && (
                          <p className='text-xs text-muted-foreground'>
                            Tối đa: {discount.maxDiscount.toLocaleString('vi-VN')} VNĐ
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className='py-4 px-4 text-sm'>
                      <p>{startDate.toLocaleDateString('vi-VN')}</p>
                      <p className='text-muted-foreground'>→ {endDate.toLocaleDateString('vi-VN')}</p>
                    </TableCell>
                    <TableCell className='py-4 px-4'>
                      {isExpired ? (
                        <Badge className='bg-red-50 text-red-700 border-red-200'>Hết hạn</Badge>
                      ) : !hasStarted ? (
                        <Badge className='bg-gray-50 text-gray-700 border-gray-200'>Sắp diễn ra</Badge>
                      ) : discount.isActive ? (
                        <Badge className='bg-green-50 text-green-800 border-green-200'>Hoạt động</Badge>
                      ) : (
                        <Badge className='bg-yellow-50 text-yellow-800 border-yellow-200'>Tạm dừng</Badge>
                      )}
                    </TableCell>
                    <TableCell className='py-4 px-4 text-right'>
                      <div className='flex items-center justify-end gap-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleToggleActive(discount.id)}
                          className='text-gray-600 hover:text-blue-600'
                          title={discount.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                          disabled={activeTab !== 'upcoming'}
                        >
                          <Eye className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleOpenDialog(discount)}
                          className={editButtonClass}
                          title={canEdit ? 'Chỉnh sửa' : 'Không thể chỉnh sửa'}
                          disabled={!canEdit}
                        >
                          {canEdit ? <Edit2 className='h-4 w-4' /> : <Lock className='h-4 w-4' />}
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleDelete(discount.id)}
                          className={deleteButtonClass}
                          title={canEdit ? 'Xóa' : 'Không thể xóa'}
                          disabled={!canEdit}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className='flex items-center justify-between p-4 border-t'>
          <div className='text-sm text-muted-foreground'>
            Tổng {filteredDiscounts.length} mã | Trang {pageIndex + 1} / {totalPages || 1}
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' size='sm' disabled={pageIndex === 0} onClick={() => setPageIndex(pageIndex - 1)}>
              Trước
            </Button>
            <Button
              variant='outline'
              size='sm'
              disabled={pageIndex + 1 >= totalPages}
              onClick={() => setPageIndex(pageIndex + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      </Card>

      {/* Dialog Add/Edit */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Chỉnh sửa mã giảm giá' : 'Thêm mã giảm giá mới'}</DialogTitle>
          </DialogHeader>

          <div className='space-y-4'>
            {/* Name */}
            <div>
              <Label htmlFor='name'>Tên khuyến mãi</Label>
              <Input
                id='name'
                placeholder='VD: Khuyến mãi tháng 11'
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Code */}
            <div>
              <Label htmlFor='code'>Mã code</Label>
              <Input
                id='code'
                placeholder='VD: KMAI11'
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                maxLength={20}
              />
            </div>

            {/* Type & Value */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='type'>Loại giảm giá</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as DiscountType })}
                >
                  <SelectTrigger id='type'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DiscountType.FIXED}>Giảm cố định (VNĐ)</SelectItem>
                    <SelectItem value={DiscountType.PERCENT}>Giảm phần trăm (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor='value'>Giá trị</Label>
                <Input
                  id='value'
                  type='number'
                  placeholder={formData.type === DiscountType.FIXED ? 'VD: 50000' : 'VD: 20'}
                  value={formData.value || ''}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                  min='0'
                />
              </div>
            </div>

            {/* Min Order & Max Discount */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='minOrderValue'>Đơn hàng tối thiểu (VNĐ)</Label>
                <Input
                  id='minOrderValue'
                  type='number'
                  placeholder='VD: 100000'
                  value={formData.minOrderValue || ''}
                  onChange={(e) => setFormData({ ...formData, minOrderValue: parseFloat(e.target.value) || 0 })}
                  min='0'
                />
              </div>
              <div>
                <Label htmlFor='maxDiscount'>Giảm tối đa (VNĐ)</Label>
                <Input
                  id='maxDiscount'
                  type='number'
                  placeholder='VD: 500000'
                  value={formData.maxDiscount || ''}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) || 0 })}
                  min='0'
                />
              </div>
            </div>

            {/* Dates */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='startDate'>Ngày bắt đầu</Label>
                <Input
                  id='startDate'
                  type='datetime-local'
                  value={formData.startDate ? new Date(formData.startDate).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value).toISOString() })}
                />
              </div>
              <div>
                <Label htmlFor='endDate'>Ngày kết thúc</Label>
                <Input
                  id='endDate'
                  type='datetime-local'
                  value={formData.endDate ? new Date(formData.endDate).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setFormData({ ...formData, endDate: new Date(e.target.value).toISOString() })}
                />
              </div>
            </div>

            <div className='flex gap-2 justify-end pt-4'>
              <Button variant='outline' onClick={handleCloseDialog}>
                Hủy
              </Button>
              <Button onClick={handleSave} disabled={!isDateValid(formData.startDate || '', formData.endDate || '')}>
                {editingId ? 'Cập nhật' : 'Thêm'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
