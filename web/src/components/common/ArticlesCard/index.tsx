import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'

interface Article {
  id: string
  title: string
  shortDescription: string
  thumbnail: string
}

const ArticlesCard = ({ article }: { article: Article }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/blog-details/${article.id}`)
  }
  return (
    <Card
      onClick={handleClick}
      className='pt-0 gap-2 bg-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 hover:cursor-pointer'
    >
      <CardHeader className='p-0'>
        <img alt={article.title.charAt(0)} className='h-48 w-full object-cover rounded-2xl' src={article.thumbnail} />
      </CardHeader>
      <CardContent>
        <CardTitle className='line-clamp-1 text-lg'>{article.title}</CardTitle>
        <CardDescription className='my-1 line-clamp-2 italic'>{article.shortDescription}</CardDescription>
      </CardContent>
    </Card>
  )
}

export default ArticlesCard
