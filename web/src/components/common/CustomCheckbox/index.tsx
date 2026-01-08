import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import React from 'react'

interface CustomCheckboxProps {
  id: string
  className?: string
  label: string
  checked?: boolean
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const CustomCheckbox = ({ className, id, label, checked, value, onChange, ...rest }: CustomCheckboxProps) => {
  return (
    <div className={`flex items-center gap-3 ${className ?? ''}`}>
      <Checkbox
        id={id}
        checked={checked}
        value={value}
        onCheckedChange={(val) => {
          if (onChange) {
            // Tạo event giả lập với checked là boolean
            onChange({
              target: { checked: !!val, value: value ?? '', id }
            } as React.ChangeEvent<HTMLInputElement>)
          }
        }}
        {...rest}
      />
      <Label htmlFor={id} className={`text-gray-700 font-normal ${className ?? ''}`}>
        {label}
      </Label>
    </div>
  )
}

export default CustomCheckbox
