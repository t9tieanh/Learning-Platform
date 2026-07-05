import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface CustomDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  title?: React.ReactNode
  description?: string
  children?: React.ReactNode
  className?: string
  contentClassName?: string
  hideHeader?: boolean
  noPadding?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
}

export default function CustomDialog({
  open,
  setOpen,
  title,
  description,
  children,
  className,
  contentClassName,
  hideHeader = false,
  noPadding = false,
  size = 'md',
  showCloseButton = true
}: CustomDialogProps) {
  const sizeClassMap: Record<NonNullable<CustomDialogProps['size']>, string> = {
    sm: 'max-w-md sm:max-w-md',
    md: 'max-w-lg sm:max-w-lg',
    lg: 'max-w-3xl sm:max-w-3xl',
    xl: 'max-w-5xl sm:max-w-5xl',
    full: 'w-[70vw] max-w-[70vw] sm:w-[70vw] sm:max-w-[70vw]'
  }

  const sizeClass = sizeClassMap[size]

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={showCloseButton}
          className={cn(
            sizeClass,
            noPadding ? 'p-0' : '',
            className
          )}
        >
          {!hideHeader && (
            <DialogHeader>
              <DialogTitle className='flex items-center gap-1'>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
          )}
          <div className={cn(!noPadding && 'my-4', contentClassName)}> {children}</div>
        </DialogContent>
      </Dialog>
    </>
  )
}
