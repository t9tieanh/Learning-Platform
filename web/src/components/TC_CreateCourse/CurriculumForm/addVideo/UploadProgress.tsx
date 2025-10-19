import { Progress as ProgressShadcn } from '@/components/ui/progress'

type Props = {
  progress: number
  title?: string
  onCancel?: () => void
}

export default function Progress({ progress, title = 'Uploading', onCancel }: Props) {
  return (
    <div className='w-full p-4 bg-white rounded-md shadow-sm'>
      <div className='flex items-center justify-between mb-2'>
        <div className='text-sm font-medium text-gray-700'>{title}</div>
        <div className='text-sm text-gray-600'>{Math.round(progress)}%</div>
      </div>

      <ProgressShadcn className='progressIndicator' value={progress} />
    </div>
  )
}
