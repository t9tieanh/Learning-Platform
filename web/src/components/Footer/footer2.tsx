import { Logo, LogoImage, LogoText } from '@/components/Footer/logo'
import logo_sm from '@/assets/images/LEARNOVA_sm.png'

interface MenuItem {
  title: string
  links: {
    text: string
    url: string
  }[]
}

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
    url: 'https://www.freeclassroom.com'
  },
  tagline = 'Nền tảng bán khóa học trực tuyến',
  menuItems = [
    {
      title: 'Liên hệ',
      links: [
        { text: 'Giới thiệu', url: '#' },
        { text: 'Đội ngũ', url: '#' },
        { text: 'Blog', url: '#' },
        { text: 'Tuyển dụng', url: '#' },
        { text: 'Liên hệ', url: '#' },
        { text: 'Chính sách bảo mật', url: '#' }
      ]
    },
    {
      title: 'Liên hệ',
      links: [
        { text: 'About', url: '#' },
        { text: 'Team', url: '#' },
        { text: 'Blog', url: '#' },
        { text: 'Careers', url: '#' },
        { text: 'Contact', url: '#' },
        { text: 'Privacy', url: '#' }
      ]
    },
    {
      title: 'Thông tin',
      links: [
        { text: 'Help', url: '#' },
        { text: 'Sales', url: '#' },
        { text: 'Advertise', url: '#' }
      ]
    },
    {
      title: 'Liên kết',
      links: [
        { text: 'Twitter', url: '#' },
        { text: 'Instagram', url: '#' },
        { text: 'LinkedIn', url: '#' }
      ]
    }
  ]
}: Footer2Props) => {
  return (
    <section className='py-12 bg-[#1f2937] text-white'>
      <div className='container'>
        <footer>
          <div className='grid grid-cols-2 gap-8 lg:grid-cols-6'>
            <div className='col-span-2 mb-8 lg:mb-0'>
              <div className='flex items-center gap-2 lg:justify-start'>
                <Logo url={logo_sm}>
                  <LogoImage src={logo.src} alt={logo.alt} title={logo.title} className='h-10' />
                  <LogoText className='text-xl'>{logo.title}</LogoText>
                </Logo>
              </div>
              <p className='mt-4 font-bold'>{tagline}</p>
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
