import './style.scss'

const iconFallbackMap: Record<string, string[]> = {
  amazonaws: ['amazon'],
  slack: ['discord'],
  openjdk: ['oracle'],
  microsoftteams: ['microsoft']
}

const getIconUrl = (slug: string) => `https://cdn.simpleicons.org/${slug}`

const handleIconError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const img = event.currentTarget
  const baseSlug = img.dataset.baseSlug

  if (!baseSlug) {
    img.style.display = 'none'
    return
  }

  const fallbackSlugs = iconFallbackMap[baseSlug] || []
  const fallbackIndex = Number(img.dataset.fallbackIndex || '0')

  if (fallbackIndex < fallbackSlugs.length) {
    img.dataset.fallbackIndex = String(fallbackIndex + 1)
    img.src = getIconUrl(fallbackSlugs[fallbackIndex])
    return
  }

  img.style.display = 'none'
}

const row1Icons = [
  'udacity',
  'skillshare',
  'pluralsight',
  'futurelearn',
  'datacamp',
  'brilliant',
  'frontendmasters',
  'udemy',
  'coursera',
  'edx',
  'khanacademy',
  'moodle',
  'duolingo',
  'youtube',
  'zoom',
  'googlemeet',
  'discord',
  'notion',
  'obsidian',
  'github',
  'stackoverflow',
  'wikipedia',
  'medium',
  'substack',
  'figma',
  'canva'
]

const row2Icons = [
  'openai',
  'huggingface',
  'tensorflow',
  'pytorch',
  'keras',
  'scikitlearn',
  'jira',
  'postman',
  'insomnia',
  'gitlab',
  'bitbucket',
  'javascript',
  'typescript',
  'python',
  'openjdk',
  'react',
  'nextdotjs',
  'tailwindcss',
  'mongodb',
  'docker',
  'kubernetes',
  'amazonaws',
  'googlecloud',
  'stripe',
  'paypal',
  'visa',
  'mastercard',
  'shopify',
  'linkedin',
  'telegram'
]

const renderMarqueeIcons = (icons: string[], rowKey: 'row1' | 'row2') => {
  return [0, 1].map((copyIndex) => (
    <div className='marquee-group flex' key={`${rowKey}-copy-${copyIndex}`} aria-hidden={copyIndex === 1}>
      {icons.map((tech, index) => (
        <img
          key={`${rowKey}-${copyIndex}-${tech}-${index}`}
          src={getIconUrl(tech)}
          alt={tech}
          className='marquee-icon h-10 md:h-16 w-auto object-contain mx-3 md:mx-6 opacity-85 hover:opacity-100 transition-all duration-300'
          draggable={false}
          data-base-slug={tech}
          data-fallback-index='0'
          onError={handleIconError}
        />
      ))}
    </div>
  ))
}

const TrendingCategories = () => {
  return (
    <div className='trending-categories-container py-6 space-y-12 mt-6 px-4 md:px-0'>
      <h4 className='text-center text-2xl md:text-3xl title-categories font-extrabold tracking-tight mt-4'>
        Kiến thức và kỹ năng nổi bật hiện nay
      </h4>

      {/* Marquee icons - Row 1 */}
      <div className='marquee-shell overflow-hidden w-full relative max-w-5xl mx-auto select-none mt-6'>
        <div className='marquee-fade marquee-fade--left absolute left-0 top-0 h-full w-10 md:w-20 z-10 pointer-events-none' />
        <div
          className='marquee-inner marquee-track flex will-change-transform'
          style={{ '--marquee-duration': '26s' } as React.CSSProperties}
        >
          {renderMarqueeIcons(row1Icons, 'row1')}
        </div>
        <div className='marquee-fade marquee-fade--right absolute right-0 top-0 h-full w-10 md:w-20 md:w-40 z-10 pointer-events-none' />
      </div>

      {/* Marquee icons - Row 2 (reverse direction) */}
      <div className='marquee-shell overflow-hidden w-full relative max-w-5xl mx-auto select-none mt-4'>
        <div className='marquee-fade marquee-fade--left absolute left-0 top-0 h-full w-10 md:w-20 z-10 pointer-events-none' />
        <div
          className='marquee-inner-reverse marquee-track is-reverse flex will-change-transform'
          style={{ '--marquee-duration': '26s' } as React.CSSProperties}
        >
          {renderMarqueeIcons(row2Icons, 'row2')}
        </div>
        <div className='marquee-fade marquee-fade--right absolute right-0 top-0 h-full w-10 md:w-20 md:w-40 z-10 pointer-events-none' />
      </div>
    </div>
  )
}

export default TrendingCategories
