import './style.scss'

const CategoryCard = ({ title, image }: { title: string; image: string }) => {
  return (
    <>
      <div className='text-center'>
        <img alt='Course' className='category-img mx-auto' src={image} width={100} />
        <h1 className='text-center font-bold mt-2'>{title}</h1>
      </div>
    </>
  )
}

const TrendingCategories = () => {
  const categories = [
    { title: 'NestJS', image: 'https://nestjs.com/img/logo-small.svg' },
    {
      title: 'NodeJS',
      image:
        'https://play-lh.googleusercontent.com/fSQ2dmyQPfqZAacdmLnA3UoUdaHgF0ADmbLVMXFiD_iTwVVJNi8PjBbe_RlZSAZEJMo=w240-h480-rw'
    },
    { title: 'Spring Boot', image: 'https://img.icons8.com/color/512/spring-logo.png' },
    { title: 'ReactJS', image: 'https://images.viblo.asia/da226ac1-bf54-496d-9547-d1506ebe9695.png' }
  ]

  return (
    <div className='trending-categories-container mt-8 my-5 py-3'>
      {/* <h4 className='font-bold bg-blue-500 text-white p-2 rounded-r-3xl max-w-96 text-center mt-6'>
        Chuyên ngành đang được quan tâm
      </h4> */}
      <h4 className='text-center text-3xl title-categories font-extrabold tracking-tight mt-4'>
        Công nghệ nổi bật hiện nay
      </h4>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 my-4'>
        {/* Thêm các chuyên ngành đang được quan tâm ở đây */}
        {categories.map((category, index) => (
          <CategoryCard key={index} title={category.title} image={category.image} />
        ))}
      </div>
    </div>
  )
}

export default TrendingCategories
