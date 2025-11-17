import './style.scss'
import { motion } from 'framer-motion'
import whychoose1 from '@/assets/images/whychoose1.png'
import whychoose2 from '@/assets/images/whychoose2.png'
import whychoose3 from '@/assets/images/whychoose3.png'

const FeatureHomeCard = ({
  title,
  image,
  description
}: {
  title: string
  image: string
  description: string
}) => {
  return (
    <motion.div
      className='p-4 flex justify-normal gap-3 max-w-xl'
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <img alt={title} className='h-32 w-full object-cover image-feature my-4' src={image} width={100} />
      <div>
        <h5 className='font-bold text-2xl mt-2'>{title}</h5>
        <p className='text-gray-600 text-sm'>{description}</p>
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
    <div className='why-choose-us-section mt-8 my-5 py-3'>
      <h4 className='font-bold bg-blue-500 text-white p-2 max-w-96 pl-12 rounded-r-3xl'>
        Chúng tôi khác biệt như thế nào
      </h4>
      <div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 my-6'>
        <motion.div
          className='flex flex-col justify-center items-center gap-4'
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
          className='image-container'
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <img
            alt='Why Choose Us'
            className='h-[400px] w-full object-cover rounded-2xl'
            src='https://images.unsplash.com/photo-1600195077077-7c815f540a3d?q=80&w=689&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
          />
        </motion.div>
      </div>
    </div>
  )
}

export default WhyChooseUsSection
