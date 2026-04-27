import './style.scss'
import { motion } from 'framer-motion'
import whychoose1 from '@/assets/images/whychoose1.png'
import whychoose2 from '@/assets/images/whychoose2.png'
import whychoose3 from '@/assets/images/whychoose3.png'
import whychoose4 from '@/assets/images/whychoseus-homepage.avif'

const FeatureHomeCard = ({ title, image, description }: { title: string; image: string; description: string }) => {
  return (
    <motion.div
      className='p-3 flex items-start gap-4'
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <img alt={title} className='h-12 w-12 object-contain image-feature flex-shrink-0' src={image} width={48} />
      <div>
        <h5 className='font-bold text-xl mt-1'>{title}</h5>
        <p className='text-muted-foreground text-sm mt-1'>{description}</p>
      </div>
    </motion.div>
  )
}

const WhyChooseUsSection = () => {
  const features = [
    {
      title: 'Thư viện khóa học đa dạng',
      image: whychoose1,
      description:
        'Cung cấp hàng ngàn khóa học từ nhiều lĩnh vực, cập nhật liên tục, đáp ứng mọi nhu cầu học tập của bạn.'
    },
    {
      title: 'Giảng viên uy tín và chất lượng',
      image: whychoose2,
      description: 'Đội ngũ giảng viên giàu kinh nghiệm, nội dung được biên soạn bài bản và dễ hiểu.'
    },
    {
      title: 'Học mọi lúc mọi nơi',
      image: whychoose3,
      description:
        'Tận dụng nền tảng học trực tuyến để học bất cứ đâu, bất cứ lúc nào, linh hoạt theo lịch trình của bạn.'
    }
  ]

  return (
    // Keep this section full-bleed, but align inner content to the main container pattern used on the homepage
    <div className='why-choose-us-section pt-10 px-4 md:px-0'>
      {/* headline pill aligned to the left edge of the page (homepage pattern) */}
      <div className='flex items-center mt-2 md:mt-0'>
        <div className='shrink-0'>
          <h4 className='font-bold bg-blue-500 text-white p-2 rounded-r-3xl pl-4 md:pl-12 min-w-80'>
            Vì sao chọn chúng tôi
          </h4>
        </div>
      </div>

      <div className='mx-auto max-w-7xl'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-6'>
          <motion.div
            className='flex flex-col justify-center gap-4'
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {features.map((feature, index) => (
              <FeatureHomeCard
                key={index}
                title={feature.title}
                image={feature.image}
                description={feature.description}
              />
            ))}
          </motion.div>
          <motion.div
            className='image-container w-full flex justify-center'
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className='rounded-2xl overflow-hidden w-full'>
              <img alt='Why Choose Us' className='w-full h-64 md:h-80 lg:h-[420px] object-cover' src={whychoose4} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default WhyChooseUsSection
