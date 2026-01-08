import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, ImageIcon, Clock, Camera, Video } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

const PreviewComponent = ({
  courseTitle,
  subtitle,
  tags,
  thumbnailUrl,
  introductoryVideo
}: {
  courseTitle: string
  subtitle: string
  tags: { id: string; name: string; imageUrl: string }[] | undefined
  thumbnailUrl: string | undefined
  introductoryVideo?: string | undefined
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
          <Tabs defaultValue='avatar' className='space-y-3'>
            <TabsList>
              <TabsTrigger value='avatar'>
                <Camera className='h-5 w-5 text-blue-500' />
                Ảnh đại diện
              </TabsTrigger>
              <TabsTrigger value='intro'>
                <Video className='h-5 w-5 text-blue-500' />
                Video giới thiệu
              </TabsTrigger>
            </TabsList>
            <TabsContent value='avatar'>
              <div className='aspect-video bg-blue-100 rounded-lg flex items-center justify-center'>
                {thumbnailUrl ? (
                  <img src={thumbnailUrl} alt='Thumbnail' className='object-cover w-full h-full rounded-lg' />
                ) : (
                  <ImageIcon className='h-10 w-10 text-blue-400' />
                )}
              </div>
            </TabsContent>
            <TabsContent value='intro'>
              <div className='aspect-video bg-blue-100 rounded-lg flex items-center justify-center'>
                {introductoryVideo ? (
                  <video
                    src={`http://${introductoryVideo}`}
                    controls
                    className='object-contain w-full h-full rounded-lg'
                  >
                    <track kind='captions' />
                  </video>
                ) : (
                  <span className='text-sm text-blue-500'>Chưa có video giới thiệu</span>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className='space-y-3'>
            <h2 className='text-xl font-semibold text-blue-900 line-clamp-2'>{courseTitle}</h2>
            <p className='text-blue-700 text-sm line-clamp-2'>{subtitle}</p>

            {/* <div className='flex items-center space-x-4 text-sm text-blue-600'>
              <div className='flex items-center space-x-1'>
                <Clock className='h-4 w-4 text-blue-500' />
                <span>42 giờ</span>
              </div>
            </div> */}

            <div className='flex flex-wrap gap-2'>
              {tags?.map((tag) => (
                <Badge
                  key={tag.id}
                  variant='outline'
                  className='text-xs rounded-md border-blue-300 text-blue-800 bg-blue-100 flex items-center'
                >
                  <Avatar>
                    <AvatarImage src={tag.imageUrl} />
                    <AvatarFallback>{tag.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {tag.name}
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
