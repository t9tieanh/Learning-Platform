import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'

type CustomInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
}

const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(({ label, className, ...rest }, ref) => {
  return (
    <div className='input-container'>
      {label && <Label htmlFor={rest.id || rest.name}>{label}</Label>}
      <Input ref={ref} className={`input-field ${className ?? ''}`} {...rest} />
    </div>
  )
})

export default CustomInput
