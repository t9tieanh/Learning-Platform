import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-background'>
      <h1 className='text-6xl font-bold text-primary mb-4'>404</h1>
      <p className='text-xl text-muted-foreground mb-8'>Trang bạn tìm kiếm không tồn tại.</p>
      <Button asChild>
        <Link to='/'>Quay về trang chủ</Link>
      </Button>
    </div>
  )
}
