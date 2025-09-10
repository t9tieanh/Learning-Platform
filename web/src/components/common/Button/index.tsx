import { Button } from '@/components/ui/button'
import { Loader2Icon } from 'lucide-react'
import React from 'react'

type CustomButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string
  icon?: React.ReactNode
  isLoader?: boolean
}

// eslint-disable-next-line react/prop-types
const CustomButton: React.FC<CustomButtonProps> = ({ label, icon, className, isLoader, children, ...rest }) => {
  return (
    <Button className={className} disabled={rest.disabled || isLoader} {...rest}>
      {isLoader && <Loader2Icon className='animate-spin' />}
      {icon && <span>{icon}</span>}
      {label}
      {children}
    </Button>
  )
}

export default CustomButton
