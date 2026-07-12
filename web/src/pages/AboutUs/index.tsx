import { motion } from 'framer-motion'
import {
  MapPin,
  Phone,
  Mail,
  Users,
  Award,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Facebook,
  Youtube,
  Linkedin,
  Lightbulb,
  Globe,
  Heart
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'
import heroImage from '@/assets/images/cover-aboutus.jpg'
import missionImage from '@/assets/images/aboutus1.png'
import valuesBgImage from '@/assets/images/aboutus3.png'

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
}

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } }
}

/* ── Sub-components ── */
interface ContactItemProps {
  icon: React.ElementType
  title: string
  content: string
}

const ContactItem = ({ icon: Icon, title, content }: ContactItemProps) => (
  <div className='flex gap-4 items-start group'>
    <div className='p-3 rounded-lg text-muted-foreground bg-primary/10 text-primary transition-colors'>
      <Icon className='w-5 h-5' />
    </div>
    <div>
      <p className='text-xs font-bold text-gray-500 uppercase tracking-wider mb-1'>{title}</p>
      <p className='text-foreground text-sm font-medium'>{content}</p>
    </div>
  </div>
)

interface SocialLinkProps {
  href: string
  icon: React.ElementType
  label: string
}

const SocialLink = ({ href, icon: Icon, label }: SocialLinkProps) => (
  <a
    href={href}
    target='_blank'
    rel='noopener noreferrer'
    className='flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group'
  >
    <Icon className='w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors' />
    <span className='text-sm font-semibold text-foreground/80 group-hover:text-foreground'>{label}</span>
  </a>
)

const About = () => {
  const stats = [
    { icon: Users, label: 'Học viên tin tưởng', value: '1,000+', colorClass: 'text-blue-500' },
    { icon: BookOpen, label: 'Khóa học chuyên sâu', value: '500+', colorClass: 'text-indigo-500' },
    { icon: Award, label: 'Giảng viên chuyên gia', value: '200+', colorClass: 'text-emerald-500' },
    { icon: TrendingUp, label: 'Tỷ lệ hoàn thành', value: '92%', colorClass: 'text-orange-500' }
  ]

  const values = [
    {
      icon: Award,
      title: 'Chất lượng hàng đầu',
      desc: 'Nội dung được kiểm duyệt bởi các chuyên gia đầu ngành, đảm bảo kiến thức cập nhật và thực tiễn.'
    },
    {
      icon: Lightbulb,
      title: 'Học tập linh hoạt',
      desc: 'Truy cập kiến thức mọi lúc, mọi nơi trên mọi thiết bị — tự do học theo tốc độ của riêng bạn.'
    },
    {
      icon: Heart,
      title: 'Cộng đồng năng động',
      desc: 'Kết nối và học hỏi cùng hàng ngàn học viên, chia sẻ kinh nghiệm và cùng nhau phát triển.'
    },
    {
      icon: Globe,
      title: 'Không giới hạn địa lý',
      desc: 'Xóa bỏ mọi rào cản khoảng cách — tinh hoa tri thức trong tầm tay bạn, dù bạn ở bất kỳ đâu.'
    }
  ]

  const navigator = useNavigate()
  const handleLearnMoreClick = () => {
    window.open('https://www.facebook.com/profile.php?id=61569020296267', '_blank', 'noopener,noreferrer')
  }

  return (
    <div className='bg-background text-foreground font-sans selection:bg-primary/10'>
      <section className='relative h-[70vh] min-h-[500px] flex items-center overflow-hidden'>
        <div className='absolute inset-0 z-0'>
          <img
            src={heroImage}
            alt='Learnova — Nền tảng giáo dục trực tuyến'
            className='w-full h-full object-cover animate-subtle-zoom'
          />
          <div className='absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/60 to-transparent' />
        </div>

        <div className='container relative z-10 mx-auto px-6'>
          <motion.div initial='initial' animate='animate' variants={stagger} className='max-w-2xl'>
            <motion.div variants={fadeIn}>
              <Badge className='mb-4 bg-primary/20 text-primary-foreground border-none px-3 py-1 text-sm backdrop-blur-md'>
                Về Learnova
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeIn}
              className='text-4xl sm:text-5xl md:text-7xl font-display font-bold text-primary-foreground mb-6 tracking-tight leading-[1.1] text-balance'
            >
              Kiến tạo tương lai <span className='text-primary'>tri thức số</span>
            </motion.h1>
            <motion.p
              variants={fadeIn}
              className='text-base sm:text-lg md:text-xl text-primary-foreground/80 mb-8 leading-relaxed max-w-xl'
            >
              Chúng tôi không chỉ bán khóa học — chúng tôi xây dựng lộ trình sự nghiệp và khai phá tiềm năng vô hạn
              trong mỗi cá nhân.
            </motion.p>
            <motion.div variants={fadeIn} className='flex flex-wrap gap-4'>
              <Button
                size='lg'
                className='bg-primary hover:bg-blue-700 text-primary-foreground px-8 rounded-full shadow-lg shadow-primary/25 transition-all'
                onClick={() => {
                  navigator('/courses')
                }}
              >
                Khám phá khóa học
              </Button>
              <Button
                size='lg'
                variant='outline'
                className='text-primary-foreground border-primary-foreground/20 bg-primary-foreground/10 hover:bg-blue-700 backdrop-blur-sm rounded-full'
                onClick={handleLearnMoreClick}
              >
                Tìm hiểu thêm
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className='relative z-20 -mt-16 container mx-auto px-6'>
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6'>
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className='p-6 md:p-8 border-none shadow-xl shadow-border/50 bg-card/90 backdrop-blur-xl hover:-translate-y-1 transition-transform duration-300'>
                <stat.icon className={`w-7 h-7 md:w-8 md:h-8 ${stat.colorClass} mb-4`} />
                <h3 className='text-2xl sm:text-3xl md:text-4xl font-display font-bold tabular-nums tracking-tight mb-1 text-card-foreground'>
                  {stat.value}
                </h3>
                <p className='text-muted-foreground font-medium text-xs sm:text-sm md:text-base'>{stat.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className='py-24 md:py-32 overflow-hidden'>
        <div className='container mx-auto px-6'>
          <div className='grid lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className='relative'
            >
              <div className='absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-full z-0' />
              <img
                src={missionImage}
                alt='Đội ngũ Learnova'
                className='relative z-10 rounded-2xl shadow-2xl w-full object-cover aspect-[4/3] grayscale-[0.15] hover:grayscale-0 transition-all duration-700'
              />
              {/* Trust badge */}
              <div className='absolute -bottom-5 -right-3 sm:-bottom-6 sm:-right-6 p-4 sm:p-6 bg-card shadow-xl rounded-xl z-20 border border-border'>
                <div className='flex items-center gap-3 sm:gap-4'>
                  <div className='w-10 h-10 sm:w-12 sm:h-12 bg-green-200/50 rounded-full flex items-center justify-center'>
                    <CheckCircle2 className='w-5 h-5 sm:w-6 sm:h-6 text-green-500' />
                  </div>
                  <div>
                    <p className='font-bold text-card-foreground text-sm sm:text-base'>Đã kiểm chứng</p>
                    <p className='text-xs sm:text-sm text-muted-foreground'>Chương trình đạt chuẩn quốc tế</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <p className='text-primary font-bold tracking-widest uppercase text-sm mb-4'>Sứ mệnh của chúng tôi</p>
              <h2 className='text-3xl sm:text-4xl font-display font-bold mb-6 leading-tight text-foreground text-balance'>
                Cách mạng hóa cách thức tiếp cận giáo dục.
              </h2>
              <p className='text-muted-foreground text-base sm:text-lg mb-8 leading-relaxed'>
                Learnova ra đời từ khát vọng xóa bỏ rào cản địa lý trong giáo dục. Chúng tôi tin rằng mỗi người, dù ở
                bất kỳ đâu, đều xứng đáng có cơ hội tiếp cận với những tinh hoa tri thức nhân loại.
              </p>

              <div className='space-y-5'>
                {values.slice(0, 3).map((v, i) => (
                  <div key={i} className='flex gap-4'>
                    <div className='mt-0.5 p-1.5 bg-primary/10 rounded-full h-fit shrink-0'>
                      <v.icon className='w-4 h-4 text-primary' />
                    </div>
                    <div>
                      <h4 className='font-bold text-foreground mb-0.5'>{v.title}</h4>
                      <p className='text-muted-foreground text-sm leading-relaxed'>{v.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className='relative isolate py-20 md:py-24 overflow-hidden'>
        <div className='absolute inset-0 z-0 pointer-events-none'>
          <div className='absolute inset-0 bg-cover bg-center' style={{ backgroundImage: `url(${valuesBgImage})` }} />
          <div className='absolute inset-0 bg-slate-950/30' />
          <div className='absolute inset-0 bg-gradient-to-br from-blue-950/40 via-slate-900/35 to-slate-950/65' />
          <div className='absolute inset-0 backdrop-blur-[2px]' />
        </div>

        <div className='container mx-auto px-6 relative z-10'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='text-center mb-16'
          >
            <p className='text-blue-200 font-bold tracking-widest uppercase text-sm mb-3'>Vì sao chọn Learnova</p>
            <h2 className='text-3xl sm:text-4xl font-display font-bold text-white text-balance'>
              Giá trị cốt lõi dẫn dắt mọi hành động
            </h2>
          </motion.div>

          <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className='p-6 md:p-8 border border-white/15 shadow-xl bg-white/90 backdrop-blur-sm hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 h-full'>
                  <div className='w-12 h-12 bg-primary/15 rounded-xl flex items-center justify-center'>
                    <v.icon className='w-6 h-6 text-primary' />
                  </div>
                  <h3 className='font-display font-bold text-lg text-card-foreground'>{v.title}</h3>
                  <p className='text-slate-600 text-sm leading-relaxed'>{v.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className='py-20 md:py-20'>
        <div className='container mx-auto px-6'>
          <div className='max-w-5xl mx-auto'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className='text-center mb-16'
            >
              <h2 className='text-3xl md:text-4xl font-display font-bold mb-4 text-foreground'>
                Luôn sẵn sàng hỗ trợ bạn
              </h2>
              <p className='text-gray-500 max-w-lg mx-auto'>
                Đội ngũ Learnova luôn đồng hành cùng bạn trên mọi bước đường học tập.
              </p>
            </motion.div>

            <div className='grid md:grid-cols-5 gap-6 md:gap-8'>
              {/* Contact Info */}
              <Card className='md:col-span-3 p-6 sm:p-8 border-none shadow-lg bg-card'>
                <div className='grid sm:grid-cols-2 gap-8'>
                  <div className='space-y-8'>
                    <h4 className='text-lg font-bold flex items-center gap-2 text-card-foreground'>
                      <div className='w-1 h-6 bg-primary rounded-full' />
                      Thông tin liên hệ
                    </h4>
                    <div className='space-y-6'>
                      <ContactItem icon={MapPin} title='Địa chỉ' content='Quận 1, TP. Hồ Chí Minh' />
                      <ContactItem icon={Phone} title='Hotline' content='0856 230 324' />
                      <ContactItem icon={Mail} title='Email' content='hello@learnova.io.vn' />
                    </div>
                  </div>

                  <div className='space-y-8'>
                    <h4 className='text-lg font-bold flex items-center gap-2 text-card-foreground'>
                      <div className='w-1 h-6 bg-primary rounded-full' />
                      Kết nối xã hội
                    </h4>
                    <div className='grid grid-cols-1 xs:grid-cols-2 gap-5'>
                      <SocialLink
                        href='https://www.facebook.com/profile.php?id=61569020296267'
                        icon={Facebook}
                        label='Facebook'
                      />
                      <SocialLink href='https://www.youtube.com/@phamtienanh1553' icon={Youtube} label='Youtube' />
                      <SocialLink href='https://www.linkedin.com/in/sangnguyenduc/' icon={Linkedin} label='LinkedIn' />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className='md:col-span-2 p-6 sm:p-8 bg-primary text-primary-foreground border-none shadow-xl shadow-primary/20 flex flex-col justify-between relative overflow-hidden group'>
                <div className='relative z-10'>
                  <h4 className='text-xl sm:text-2xl font-display font-bold mb-4'>
                    Bắt đầu hành trình của bạn ngay hôm nay?
                  </h4>
                  <p className='text-primary-foreground/70 mb-8'>
                    Đăng ký để nhận tư vấn lộ trình học tập miễn phí từ chuyên gia.
                  </p>
                </div>
                <a href='mailto:hello@learnova.io.vn'>
                  <Button className='w-full bg-card text-primary hover:bg-card/90 relative z-10 font-semibold'>
                    Gửi tin nhắn cho chúng tôi
                    <ArrowRight className='ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform' />
                  </Button>
                </a>
                <div className='absolute -bottom-10 -right-10 w-40 h-40 bg-primary-foreground/10 rounded-full group-hover:scale-110 transition-transform duration-700' />
                <div className='absolute -top-8 -left-8 w-24 h-24 bg-primary-foreground/5 rounded-full' />
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
