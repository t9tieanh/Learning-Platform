import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, ImageIcon, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const PreviewComponent = ({
  courseTitle,
  subtitle,
  tags
}: {
  courseTitle: string
  subtitle: string
  tags: string[] | undefined
}) => {
  return (
    <>
      <Card className='border border-blue-200 shadow-md bg-blue-50'>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2 text-lg font-semibold text-blue-900'>
            <Eye className='h-5 w-5 text-blue-500' />
            <span>Xem trước khóa học</span>
          </CardTitle>
        </CardHeader>

        <CardContent className='space-y-4'>
          <div className='aspect-video bg-blue-100 rounded-lg flex items-center justify-center'>
            <ImageIcon className='h-10 w-10 text-blue-400' />
          </div>

          <div className='space-y-3'>
            <h2 className='text-xl font-semibold text-blue-900 line-clamp-2'>{courseTitle}</h2>
            <p className='text-blue-700 text-sm line-clamp-2'>{subtitle}</p>

            <div className='flex items-center space-x-4 text-sm text-blue-600'>
              <div className='flex items-center space-x-1'>
                <Clock className='h-4 w-4 text-blue-500' />
                <span>42 giờ</span>
              </div>
            </div>

            <div className='flex flex-wrap gap-2'>
              {tags?.map((tag) => (
                <Badge
                  key={tag}
                  variant='outline'
                  className='text-xs rounded-md border-blue-300 text-blue-800 bg-blue-100'
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default PreviewComponent
