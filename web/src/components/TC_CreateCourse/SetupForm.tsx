import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Settings,
  Shield,
  Bell,
  MessageSquare,
  Award,
  Users,
  CheckCircle,
  AlertCircle,
  Eye,
  Lock,
  Globe
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const SetupForm = () => {
  const [allowComments, setAllowComments] = useState(true)
  const [allowDownloads, setAllowDownloads] = useState(false)
  const [enableCertificate, setEnableCertificate] = useState(true)
  const [enableQA, setEnableQA] = useState(true)
  const [allowReviews, setAllowReviews] = useState(true)
  const [autoEnroll, setAutoEnroll] = useState(false)
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [congratsMessage, setCongratsMessage] = useState('')

  const setupChecklist = [
    {
      title: 'Nội dung khóa học đã được tải lên',
      description: 'Tất cả video và tài liệu đã sẵn sàng',
      completed: true,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Trang giới thiệu khóa học',
      description: 'Tiêu đề, mô tả và ảnh bìa đã được thiết lập',
      completed: true,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Cấu hình giá',
      description: 'Giá và khuyến mãi của khóa học đã được thiết lập',
      completed: true,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Cài đặt khóa học',
      description: 'Cấu hình chính sách và tính năng của khóa học',
      completed: false,
      icon: AlertCircle,
      color: 'text-yellow-600'
    }
  ]

  return (
    <div className='max-w-6xl space-y-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-4'>Cài đặt khóa học</h1>
        <p className='text-muted-foreground text-lg mb-6'>
          Cấu hình cài đặt, chính sách và các tính năng tương tác cho khóa học. 
          Hoàn thành mục này để có thể xuất bản khóa học.
        </p>
      </div>

      <div className='grid lg:grid-cols-2 gap-8'>
        {/* Settings */}
        <div className='space-y-6'>
          <Tabs defaultValue='interactions' className='space-y-6'>
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='interactions'>Tương tác</TabsTrigger>
              <TabsTrigger value='policies'>Chính sách</TabsTrigger>
              <TabsTrigger value='messages'>Tin nhắn</TabsTrigger>
            </TabsList>

            <TabsContent value='interactions' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center space-x-2'>
                    <MessageSquare className='h-5 w-5 text-primary' />
                    <span>Tương tác với học viên</span>
                  </CardTitle>
                  <p className='text-sm text-muted-foreground'>
                    Kiểm soát cách học viên tương tác với nội dung khóa học
                  </p>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h4 className='font-medium'>Bật Hỏi & Đáp</h4>
                      <p className='text-sm text-muted-foreground'>
                        Cho phép học viên đặt câu hỏi về nội dung khóa học
                      </p>
                    </div>
                    <Switch checked={enableQA} onCheckedChange={setEnableQA} />
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <h4 className='font-medium'>Cho phép bình luận</h4>
                      <p className='text-sm text-muted-foreground'>
                        Cho phép học viên bình luận về bài giảng và thảo luận
                      </p>
                    </div>
                    <Switch checked={allowComments} onCheckedChange={setAllowComments} />
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <h4 className='font-medium'>Đánh giá khóa học</h4>
                      <p className='text-sm text-muted-foreground'>Cho phép học viên chấm điểm và đánh giá</p>
                    </div>
                    <Switch checked={allowReviews} onCheckedChange={setAllowReviews} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center space-x-2'>
                    <Award className='h-5 w-5 text-primary' />
                    <span>Tính năng khóa học</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h4 className='font-medium'>Chứng chỉ hoàn thành</h4>
                      <p className='text-sm text-muted-foreground'>
                        Cấp chứng chỉ khi học viên hoàn thành khóa học
                      </p>
                    </div>
                    <Switch checked={enableCertificate} onCheckedChange={setEnableCertificate} />
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <h4 className='font-medium'>Tải tài nguyên</h4>
                      <p className='text-sm text-muted-foreground'>Cho phép học viên tải xuống tài liệu khóa học</p>
                    </div>
                    <Switch checked={allowDownloads} onCheckedChange={setAllowDownloads} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='policies' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center space-x-2'>
                    <Shield className='h-5 w-5 text-primary' />
                    <span>Chính sách khóa học</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h4 className='font-medium'>Tự động ghi danh</h4>
                      <p className='text-sm text-muted-foreground'>Tự động ghi danh học viên sau khi thanh toán</p>
                    </div>
                    <Switch checked={autoEnroll} onCheckedChange={setAutoEnroll} />
                  </div>

                  <div className='p-4 bg-muted/50 rounded-lg'>
                    <h4 className='font-medium mb-2'>Chế độ hiển thị khóa học</h4>
                    <div className='space-y-2'>
                      <label className='flex items-center space-x-2 text-sm'>
                        <input type='radio' name='visibility' defaultChecked />
                        <Globe className='h-4 w-4' />
                        <span>Công khai - Ai cũng có thể tìm và ghi danh</span>
                      </label>
                      <label className='flex items-center space-x-2 text-sm'>
                        <input type='radio' name='visibility' />
                        <Lock className='h-4 w-4' />
                        <span>Riêng tư - Chỉ người có link mới có thể ghi danh</span>
                      </label>
                    </div>
                  </div>

                  <div className='p-4 border border-yellow-200 bg-yellow-50 rounded-lg'>
                    <div className='flex items-start space-x-2'>
                      <AlertCircle className='h-4 w-4 text-yellow-600 mt-0.5' />
                      <div className='text-sm'>
                        <p className='font-medium text-yellow-900'>Kiểm duyệt khóa học</p>
                        <p className='text-yellow-700 mt-1'>
                          Khóa học sẽ được kiểm duyệt trước khi xuất bản để đảm bảo đáp ứng tiêu chuẩn chất lượng.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='messages' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center space-x-2'>
                    <Bell className='h-5 w-5 text-primary' />
                    <span>Tin nhắn đến học viên</span>
                  </CardTitle>
                  <p className='text-sm text-muted-foreground'>
                    Tùy chỉnh tin nhắn gửi cho học viên vào các thời điểm quan trọng
                  </p>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div>
                    <Label htmlFor='welcome'>Tin nhắn chào mừng (tùy chọn)</Label>
                    <Textarea
                      id='welcome'
                      placeholder='Viết lời chào mừng cho học viên mới...'
                      value={welcomeMessage}
                      onChange={(e) => setWelcomeMessage(e.target.value)}
                      className='mt-2'
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor='congrats'>Tin nhắn hoàn thành khóa học (tùy chọn)</Label>
                    <Textarea
                      id='congrats'
                      placeholder='Chúc mừng học viên khi họ hoàn thành khóa học...'
                      value={congratsMessage}
                      onChange={(e) => setCongratsMessage(e.target.value)}
                      className='mt-2'
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Checklist & Preview */}
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <CheckCircle className='h-5 w-5 text-green-600' />
                <span>Danh sách xuất bản</span>
              </CardTitle>
              <p className='text-sm text-muted-foreground'>Hoàn thành tất cả mục để xuất bản khóa học</p>
            </CardHeader>
            <CardContent className='space-y-4'>
              {setupChecklist.map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={index} className='flex items-start space-x-3 p-3 rounded-lg border'>
                    <Icon className={`h-5 w-5 mt-0.5 ${item.color}`} />
                    <div className='flex-1'>
                      <h4 className='font-medium'>{item.title}</h4>
                      <p className='text-sm text-muted-foreground'>{item.description}</p>
                    </div>
                    {item.completed && (
                      <Badge variant='secondary' className='text-xs'>
                        Hoàn thành
                      </Badge>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tóm tắt khóa học</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='text-center p-3 bg-muted/50 rounded-lg'>
                  <div className='text-lg font-bold'>15</div>
                  <div className='text-xs text-muted-foreground'>Bài giảng</div>
                </div>
                <div className='text-center p-3 bg-muted/50 rounded-lg'>
                  <div className='text-lg font-bold'>3.5h</div>
                  <div className='text-xs text-muted-foreground'>Thời lượng</div>
                </div>
                <div className='text-center p-3 bg-muted/50 rounded-lg'>
                  <div className='text-lg font-bold'>$59.99</div>
                  <div className='text-xs text-muted-foreground'>Giá</div>
                </div>
                <div className='text-center p-3 bg-muted/50 rounded-lg'>
                  <div className='text-lg font-bold'>En</div>
                  <div className='text-xs text-muted-foreground'>Ngôn ngữ</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sẵn sàng xuất bản?</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
                <div className='flex items-start space-x-2'>
                  <CheckCircle className='h-4 w-4 text-green-600 mt-0.5' />
                  <div className='text-sm'>
                    <p className='font-medium text-green-900'>Gần xong rồi!</p>
                    <p className='text-green-700 mt-1'>
                      Hoàn tất cài đặt khóa học để gửi kiểm duyệt.
                    </p>
                  </div>
                </div>
              </div>
              <Button
                className='w-full bg-primary hover:bg-primary/90'
                size='lg'
                disabled={!setupChecklist.every((item) => item.completed)}
              >
                Gửi kiểm duyệt
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex justify-between pt-6 border-t'>
        <Button variant='outline'>Quay lại</Button>
        <div className='space-x-3'>
          <Button variant='outline'>Lưu nháp</Button>
          <Button className='bg-primary hover:bg-primary/90'>Lưu & Tiếp tục</Button>
        </div>
      </div>
    </div>
  )
}

export default SetupForm
