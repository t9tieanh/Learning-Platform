import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const CustomTag = ({
  label,
  imageUri,
  checked,
  onChange
}: {
  label: string
  imageUri: string
  checked: boolean
  onChange: (checked: boolean) => void
}) => {
  const checkboxId = `checkbox-${label.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <Label
      htmlFor={checkboxId}
      className={`hover:bg-gray-50 flex flex-col items-center justify-center p-4 rounded-3xl border transition-all duration-300 cursor-pointer text-center gap-3 relative overflow-hidden ${checked ? 'border-blue-600 bg-blue-50/10 shadow-sm' : 'border-gray-100 bg-white'
        }`}
    >
      {checked && (
        <div className='absolute top-2 right-2'>
          <div className='w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center'>
            <div className='w-1.5 h-1.5 bg-white rounded-full' />
          </div>
        </div>
      )}
      <Checkbox
        id={checkboxId}
        className='hidden' // ← Ẩn hoàn toàn checkbox
        checked={checked}
        onCheckedChange={onChange}
      />
      <div className='flex flex-col items-center gap-2'>
        <Avatar className='h-8 w-8 border-2 border-white shadow-sm'>
          <AvatarImage src={imageUri} />
          <AvatarFallback className='text-[10px] font-bold'>{label.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className='text-[11px] font-bold text-gray-700'>{label}</div>
      </div>
    </Label>
  )
}

export default CustomTag
