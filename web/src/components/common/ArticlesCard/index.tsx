import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FaLocationArrow, FaCommentDots } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { IoPaperPlane } from 'react-icons/io5'
import { FcLike } from 'react-icons/fc'

interface Article {
  id: number
  title: string
  shortDescription: string
  thumbnail: string
}

const ArticlesCard = ({ article }: { article: Article }) => {
  return (
    <Card className='pt-0 gap-2 bg-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300'>
      <CardHeader className='p-0'>
        <img alt={article.title.charAt(0)} className='h-48 w-full object-cover rounded-2xl' src={article.thumbnail} />
      </CardHeader>
      <CardContent>
        <CardTitle className='line-clamp-1 text-lg'>{article.title}</CardTitle>
        <CardDescription className='my-1 line-clamp-2 italic'>{article.shortDescription}</CardDescription>
        <div className='flex justify-between items-center gap-2 mt-2'>
          <div className='flex items-center gap-2 text-sm'>
            <div className='flex items-center gap-2 text-sm'>
              <span className='font-bold flex items-center'>
                <div>
                  <FcLike />{' '}
                </div>
                <div className='mx-1'>100</div>
              </span>
              <span className='font-bold flex items-center'>
                <div>
                  <FaCommentDots />{' '}
                </div>
                <div className='mx-1'>100</div>
              </span>
            </div>
          </div>
          <div>
            <Button>
              <FaLocationArrow />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ArticlesCard
