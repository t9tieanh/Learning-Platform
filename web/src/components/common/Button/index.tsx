import React from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Loader2Icon } from 'lucide-react'
import { VariantProps } from 'class-variance-authority'

type CustomButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    label?: string | React.ReactNode
    icon?: React.ReactNode
    iconPosition?: 'left' | 'right'
    isLoader?: boolean
  }

// eslint-disable-next-line react/prop-types
const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  icon,
  iconPosition = 'left',
  className,
  isLoader,
  children,
  ...rest
}) => {
  return (
    <Button className={className} disabled={rest.disabled || isLoader} {...rest}>
      {isLoader && <Loader2Icon className='animate-spin mr-2' />}
      {icon && iconPosition === 'left' && <span className={label ? 'mr-2' : ''}>{icon}</span>}
      {label}
      {icon && iconPosition === 'right' && <span className={label ? 'ml-2' : ''}>{icon}</span>}
      {children}
    </Button>
  )
}

export default CustomButton
