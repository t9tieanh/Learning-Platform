import { useState } from 'react'
import {
  MapPin, Phone, Globe, Mail, Users, Target, Award, BookOpen, TrendingUp, Twitter,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import heroImage from '@/assets/images/about.png'
import missionImage from '@/assets/images/about1.jpg'
import valuesImage from '@/assets/images/about4.png'
import twitterIcon from '@/assets/images/twitter.png'
import facebookIcon from '@/assets/images/fb.png'
import ytbIcon from '@/assets/images/ytb.png'
import igIcon from '@/assets/images/ig.png'
import linkedIcon from '@/assets/images/linked.png'

const About = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.info('Vui lòng điền đầy đủ thông tin')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/send-contact-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast('Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.')
        setFormData({ name: '', email: '', message: '' })
      } else {
        throw new Error('Failed to send')
      }
    } catch (error) {
      toast('Vui lòng thử lại sau')
    } finally {
      setIsSubmitting(false)
    }
  }

  const stats = [
    { icon: Users, label: 'Học viên', value: '50,000+' },
    { icon: BookOpen, label: 'Khóa học', value: '500+' },
    { icon: Award, label: 'Giảng viên', value: '200+' },
    { icon: TrendingUp, label: 'Tỷ lệ hoàn thành', value: '92%' }
  ]

  const values = [
    {
      title: 'Chất lượng giảng dạy',
      description: 'Đội ngũ giảng viên chuyên nghiệp, giàu kinh nghiệm từ các tập đoàn hàng đầu'
    },
    {
      title: 'Nội dung cập nhật',
      description: 'Chương trình học luôn được cập nhật theo xu hướng công nghệ mới nhất'
    },
    {
      title: 'Cộng đồng hỗ trợ',
      description: 'Kết nối với cộng đồng học viên năng động, chia sẻ kinh nghiệm'
    }
  ]

  return (
    <div className='min-h-screen bg-background'>
      {/* Hero Section */}
      <section className='relative h-[60vh] min-h-[500px] overflow-hidden'>
        <div className='absolute inset-0 bg-cover bg-center' style={{ backgroundImage: `url(${heroImage})` }}>
          <div className='absolute inset-0 bg-gradient-to-r from-primary/90 to-orange-400/70' />
        </div>
        <div className='container relative h-full flex items-center justify-center text-center px-4'>
          <div className='max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-1000'>
            <h1 className='text-5xl md:text-6xl font-bold text-white mb-6'>Về Learnova</h1>
            <p className='text-xl md:text-2xl text-white/90'>
              Nền tảng học trực tuyến hàng đầu, mang đến kiến thức chất lượng cho hàng chục ngàn học viên
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='py-12 bg-card border-b'>
        <div className='container px-4'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={index}
                  className='text-center animate-in fade-in slide-in-from-bottom-4 duration-700'
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4'>
                    <Icon className='w-8 h-8' />
                  </div>
                  <div className='text-3xl font-bold text-foreground mb-1'>{stat.value}</div>
                  <div className='text-muted-foreground'>{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className='py-20 px-4'>
        <div className='container'>
          <div className='grid md:grid-cols-2 gap-12 items-center'>
            <div className='animate-in fade-in slide-in-from-left-8 duration-1000 flex justify-center items-center'>
              <img src={missionImage} alt='Mission' className='rounded-2xl shadow-elegant w-[450px] h-[450px]' />
            </div>
            <div className='animate-in fade-in slide-in-from-right-8 duration-1000'>
              <div className='inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6'>
                <Target className='w-5 h-5' />
                <span className='font-semibold'>Sứ mệnh</span>
              </div>
              <h2 className='text-4xl font-bold text-foreground mb-6'>Cách mạng giáo dục</h2>
              <p className='text-lg text-muted-foreground mb-4 text-justify'>
                Learnova được thành lập với sứ mệnh mang giáo dục chất lượng cao đến với mọi người, không phân biệt địa
                lý hay hoàn cảnh. Chúng tôi tin rằng học tập là chìa khóa mở ra những cơ hội mới trong cuộc sống.
              </p>
              <p className='text-lg text-muted-foreground text-justify'>
                Với đội ngũ giảng viên dày dặn kinh nghiệm và nền tảng công nghệ hiện đại, chúng tôi cam kết cung cấp
                trải nghiệm học tập tối ưu, giúp học viên phát triển kỹ năng và đạt được mục tiêu nghề nghiệp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className='py-16 px-4 bg-gradient-to-r from-primary/70 white'>
        <div className='container'>
          <h2 className='text-3xl font-bold text-foreground mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700'>
            Giá trị cốt lõi
          </h2>

          <div className='grid md:grid-cols-2 gap-12 items-center'>
            <div className='animate-in fade-in slide-in-from-left-8 duration-1000'>
              <div className='space-y-6'>
                {values.map((value, index) => (
                  <Card
                    key={index}
                    className='p-6 hover:shadow-card transition-all duration-300 hover:scale-[1.02] bg-card'
                  >
                    <h3 className='text-lg font-semibold text-foreground'>{value.title}</h3>
                    <p className='text-muted-foreground text-base'>{value.description}</p>
                  </Card>
                ))}
              </div>
            </div>

            <div className='flex justify-center animate-in fade-in slide-in-from-right-8 duration-1000'>
              <img src={valuesImage} alt='Values' className='rounded-2xl shadow-elegant max-w-[450px] h-auto' />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className='py-20 px-4'>
        <div className='container max-w-5xl'>
          <div className='text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700'>
            <div className='inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6'>
              <Mail className='w-5 h-5' />
              <span className='font-semibold'>Liên hệ</span>
            </div>
            <h2 className='text-4xl font-bold text-foreground mb-4'>Gửi tin nhắn cho chúng tôi</h2>
            <p className='text-lg text-muted-foreground'>
              Bạn có câu hỏi? Hãy để lại thông tin, chúng tôi sẽ liên hệ ngay!
            </p>
          </div>

          {/* Chia 2 cột */}
          <div className='grid md:grid-cols-2 gap-12 items-start'>
            {/* Cột trái - thông tin liên hệ */}
            <div className='space-y-6 animate-in fade-in slide-in-from-left-8 duration-1000'>
              <Card className='p-6 shadow-elegant bg-card'>
                <h3 className='text-lg font-semibold text-foreground'>Thông tin liên hệ</h3>
                <div className='space-y-4 text-muted-foreground'>
                  <div className='flex items-start gap-3 text-base font-semibold'>
                    <MapPin className='w-8 h-8 text-blue-500' />
                    <p>16 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh</p>
                  </div>

                  <div className='flex items-start gap-3 text-base font-semibold'>
                    <MapPin className='w-8 h-8 text-blue-500' />
                    <p>Ngõ 275 Quan Nhân, Quận Thanh Xuân, Hà Nội</p>
                  </div>

                  <div className='flex items-center gap-3 text-base font-semibold'>
                    <Phone className='w-8 h-8 text-blue-500' />
                    <p>0943 293 012</p>
                  </div>

                  <div className='flex items-center gap-3 text-base font-semibold'>
                    <Mail className='w-8 h-8 text-blue-500' />
                    <p>geekitr@learnova.com</p>
                  </div>

                  <div className='flex items-center gap-3 text-base font-semibold'>
                    <Globe className='w-8 h-8 text-blue-500' />
                    <p>www.learnova.com</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Cột phải - form liên hệ */}
            <Card className='p-6 shadow-elegant bg-card'>
              <h3 className='text-lg font-semibold text-foreground'>Mạng xã hội</h3>
              <div className='space-y-4 text-muted-foreground'>
                <div className='flex items-center gap-3 text-base font-semibold'>
                  <img
                    src={twitterIcon}
                    alt="Twitter"
                    className='w-8 h-8'
                  />
                  <p>@learnova_official</p>
                </div>

                <div className='flex items-center gap-3 text-base font-semibold'>
                  <img
                    src={facebookIcon}
                    alt="Facebook"
                    className='w-8 h-8 rounded-sm'
                  />
                  <p>/learnova</p>
                </div>

                <div className='flex items-center gap-3 text-base font-semibold'>
                  <img
                    src={igIcon}
                    alt="Instagram"
                    className='w-8 h-8'
                  />
                  <p>@learnova</p>
                </div>

                <div className='flex items-center gap-3 text-base font-semibold'>
                  <img
                    src={linkedIcon}
                    alt="LinkedIn"
                    className='w-8 h-8'
                  />
                  <p>/company/learnova</p>
                </div>

                <div className='flex items-center gap-3 text-base font-semibold'>
                  <img
                    src={ytbIcon}
                    alt="YouTube"
                    className='w-8 h-8'
                  />
                  <p>/learnovachannel</p>
                </div>
              </div>
            </Card>

          </div>
        </div>
      </section>
    </div>
  )
}

export default About
