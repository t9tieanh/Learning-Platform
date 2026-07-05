import { Link } from 'react-router-dom'

interface ImageCardProps {
  image: string
  title: string
  slug: string
  tags?: string[]
}

export const ImageCard = ({ image, title, slug, tags = [] }: ImageCardProps) => {
  return (
    <Link to={`/blog-details/${slug}`} className='group'>
      <article className='relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all mb-8'>
        <div className='aspect-video relative overflow-hidden'>
          <img
            src={image}
            alt={title}
            className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent' />
        </div>
        <div className='absolute bottom-0 left-0 right-0 bg-black/35 p-6 text-white backdrop-blur-sm'>
          <h3 className='text-lg font-semibold line-clamp-2'>{title}</h3>
          {tags.length > 0 && (
            <div className='mt-3 flex flex-wrap gap-1.5'>
              {tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className='rounded-full border  border-blue-300/60 bg-blue-500/75 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white'
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
