const formatPrice = (value?: number | string) => {
  if (value === null || value === undefined || value === '') return '0 VND'
  const n = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(n)) return '0 VND'
  return `${new Intl.NumberFormat('vi-VN').format(n)} VND`
}

export default formatPrice
