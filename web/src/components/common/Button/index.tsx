import { Button } from '@/components/ui/button'
import { Loader2Icon } from 'lucide-react'

const CustomButton = ({
  label,
  icon,
  className,
  variant,
  onClick,
  isLoader,
}: {
  label?: string
  icon?: React.ReactNode
  className?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variant?: any
  onClick?: () => void
  isLoader?: boolean
}) => {
  return (
    <>
      <Button className={className} onClick={onClick} variant={variant}>
        {isLoader && <Loader2Icon className='animate-spin' />}
        {icon && <span className='mr-2'>{icon}</span>}
        &nbsp;
        {label}
      </Button>
    </>
  )
}

export default CustomButton
