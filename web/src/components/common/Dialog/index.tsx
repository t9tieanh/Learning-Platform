import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface CustomDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  title: React.ReactNode
  description?: string
  children?: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export default function CustomDialog({
  open,
  setOpen,
  title,
  description,
  children,
  className,
  size = 'md'
}: CustomDialogProps) {
  const sizeClassMap: Record<NonNullable<CustomDialogProps['size']>, string> = {
    sm: 'max-w-md sm:max-w-md',
    md: 'max-w-lg sm:max-w-lg',
    lg: 'max-w-3xl sm:max-w-3xl',
    xl: 'max-w-5xl sm:max-w-5xl',
    full: 'w-full max-w-none sm:w-full sm:max-w-none'
  }

  const sizeClass = sizeClassMap[size]

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={`${className ?? ''} ${sizeClass}`}>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-1'>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className='my-4'> {children}</div>
        </DialogContent>
      </Dialog>
    </>
  )
}
