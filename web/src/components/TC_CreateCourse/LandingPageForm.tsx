import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Upload, Image as ImageIcon, Eye, Star, Users, Clock, X, Target, Award } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DynamicListInput from './CourseGoalsForm'

const configs: FieldConfig[] = [
  {
    key: 'learningObjectives',
    label: 'Học viên sẽ học được gì?',
    description: 'Ít nhất 4 mục tiêu.',
    icon: <Target className='h-5 w-5 text-primary' />,
    placeholder: 'Ví dụ: Hiểu cách quản lý dự án'
  },
  {
    key: 'prerequisites',
    label: 'Yêu cầu trước khi học',
    description: 'Kỹ năng/kiến thức cần có.',
    icon: <Award className='h-5 w-5 text-primary' />,
    placeholder: 'Ví dụ: Không cần kinh nghiệm lập trình'
  },
  {
    key: 'audience',
    label: 'Đối tượng học viên',
    description: 'Khoá học này phù hợp cho ai?',
    icon: <Users className='h-5 w-5 text-primary' />,
    placeholder: 'Ví dụ: Sinh viên CNTT năm cuối'
  }
]

const LandingPageForm = () => {
  const [courseTitle, setCourseTitle] = useState('Khóa học Web Development Bootcamp hoàn chỉnh')
  const [subtitle, setSubtitle] = useState(
    'Học HTML, CSS, JavaScript, React, Node.js và xây dựng các ứng dụng web tuyệt vời từ con số 0'
  )
  const [description, setDescription] = useState('')
  const [language, setLanguage] = useState('english')
  const [category, setCategory] = useState('development')
  const [tags, setTags] = useState(['JavaScript', 'React', 'Web Development', 'Frontend'])
  const [newTag, setNewTag] = useState('')

  const [learnItems, setLearnItems] = useState<string[]>([])
  const [requirements, setRequirements] = useState<string[]>([])

  const addTag = () => {
    if (newTag && !tags.includes(newTag) && tags.length < 10) {
      setTags([...tags, newTag])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div className='max-w-6xl mx-auto space-y-10 px-4'>
      <div className='bg-blue-950 text-white rounded-xl shadow-lg p-6'>
        <h1 className='text-2xl font-semibold mb-3 text-blue-300'>Trang giới thiệu khóa học</h1>
        <p className='text-blue-100 text-base leading-relaxed'>
          Trang giới thiệu khóa học rất quan trọng để bạn thành công trên Udemy. Nếu làm tốt, nó cũng giúp bạn tăng khả
          năng hiển thị trên các công cụ tìm kiếm như Google. Khi hoàn thành phần này, hãy nghĩ đến việc tạo một trang
          giới thiệu hấp dẫn cho thấy lý do tại sao học viên nên đăng ký khóa học của bạn.
        </p>
      </div>

      <div className='grid lg:grid-cols-2 gap-10'>
        {/* Form Section */}
        <div className='space-y-8'>
          <Tabs defaultValue='basic' className='space-y-6'>
            <TabsList className='grid h-auto w-full grid-cols-3 bg-blue-200 rounded-xl p-1'>
              <TabsTrigger
                value='basic'
                className='rounded-lg px-3 py-2 text-sm font-medium text-blue-900 transition-all duration-200 
      hover:bg-blue-300 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400
      data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md'
              >
                Thông tin cơ bản
              </TabsTrigger>

              <TabsTrigger
                value='media'
                className='rounded-lg px-3 py-2 text-sm font-medium text-blue-900 transition-all duration-200 
      hover:bg-blue-300 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400
      data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md'
              >
                Hình ảnh & Video
              </TabsTrigger>

              <TabsTrigger
                value='seo'
                className='rounded-lg px-3 py-2 text-sm font-medium text-blue-900 transition-all duration-200 
      hover:bg-blue-300 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400
      data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md'
              >
                SEO & Thẻ
              </TabsTrigger>
            </TabsList>

            <TabsContent value='basic' className='space-y-6'>
              <Card className='border border-blue-200 shadow-sm bg-blue-50'>
                <CardHeader className='bg-blue-200/40 rounded-t-lg'>
                  <CardTitle className='text-lg font-medium text-blue-900'>Thông tin khóa học</CardTitle>
                </CardHeader>
                <CardContent className='space-y-5'>
                  <div>
                    <Label htmlFor='title' className='text-blue-900'>
                      Tiêu đề khóa học *
                    </Label>
                    <Input
                      id='title'
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                      placeholder='Nhập tiêu đề khóa học'
                      className='mt-2 border-blue-300 focus:ring-blue-300'
                    />
                    <div className='text-xs text-blue-700 mt-1'>{courseTitle.length}/60 ký tự</div>
                  </div>

                  <div>
                    <Label htmlFor='subtitle' className='text-blue-900'>
                      Mô tả ngắn khóa học *
                    </Label>
                    <Textarea
                      id='subtitle'
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder='Nhập phụ đề khóa học'
                      className='mt-2 border-blue-300 focus:ring-blue-300'
                      rows={3}
                    />
                    <div className='text-xs text-blue-700 mt-1'>{subtitle.length}/120 ký tự</div>
                  </div>
                </CardContent>
              </Card>

              <Card className='border border-blue-200 shadow-sm bg-blue-50'>
                <CardHeader className='bg-blue-200/40 rounded-t-lg'>
                  <CardTitle className='text-lg font-medium text-blue-900'>Mô tả chi tiết khóa học</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    id='description'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder='Nhập mô tả khóa học'
                    className='mt-2 border-blue-300 focus:ring-blue-300 min-h-32'
                    rows={8}
                  />
                </CardContent>
              </Card>

              <Card className='border border-blue-200 shadow-sm bg-blue-50'>
                <CardHeader className='bg-blue-200/40 rounded-t-lg'>
                  <CardTitle className='text-lg font-medium text-blue-900'>Thông tin cơ bản</CardTitle>
                </CardHeader>
                <CardContent className='grid md:grid-cols-2 gap-6'>
                  <div>
                    <Label className='text-blue-900'>Ngôn ngữ *</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className='mt-2 border-blue-300 focus:ring-blue-300'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className='bg-blue-50'>
                        <SelectItem value='english'>Tiếng Anh</SelectItem>
                        <SelectItem value='spanish'>Tiếng Tây Ban Nha</SelectItem>
                        <SelectItem value='french'>Tiếng Pháp</SelectItem>
                        <SelectItem value='german'>Tiếng Đức</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className='text-blue-900'>Danh mục *</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className='mt-2 border-blue-300 focus:ring-blue-300'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className='bg-blue-50'>
                        <SelectItem value='development'>Phát triển</SelectItem>
                        <SelectItem value='business'>Kinh doanh</SelectItem>
                        <SelectItem value='design'>Thiết kế</SelectItem>
                        <SelectItem value='marketing'>Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <DynamicListInput
                title='Bạn sẽ học được gì từ khóa học này?'
                placeholder='Nhập nội dung bạn sẽ học'
                items={learnItems}
                onChange={setLearnItems}
              />

              <DynamicListInput
                title='Yêu cầu trước của khóa học này?'
                placeholder='Nhập yêu cầu trước'
                items={requirements}
                onChange={setRequirements}
              />
            </TabsContent>

            <TabsContent value='media' className='space-y-6'>
              {/* Upload Course Image */}
              <Card className='border border-blue-200 shadow-md bg-blue-50'>
                <CardHeader>
                  <CardTitle className='text-lg font-semibold text-blue-900'>Hình ảnh khóa học</CardTitle>
                  <p className='text-sm text-blue-700'>Tải hình ảnh khóa học tại đây.</p>
                </CardHeader>
                <CardContent>
                  <div
                    className='border-2 border-dashed border-blue-300 rounded-xl p-10 text-center 
                   hover:border-blue-500 hover:bg-blue-100/50 transition-colors cursor-pointer'
                  >
                    <ImageIcon className='h-10 w-10 mx-auto mb-4 text-blue-400' />
                    <h3 className='font-medium text-blue-900 mb-1'>Tải ảnh khóa học</h3>
                    <p className='text-xs text-blue-600 mb-4'>750x422 pixels. JPG, JPEG hoặc PNG.</p>
                    <Button className='bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow'>Chọn ảnh</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Upload Course Intro Video */}
              <Card className='border border-blue-200 shadow-md bg-blue-50'>
                <CardHeader>
                  <CardTitle className='text-lg font-semibold text-blue-900'>Video giới thiệu</CardTitle>
                  <p className='text-sm text-blue-700'>Học viên có thể xem trước khóa học qua video giới thiệu.</p>
                </CardHeader>
                <CardContent>
                  <div
                    className='border-2 border-dashed border-blue-300 rounded-xl p-10 text-center 
                   hover:border-blue-500 hover:bg-blue-100/50 transition-colors cursor-pointer'
                  >
                    <Upload className='h-10 w-10 mx-auto mb-4 text-blue-400' />
                    <h3 className='font-medium text-blue-900 mb-1'>Tải video giới thiệu</h3>
                    <p className='text-xs text-blue-600 mb-4'>Tối đa 2 phút. Độ phân giải 1920x1080.</p>
                    <Button className='bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow'>Chọn video</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='seo' className='space-y-6'>
              <Card className='border border-blue-200 shadow-md bg-blue-50'>
                <CardHeader>
                  <CardTitle className='text-lg font-semibold text-blue-900'>Thẻ khóa học</CardTitle>
                  <p className='text-sm text-blue-700'>Thêm thẻ liên quan đến kỹ năng được dạy trong khóa.</p>
                </CardHeader>

                <CardContent className='space-y-4'>
                  {/* Tags list */}
                  <div className='flex flex-wrap gap-2 mb-4'>
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant='secondary'
                        className='flex items-center text-sm px-2 py-1 rounded-md bg-blue-100 text-blue-800 border border-blue-300'
                      >
                        {tag}
                        <X
                          className='h-3 w-3 ml-1 cursor-pointer text-blue-500 hover:text-red-500 transition-colors'
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>

                  {/* Input + Button */}
                  <div className='flex space-x-2'>
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder='Thêm thẻ'
                      onKeyDown={(e) => e.key === 'Enter' && addTag()}
                      className='border-blue-300 focus:ring-2 focus:ring-blue-400 rounded-lg'
                    />
                    <Button
                      onClick={addTag}
                      disabled={!newTag || tags.length >= 10}
                      className='bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow'
                    >
                      Thêm
                    </Button>
                  </div>

                  {/* Counter */}
                  <div className='text-xs text-blue-600'>{tags.length}/10 thẻ đã dùng</div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Section */}
        <div className='space-y-8'>
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
                  {tags.slice(0, 3).map((tag) => (
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
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex justify-between pt-6 border-t border-border/60'>
        <Button variant='ghost'>Quay lại</Button>
        <div className='space-x-3'>
          <Button variant='secondary'>Lưu bản nháp</Button>
          <Button className='bg-primary/90 hover:bg-primary'>Tiếp tục</Button>
        </div>
      </div>
    </div>
  )
}

export default LandingPageForm
