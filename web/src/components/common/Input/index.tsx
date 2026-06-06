import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'

type CustomInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  className?: string
}

// eslint-disable-next-line
const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(({ label, className, ...rest }, ref) => {
  return (
    <div className='input-container space-y-2'>
      {label && (
        <Label className='mb-2 inline-block' htmlFor={rest.id || rest.name}>
          {label}
        </Label>
      )}
      <Input ref={ref} className={`input-field h-12 rounded-2xl px-4 ${className ?? ''}`} {...rest} />
    </div>
  )
})

export default CustomInput
