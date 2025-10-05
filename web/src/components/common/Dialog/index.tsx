import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface CustomDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  title: React.ReactNode
  description?: string
  children?: React.ReactNode
  className?: string
}

export default function CustomDialog({ open, setOpen, title, description, children, className }: CustomDialogProps) {
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={`${className} max-w-lg`}>
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
