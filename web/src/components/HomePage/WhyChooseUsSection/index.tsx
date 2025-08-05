import './style.scss'

const FeatureHomeCard = ({ title, image, description }: { title: string; image: string; description: string }) => {
  return (
    <div className='p-4 flex justify-normal gap-3 max-w-xl'>
      <img alt={title} className='h-32 w-full object-cover image-feature my-4' src={image} width={100} />
      <div>
        <h5 className='font-bold text-2xl mt-2'>{title}</h5>
        <p className='text-gray-600 text-sm'>{description}</p>
      </div>
    </div>
  )
}

const WhyChooseUsSection = () => {
  const features = [
    {
      title: 'Thư viện khóa học đa dạng',
      image: 'https://freesvg.org/img/1489798288.png',
      description:
        'Cung cấp hàng ngàn khóa học từ nhiều lĩnh vực, cập nhật liên tục, đáp ứng mọi nhu cầu học tập của bạn.'
    },
    {
      title: 'Giảng viên uy tín và chất lượng',
      image: 'https://cdn-icons-png.flaticon.com/512/3252/3252857.png',
      description: 'Đội ngũ giảng viên giàu kinh nghiệm, nội dung được biên soạn bài bản và dễ hiểu.'
    },
    {
      title: 'Ứng dụng công nghệ AI',
      image: 'https://cdn-icons-png.freepik.com/512/7036/7036037.png',
      description:
        'Tích hợp trí tuệ nhân tạo để cá nhân hóa lộ trình học tập, gợi ý nội dung phù hợp và nâng cao hiệu quả học tập trực tuyến.'
    },
  ]

  return (
    <div className='why-choose-us-section mt-8 my-5 py-3'>
      <h4 className='font-bold bg-blue-500 text-white p-2 max-w-96 text-center rounded-r-3xl'>Chúng tôi khác biệt như thế nào ?</h4>
      <div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 my-6'>
        <div className='flex flex-col justify-center items-center gap-4'>
          {features.map((feature, index) => (
            <FeatureHomeCard
              key={index}
              title={feature.title}
              image={feature.image}
              description={feature.description}
            />
          ))}
        </div>
        <div className='image-container'>
          <img
            alt='Why Choose Us'
            className='h-[400px] w-full object-cover rounded-2xl pr-5'
            src='https://images.unsplash.com/photo-1600195077077-7c815f540a3d?q=80&w=689&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
          />
        </div>
      </div>
    </div>
  )
}

export default WhyChooseUsSection
