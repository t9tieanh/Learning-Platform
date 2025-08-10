import ArticlesCard from '@/components/common/ArticlesCard'

const HighlightedArticles = () => {
  const articles = [
    {
      id: 1,
      title: 'Understanding React Hooks',
      shortDescription: 'A deep dive into the world of React Hooks.',
      thumbnail: 'https://files.fullstack.edu.vn/f8-prod/blog_posts/4685/63117986d6356.png',
    },
    {
      id: 2,
      title: 'Exploring TypeScript',
      shortDescription: 'An introduction to TypeScript and its benefits.',
      thumbnail: 'https://www.jamviet.com/upload/2021/09/typescript-1024x538.png',
    },
    {
      id: 3,
      title: 'Exploring TypeScript',
      shortDescription: 'An introduction to TypeScript and its benefits.',
      thumbnail: 'https://i.ytimg.com/vi/MGhw6XliFgo/maxresdefault.jpg',
    },
    {
      id: 4,
      title: 'Exploring TypeScript',
      shortDescription: 'An introduction to TypeScript and its benefits.',
      thumbnail:
        'https://khoahochatde.com/wp-content/uploads/2025/01/Lap-trinh-Backend-Microservices-voi-Typescript-va-Express.webp',
    },
    {
      id: 5,
      title: 'Exploring TypeScript',
      shortDescription: 'An introduction to TypeScript and its benefits.',
      thumbnail:
        'https://i.ytimg.com/vi/yuR9dz0Qr_w/hq720.jpg?sqp=-oaymwE7CK4FEIIDSFryq4qpAy0IARUAAAAAGAElAADIQj0AgKJD8AEB-AH-CYAC0AWKAgwIABABGCwgNCh_MA8=&rs=AOn4CLBsVDmn8lhJHEF32f_HENmhZmKfqw',
    },
    {
      id: 5,
      title: 'Exploring TypeScript',
      shortDescription: 'An introduction to TypeScript and its benefits.',
      thumbnail: 'https://nohiedu.com/wp-content/uploads/2024/06/khoa-hoc-docker.webp',
    }
  ]

  return (
    <div className='highlighted-articles-container'>
      <h4 className='font-bold bg-blue-500 text-white p-2 rounded-r-3xl max-w-80 text-center mt-6'>Bài viết nổi bật</h4>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6 mx-auto max-w-7xl px-4'>
        {articles.map((article) => (
          <ArticlesCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  )
}

export default HighlightedArticles
