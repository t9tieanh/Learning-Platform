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
      <Card className='border-2 border-white ring-1 ring-gray-100 shadow-md bg-white rounded-[32px] overflow-hidden sticky top-8'>
        <CardHeader className='pb-4 border-b border-gray-50'>
          <CardTitle className='flex items-center space-x-2.5 text-[15px] font-bold text-gray-900'>
            <Eye className='h-4.5 w-4.5 text-blue-600' />
            <span>Xem trước khóa học</span>
          </CardTitle>
        </CardHeader>

        <CardContent className='space-y-4'>
          <Tabs defaultValue='avatar' className='space-y-4'>
            <TabsList className='grid h-auto w-full grid-cols-2 bg-blue-400/80 rounded-2xl p-1 shadow-sm'>
              <TabsTrigger value='avatar' className='rounded-xl px-4 py-2.5 text-[11px] font-bold text-secondary-foreground/60 transition-all duration-300 hover:text-secondary-foreground focus:outline-none data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm flex items-center justify-center gap-2'>
                <Camera className='h-3.5 w-3.5' />
                Ảnh đại diện
              </TabsTrigger>
              <TabsTrigger value='intro' className='rounded-xl px-4 py-2.5 text-[11px] font-bold text-secondary-foreground/60 transition-all duration-300 hover:text-secondary-foreground focus:outline-none data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm flex items-center justify-center gap-2'>
                <Video className='h-3.5 w-3.5' />
                Video giới thiệu
              </TabsTrigger>
            </TabsList>
            <TabsContent value='avatar'>
              <div className='aspect-video bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 group'>
                {thumbnailUrl ? (
                  <img src={thumbnailUrl} alt='Thumbnail' className='object-cover w-full h-full transition-transform duration-500 group-hover:scale-105' />
                ) : (
                  <ImageIcon className='h-10 w-10 text-gray-200' />
                )}
              </div>
            </TabsContent>
            <TabsContent value='intro'>
              <div className='aspect-video bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100'>
                {introductoryVideo ? (
                  <video src={`${introductoryVideo}`} controls className='object-contain w-full h-full'>
                    <track kind='captions' />
                  </video>
                ) : (
                  <span className='text-[11px] font-bold text-gray-300 uppercase tracking-wider'>Chưa có video giới thiệu</span>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className='space-y-4 px-2 pt-2'>
            <h2 className='text-[17px] font-black text-gray-900 leading-tight line-clamp-2'>{courseTitle || 'Tiêu đề khóa học của bạn'}</h2>
            <p className='text-gray-500 text-[13.5px] font-medium leading-relaxed line-clamp-3'>{subtitle || 'Thông tin mô tả vắn tắt về nội dung chính của khóa học...'}</p>

            <div className='flex flex-wrap gap-2 pt-2'>
              {tags?.map((tag) => (
                <Badge
                  key={tag.id}
                  variant='secondary'
                  className='text-[10px] rounded-xl border border-gray-100 text-gray-600 bg-gray-50 flex items-center gap-1.5 py-1 px-2.5 font-bold hover:bg-white hover:border-blue-200 transition-all cursor-default'
                >
                  <Avatar className='h-4 w-4 border border-white shadow-sm'>
                    <AvatarImage src={tag.imageUrl} />
                    <AvatarFallback className='text-[8px]'>{tag.name.charAt(0)}</AvatarFallback>
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
