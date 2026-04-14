import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Edit2, Trash2, Eye, Lock, Percent, TicketPercent, Clock3, Ban } from 'lucide-react'
import { Discount, DiscountType } from '@/types/discount.type'
import { mockDiscounts } from '@/data/mockDiscounts'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const summaryCardClass =
  'rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.22)]'

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

  const tabConfig = {
    upcoming: {
      label: 'Sắp diễn ra',
      activeClass: 'border-sky-200 bg-sky-50 text-sky-700',
      idleClass: 'border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-700'
    },
    valid: {
      label: 'Đang hiệu lực',
      activeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      idleClass: 'border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-700'
    },
    expired: {
      label: 'Đã kết thúc',
      activeClass: 'border-rose-200 bg-rose-50 text-rose-700',
      idleClass: 'border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-700'
    }
  }

  return (
    <div className='space-y-8'>
      <section className='relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-6 py-7 text-white shadow-[0_24px_60px_-34px_rgba(15,23,42,0.55)]'>
        <div className='absolute right-0 top-0 h-40 w-40 rounded-full bg-violet-400/15 blur-3xl' />
        <div className='absolute bottom-0 left-10 h-28 w-28 rounded-full bg-cyan-300/10 blur-3xl' />
        <div className='relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between'>
          <div className='max-w-2xl'>
            <p className='text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200/80'>Promotion center</p>
            <h1 className='mt-3 text-3xl font-semibold tracking-tight'>Quản lý mã giảm giá</h1>
            <p className='mt-2 text-sm leading-6 text-slate-300'>
              Quản lý ưu đãi theo từng trạng thái với bố cục sáng rõ, dễ so sánh và sẵn sàng cho môi trường production.
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()} className='rounded-xl bg-white text-slate-900 hover:bg-slate-100'>
            <Plus className='mr-2 h-4 w-4' />
            Thêm mã giảm giá
          </Button>
        </div>
      </section>

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <Card className={summaryCardClass}>
          <div className='flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600'>
              <TicketPercent className='h-5 w-5' />
            </div>
            <div>
              <p className='text-sm font-medium text-slate-500'>Tổng mã</p>
              <p className='mt-1 text-2xl font-semibold text-slate-950'>{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className={summaryCardClass}>
          <div className='flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600'>
              <Clock3 className='h-5 w-5' />
            </div>
            <div>
              <p className='text-sm font-medium text-slate-500'>Đang hoạt động</p>
              <p className='mt-1 text-2xl font-semibold text-slate-950'>{stats.active}</p>
            </div>
          </div>
        </Card>
        <Card className={summaryCardClass}>
          <div className='flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600'>
              <Ban className='h-5 w-5' />
            </div>
            <div>
              <p className='text-sm font-medium text-slate-500'>Giảm cố định</p>
              <p className='mt-1 text-2xl font-semibold text-slate-950'>{stats.fixed}</p>
            </div>
          </div>
        </Card>
        <Card className={summaryCardClass}>
          <div className='flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600'>
              <Percent className='h-5 w-5' />
            </div>
            <div>
              <p className='text-sm font-medium text-slate-500'>Giảm phần trăm</p>
              <p className='mt-1 text-2xl font-semibold text-slate-950'>{stats.percent}</p>
            </div>
          </div>
        </Card>
      </section>

      <Card className='overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/95 shadow-[0_22px_55px_-36px_rgba(15,23,42,0.24)]'>
        <div className='border-b border-slate-200/80 px-6 py-5'>
          <div className='flex flex-wrap gap-3'>
            {(['upcoming', 'valid', 'expired'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab)
                  setPageIndex(0)
                }}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === tab ? tabConfig[tab].activeClass : tabConfig[tab].idleClass
                }`}
              >
                {tabConfig[tab].label}
              </button>
            ))}
          </div>
        </div>

        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow className='border-b border-slate-200 bg-slate-50/70 hover:bg-slate-50/70'>
                <TableHead className='px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>
                  Mã code
                </TableHead>
                <TableHead className='px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>
                  Tên khuyến mãi
                </TableHead>
                <TableHead className='px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>
                  Loại / Giá trị
                </TableHead>
                <TableHead className='px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>
                  Thời hạn
                </TableHead>
                <TableHead className='px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>
                  Trạng thái
                </TableHead>
                <TableHead className='px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>
                  Hành động
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {pageDiscounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className='px-6 py-16 text-center text-sm text-slate-500'>
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
                    ? 'text-slate-600 hover:bg-sky-50 hover:text-sky-700'
                    : 'cursor-not-allowed text-slate-300'
                  const deleteButtonClass = canEdit
                    ? 'text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                    : 'cursor-not-allowed text-slate-300'

                  return (
                    <TableRow
                      key={discount.id}
                      className='border-b border-slate-100 transition-colors hover:bg-sky-50/40'
                    >
                      <TableCell className='px-6 py-4'>
                        <span className='inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 font-mono text-sm font-semibold text-sky-700'>
                          {discount.code}
                        </span>
                      </TableCell>
                      <TableCell className='px-6 py-4 font-medium text-slate-900'>{discount.name}</TableCell>
                      <TableCell className='px-6 py-4'>
                        <div>
                          <p className='text-sm font-medium text-slate-800'>{typeLabel(discount.type)}</p>
                          <p className='mt-1 text-sm text-slate-500'>
                            {discount.type === DiscountType.FIXED
                              ? `${discount.value.toLocaleString('vi-VN')} VNĐ`
                              : `${discount.value}%`}
                          </p>
                          {discount.maxDiscount && (
                            <p className='mt-1 text-xs text-slate-400'>
                              Tối đa: {discount.maxDiscount.toLocaleString('vi-VN')} VNĐ
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className='px-6 py-4 text-sm'>
                        <p className='font-medium text-slate-700'>{startDate.toLocaleDateString('vi-VN')}</p>
                        <p className='mt-1 text-slate-500'>→ {endDate.toLocaleDateString('vi-VN')}</p>
                      </TableCell>
                      <TableCell className='px-6 py-4'>
                        {isExpired ? (
                          <Badge className='rounded-full border-rose-200 bg-rose-50 px-3 py-1 text-rose-700'>
                            Hết hạn
                          </Badge>
                        ) : !hasStarted ? (
                          <Badge className='rounded-full border-slate-200 bg-slate-100 px-3 py-1 text-slate-700'>
                            Sắp diễn ra
                          </Badge>
                        ) : discount.isActive ? (
                          <Badge className='rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700'>
                            Hoạt động
                          </Badge>
                        ) : (
                          <Badge className='rounded-full border-amber-200 bg-amber-50 px-3 py-1 text-amber-700'>
                            Tạm dừng
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className='px-6 py-4 text-right'>
                        <div className='flex items-center justify-end gap-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleToggleActive(discount.id)}
                            className='rounded-xl text-slate-600 hover:bg-sky-50 hover:text-sky-700'
                            title={discount.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                            disabled={activeTab !== 'upcoming'}
                          >
                            <Eye className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleOpenDialog(discount)}
                            className={`rounded-xl ${editButtonClass}`}
                            title={canEdit ? 'Chỉnh sửa' : 'Không thể chỉnh sửa'}
                            disabled={!canEdit}
                          >
                            {canEdit ? <Edit2 className='h-4 w-4' /> : <Lock className='h-4 w-4' />}
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleDelete(discount.id)}
                            className={`rounded-xl ${deleteButtonClass}`}
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
        </div>

        <div className='flex flex-col gap-4 border-t border-slate-200/80 bg-slate-50/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='text-sm text-slate-500'>
            Tổng {filteredDiscounts.length} mã | Trang {pageIndex + 1} / {totalPages || 1}
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={pageIndex === 0}
              onClick={() => setPageIndex(pageIndex - 1)}
              className='rounded-xl border-slate-200 bg-white'
            >
              Trước
            </Button>
            <Button
              variant='outline'
              size='sm'
              disabled={pageIndex + 1 >= totalPages}
              onClick={() => setPageIndex(pageIndex + 1)}
              className='rounded-xl border-slate-200 bg-white'
            >
              Sau
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className='max-w-2xl rounded-[28px] border border-slate-200/80 bg-white p-0 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.28)]'>
          <DialogHeader className='border-b border-slate-200/80 px-6 py-5'>
            <DialogTitle className='text-xl font-semibold tracking-tight text-slate-950'>
              {editingId ? 'Chỉnh sửa mã giảm giá' : 'Thêm mã giảm giá mới'}
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-5 px-6 py-6'>
            <div className='grid gap-5 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Tên khuyến mãi</Label>
                <Input
                  id='name'
                  placeholder='VD: Khuyến mãi tháng 11'
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className='rounded-xl border-slate-200'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='code'>Mã code</Label>
                <Input
                  id='code'
                  placeholder='VD: KMAI11'
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  maxLength={20}
                  className='rounded-xl border-slate-200'
                />
              </div>
            </div>

            <div className='grid gap-5 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='type'>Loại giảm giá</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as DiscountType })}
                >
                  <SelectTrigger id='type' className='rounded-xl border-slate-200'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DiscountType.FIXED}>Giảm cố định (VNĐ)</SelectItem>
                    <SelectItem value={DiscountType.PERCENT}>Giảm phần trăm (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='value'>Giá trị</Label>
                <Input
                  id='value'
                  type='number'
                  placeholder={formData.type === DiscountType.FIXED ? 'VD: 50000' : 'VD: 20'}
                  value={formData.value || ''}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                  min='0'
                  className='rounded-xl border-slate-200'
                />
              </div>
            </div>

            <div className='grid gap-5 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='minOrderValue'>Đơn hàng tối thiểu (VNĐ)</Label>
                <Input
                  id='minOrderValue'
                  type='number'
                  placeholder='VD: 100000'
                  value={formData.minOrderValue || ''}
                  onChange={(e) => setFormData({ ...formData, minOrderValue: parseFloat(e.target.value) || 0 })}
                  min='0'
                  className='rounded-xl border-slate-200'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='maxDiscount'>Giảm tối đa (VNĐ)</Label>
                <Input
                  id='maxDiscount'
                  type='number'
                  placeholder='VD: 500000'
                  value={formData.maxDiscount || ''}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) || 0 })}
                  min='0'
                  className='rounded-xl border-slate-200'
                />
              </div>
            </div>

            <div className='grid gap-5 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='startDate'>Ngày bắt đầu</Label>
                <Input
                  id='startDate'
                  type='datetime-local'
                  value={formData.startDate ? new Date(formData.startDate).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value).toISOString() })}
                  className='rounded-xl border-slate-200'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='endDate'>Ngày kết thúc</Label>
                <Input
                  id='endDate'
                  type='datetime-local'
                  value={formData.endDate ? new Date(formData.endDate).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setFormData({ ...formData, endDate: new Date(e.target.value).toISOString() })}
                  className='rounded-xl border-slate-200'
                />
              </div>
            </div>

            <div className='flex justify-end gap-2 pt-2'>
              <Button variant='outline' onClick={handleCloseDialog} className='rounded-xl border-slate-200'>
                Hủy
              </Button>
              <Button
                onClick={handleSave}
                disabled={!isDateValid(formData.startDate || '', formData.endDate || '')}
                className='rounded-xl bg-slate-950 text-white hover:bg-slate-800'
              >
                {editingId ? 'Cập nhật' : 'Thêm'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
