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
      className={`hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
        checked ? 'border-blue-600 bg-blue-50 dark:border-blue-900 dark:bg-blue-950' : 'border-gray-200'
      }`}
    >
      <Checkbox
        id={checkboxId}
        className='hidden' // ← Ẩn hoàn toàn checkbox
        checked={checked}
        onCheckedChange={onChange}
      />
      <div className='grid gap-1.5 font-normal flex'>
        <Avatar>
          <AvatarImage src={imageUri} />
          <AvatarFallback>{label.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className='text-sm leading-none font-medium'>{label}</div>
      </div>
    </Label>
  )
}

export default CustomTag
