import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Upload, Play, Clock, CheckCircle, AlertCircle, Download, Eye, MoreVertical, Trash2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface VideoFile {
  id: string
  name: string
  duration: string
  size: string
  status: 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  quality: 'HD' | 'SD'
  uploadDate: string
}

const FilmEditForm = () => {
  const [videos, setVideos] = useState<VideoFile[]>([
    {
      id: '1',
      name: '01_Gioi_thieu_Chao_mung_den_khoa_hoc.mp4',
      duration: '2:30',
      size: '45.2 MB',
      status: 'completed',
      progress: 100,
      quality: 'HD',
      uploadDate: '2024-01-15'
    },
    {
      id: '2',
      name: '02_Tong_quan_Cau_truc_khoa_hoc.mp4',
      duration: '5:15',
      size: '98.7 MB',
      status: 'processing',
      progress: 75,
      quality: 'HD',
      uploadDate: '2024-01-15'
    },
    {
      id: '3',
      name: '03_Bat_dau_Cai_dat.mp4',
      duration: '8:42',
      size: '156.3 MB',
      status: 'uploading',
      progress: 45,
      quality: 'HD',
      uploadDate: '2024-01-15'
    }
  ])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className='h-4 w-4 text-green-600' />
      case 'processing':
        return <Clock className='h-4 w-4 text-yellow-600' />
      case 'uploading':
        return <Upload className='h-4 w-4 text-blue-600' />
      case 'error':
        return <AlertCircle className='h-4 w-4 text-red-600' />
      default:
        return <Clock className='h-4 w-4' />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Hoàn tất'
      case 'processing':
        return 'Đang xử lý'
      case 'uploading':
        return 'Đang tải lên'
      case 'error':
        return 'Lỗi'
      default:
        return 'Không rõ'
    }
  }

  const getTotalStats = () => {
    const completed = videos.filter((v) => v.status === 'completed').length
    const totalSize = videos.reduce((acc, video) => {
      const sizeNum = parseFloat(video.size)
      return acc + sizeNum
    }, 0)
    const totalDuration = videos.reduce((acc, video) => {
      const [min, sec] = video.duration.split(':').map(Number)
      return acc + min * 60 + sec
    }, 0)

    const hours = Math.floor(totalDuration / 3600)
    const minutes = Math.floor((totalDuration % 3600) / 60)

    return {
      completed,
      total: videos.length,
      totalSize: totalSize.toFixed(1),
      totalDuration: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
    }
  }

  const stats = getTotalStats()

  return (
    <div className='max-w-6xl space-y-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-4'>Quay & chỉnh sửa</h1>
        <p className='text-muted-foreground text-lg mb-6'>
          Đã đến lúc xây dựng khóa học của bạn! Hãy quay và tải lên các video bài giảng. Bạn có thể tải lên video định dạng
          MP4 với dung lượng tối đa 4GB mỗi tệp. Hệ thống sẽ tự động tối ưu video để mang lại trải nghiệm tốt nhất.
        </p>

        <div className='flex space-x-6 text-sm'>
          <div className='flex items-center space-x-2'>
            <span className='font-medium'>
              {stats.completed}/{stats.total}
            </span>
            <span className='text-muted-foreground'>video đã sẵn sàng</span>
          </div>
          <div className='flex items-center space-x-2'>
            <span className='font-medium'>{stats.totalDuration}</span>
            <span className='text-muted-foreground'>tổng thời lượng</span>
          </div>
          <div className='flex items-center space-x-2'>
            <span className='font-medium'>{stats.totalSize} MB</span>
            <span className='text-muted-foreground'>tổng dung lượng</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue='upload' className='space-y-6'>
        <TabsList>
          <TabsTrigger value='upload'>Tải video</TabsTrigger>
          <TabsTrigger value='library'>Thư viện video</TabsTrigger>
          <TabsTrigger value='bulk'>Tải hàng loạt</TabsTrigger>
        </TabsList>

        <TabsContent value='upload' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Tải video mới</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer'>
                <Upload className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
                <h3 className='text-lg font-medium mb-2'>Tải tệp video của bạn</h3>
                <p className='text-muted-foreground mb-4'>
                  Kéo và thả video, hoặc bấm để chọn. Hỗ trợ MP4, MOV, AVI. Tối đa 4GB mỗi tệp.
                </p>
                <Button className='bg-primary hover:bg-primary/90'>Chọn tệp</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mẹo chất lượng video</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <h4 className='font-medium'>Cài đặt khuyến nghị</h4>
                  <ul className='text-sm text-muted-foreground space-y-1'>
                    <li>• Độ phân giải: 1920x1080 (HD) hoặc cao hơn</li>
                    <li>• Tốc độ khung hình: 30fps</li>
                    <li>• Định dạng: MP4 (H.264)</li>
                    <li>• Âm thanh: 44.1kHz, stereo</li>
                  </ul>
                </div>
                <div className='space-y-2'>
                  <h4 className='font-medium'>Thực hành tốt</h4>
                  <ul className='text-sm text-muted-foreground space-y-1'>
                    <li>• Sử dụng ánh sáng tốt và âm thanh rõ</li>
                    <li>• Giữ video dưới 20 phút</li>
                    <li>• Dùng quy tắc đặt tên thống nhất</li>
                    <li>• Kiểm tra thiết bị trước khi quay</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='library' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Thư viện video</CardTitle>
              <p className='text-sm text-muted-foreground'>Quản lý các video đã tải lên</p>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {videos.map((video) => (
                  <div key={video.id} className='flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50'>
                    <div className='flex-shrink-0'>
                      <div className='w-16 h-12 bg-muted rounded flex items-center justify-center'>
                        <Play className='h-6 w-6 text-muted-foreground' />
                      </div>
                    </div>

                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center space-x-2 mb-1'>
                        <h4 className='font-medium truncate'>{video.name}</h4>
                        <Badge variant='outline' className='text-xs'>
                          {video.quality}
                        </Badge>
                      </div>
                      <div className='flex items-center space-x-4 text-sm text-muted-foreground'>
                        <span>{video.duration}</span>
                        <span>{video.size}</span>
                        <span>Đã tải lên {video.uploadDate}</span>
                      </div>
                      {video.status !== 'completed' && (
                        <div className='mt-2'>
                          <Progress value={video.progress} className='h-2' />
                          <div className='flex justify-between text-xs text-muted-foreground mt-1'>
                            <span>{getStatusText(video.status)}</span>
                            <span>{video.progress}%</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className='flex items-center space-x-2'>
                      {getStatusIcon(video.status)}
                      <span className='text-sm font-medium'>{getStatusText(video.status)}</span>
                    </div>

                    <div className='flex items-center space-x-1'>
                      {video.status === 'completed' && (
                        <>
                          <Button variant='ghost' size='icon'>
                            <Eye className='h-4 w-4' />
                          </Button>
                          <Button variant='ghost' size='icon'>
                            <Download className='h-4 w-4' />
                          </Button>
                        </>
                      )}
                      <Button variant='ghost' size='icon'>
                        <MoreVertical className='h-4 w-4' />
                      </Button>
                      <Button variant='ghost' size='icon' className='text-red-600 hover:text-red-700'>
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='bulk' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Tải hàng loạt</CardTitle>
              <p className='text-sm text-muted-foreground'>
                Tải nhiều video cùng lúc với việc sắp xếp tự động
              </p>
            </CardHeader>
            <CardContent>
              <div className='border-2 border-dashed border-border rounded-lg p-12 text-center'>
                <Upload className='h-16 w-16 mx-auto mb-4 text-muted-foreground' />
                <h3 className='text-xl font-medium mb-2'>Tải nhiều video</h3>
                <p className='text-muted-foreground mb-6'>
                  Chọn nhiều tệp video để tải lên cùng lúc. Chúng sẽ được tự động sắp xếp và xử lý.
                </p>
                <Button size='lg' className='bg-primary hover:bg-primary/90'>
                  Chọn nhiều tệp
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className='flex justify-between pt-6 border-t'>
        <Button variant='outline'>Trước</Button>
        <div className='space-x-3'>
          <Button variant='outline'>Lưu nháp</Button>
          <Button className='bg-primary hover:bg-primary/90'>Tiếp tục</Button>
        </div>
      </div>
    </div>
  )
}

export default FilmEditForm
