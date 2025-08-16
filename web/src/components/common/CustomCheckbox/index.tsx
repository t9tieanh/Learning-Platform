import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface CustomCheckboxProps {
  id: string
  className?: string
  label: string
}

const CustomCheckbox = ({ className, id, label }: CustomCheckboxProps) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Checkbox id={id} />
      <Label htmlFor={id} className='text-gray-700 font-normal'>
        {label}
      </Label>
    </div>
  )
}

export default CustomCheckbox
