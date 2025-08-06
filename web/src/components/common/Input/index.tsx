/* eslint-disable import/no-unresolved */
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const CustomInput = ({
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  label?: string
  type?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
}) => {
  return (
    <div className='input-container'>
      {label && (
        <Label htmlFor={label}>
          {label}
        </Label>
      )}
      <Input
        type={type}
        id={label}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className='input-field'
      />
    </div>
  )
}

export default CustomInput
