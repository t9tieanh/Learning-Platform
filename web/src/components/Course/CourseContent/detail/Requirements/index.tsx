import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface RequirementProps {
  requirements: string[]
}

const Requirement: React.FC<RequirementProps> = ({ requirements }: RequirementProps) => {
  return (
    <div className='requirement-container max-w-7xl text-left ml-4 mt-6'>
      <ul className='my-6 ml-6 list-disc [&>li]:mt-3 text-sm font-medium text-gray-700'>
        {requirements.map((item, idx) => (
          <div key={idx} className='flex items-start gap-3 mb-3'>
            <Checkbox id={`requirement-${idx}`} defaultChecked checked={true} />
            <div className='grid gap-2'>
              <Label htmlFor={`requirement-${idx}`}>{item}</Label>
            </div>
          </div>
        ))}
      </ul>
    </div>
  )
}

export default Requirement
