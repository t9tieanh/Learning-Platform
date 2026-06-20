import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import learnovaLogo from '@/assets/images/logo1.png'
import notFoundIllustration from '@/assets/images/not_found_illustration.png'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className='relative min-h-screen bg-[#f8f9fa]'>
      <Link
        to='/'
        className='absolute left-6 top-6 text-sm text-primary hover:text-brand-dark hover:underline md:left-10 md:top-8'
      >
        ← Quay lại trang trước
      </Link>

      <div className='flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center'>
        <img src={learnovaLogo} alt='Learnova' className='mb-10 h-9 w-auto' />

        <img
          src={notFoundIllustration}
          alt='Not Found'
          className='h-52 w-auto max-w-[90vw] md:h-60'
        />

        <h1 className='mt-8 text-5xl font-bold tracking-tight text-primary md:text-6xl'>404</h1>
        <p className='mt-3 max-w-md text-base text-muted-foreground md:text-lg mb-8'>
          Trang bạn tìm kiếm không tồn tại.
        </p>

        <Button asChild size='lg' className='rounded-full px-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md'>
          <Link to='/' className='flex items-center gap-2 font-medium'>
            <Home className='h-5 w-5' />
            Quay về trang chủ
          </Link>
        </Button>
      </div>
    </div>
  )
}
