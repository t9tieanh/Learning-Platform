import { Logo, LogoImage } from '@/components/Footer/logo'
import logo_sm from '@/assets/images/logo1.png'
import { MapPin, Phone, Mail, Facebook, Youtube, Linkedin } from 'lucide-react'

interface MenuItem {
  title: string
  links: {
    text: string
    url: string
  }[]
}

const CONTACT_DETAILS = [
  { icon: MapPin, label: 'Địa chỉ', value: 'Quận 1, TP. Hồ Chí Minh' },
  { icon: Phone, label: 'Hotline', value: '0856 230 324', href: 'tel:0856230324' },
  { icon: Mail, label: 'Email', value: 'hello@learnova.io.vn', href: 'mailto:hello@learnova.io.vn' }
]

const SOCIAL_LINKS = [
  { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61569020296267' },
  { icon: Youtube, label: 'YouTube', href: 'https://www.youtube.com/@phamtienanh1553' },
  { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/sangnguyenduc/' }
]

interface Footer2Props {
  logo?: {
    url: string
    src: string
    alt: string
    title: string
  }
  tagline?: string
  menuItems?: MenuItem[]
  copyright?: string
  bottomLinks?: {
    text: string
    url: string
  }[]
}

const Footer = ({
  logo = {
    src: logo_sm,
    alt: 'blocks for shadcn/ui',
    title: 'LEARNOVA',
    url: 'https://learnova.t9tieanh.io.vn/'
  },
  tagline = 'Kiến tạo tương lai tri thức số cho mọi người học, ở mọi nơi.',
  menuItems = [
    {
      title: 'Về Learnova',
      links: [
        { text: 'Giới thiệu', url: '/about' },
        { text: 'Đội ngũ', url: '/about#team' },
        { text: 'Blog', url: '/blogs' },
        { text: 'Tuyển dụng', url: '/careers' },
        { text: 'Liên hệ', url: '/contact' },
        { text: 'Chính sách bảo mật', url: '/policies/privacy' }
      ]
    },
    {
      title: 'Tài nguyên',
      links: [
        { text: 'Khóa học', url: '/courses' },
        { text: 'Lộ trình học', url: '/roadmap' },
        { text: 'Sự kiện & Webinar', url: '/events' }
      ]
    },
    {
      title: 'Hỗ trợ',
      links: [
        { text: 'Câu hỏi thường gặp', url: '/faq' },
        { text: 'Hướng dẫn học viên', url: '/guides/learners' },
        { text: 'Điều khoản sử dụng', url: '/policies/terms' }
      ]
    }
  ]
}: Footer2Props) => {
  return (
    <section className='py-12 bg-[#1f2937] text-white'>
      <div className='container'>
        <footer>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-6'>
            <div className='col-span-2 mb-8 lg:mb-0'>
              <div className='flex items-center gap-2 lg:justify-start'>
                <Logo url={logo_sm}>
                  <LogoImage src={logo.src} alt={logo.alt} title={logo.title} className='h-10' />
                </Logo>
              </div>
              <p className='mt-4 font-bold'>{tagline}</p>
              <div className='mt-6 space-y-4 text-sm text-gray-200'>
                {CONTACT_DETAILS.map((item) => (
                  <div key={item.label} className='flex items-start gap-3'>
                    <item.icon className='h-4 w-4 mt-0.5 text-primary-200 flex-shrink-0' />
                    <div>
                      <p className='text-xs uppercase tracking-wide text-gray-400'>{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className='font-semibold hover:text-primary-200'>
                          {item.value}
                        </a>
                      ) : (
                        <p className='font-semibold'>{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className='mt-6 flex gap-3'>
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target='_blank'
                    rel='noreferrer'
                    className='inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:border-white hover:bg-white/20'
                  >
                    <social.icon className='h-4 w-4' />
                  </a>
                ))}
              </div>
            </div>
            {menuItems.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className='mb-4 font-bold'>{section.title}</h3>
                <ul className='space-y-4'>
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx} className='hover:text-gray-600 font-medium'>
                      <a href={link.url}>{link.text}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </footer>
      </div>
    </section>
  )
}

export { Footer }
