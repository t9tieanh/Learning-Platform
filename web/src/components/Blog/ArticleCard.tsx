import { Link } from 'react-router-dom'

interface ArticleCardProps {
  image: string
  category: string
  title: string
  slug: string
  tags?: string[]
}

export const ArticleCard = ({ image, category, title, slug, tags = [] }: ArticleCardProps) => {
  const visibleTags = tags.slice(0, 2)

  return (
    <Link to={`/blog-details/${slug}`} className='group'>
      <article className='flex gap-4 items-start transition-all mb-2'>
        <img src={image} alt={title} className='w-28 h-20 object-cover rounded-lg flex-shrink-0' />
        <div className='flex-1'>
          <span className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>{category}</span>
          <h3 className='text-sm font-semibold text-foreground mt-1 line-clamp-2 group-hover:text-primary transition-colors'>
            {title}
          </h3>
          {visibleTags.length > 0 && (
            <div className='mt-2 flex flex-wrap gap-1.5'>
              {visibleTags.map((tag) => (
                <span
                  key={tag}
                  className='rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700'
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
