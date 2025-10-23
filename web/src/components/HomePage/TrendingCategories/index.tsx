import './style.scss'

const TrendingCategories = () => {
  return (
    <div className='trending-categories-container py-6 space-y-12 mt-6'>
      <h4 className='text-center text-3xl title-categories font-extrabold tracking-tight mt-4'>
        Công nghệ nổi bật hiện nay
      </h4>

      {/* Marquee icons - Row 1 */}
      <div className='overflow-hidden w-full relative max-w-5xl mx-auto select-none mt-6'>
        <style>{`
        .marquee-inner { animation: marqueeScroll linear infinite; }
        @keyframes marqueeScroll { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
      `}</style>
        <div className='absolute left-0 top-0 h-full w-20 z-10 pointer-events-none' />
        <div className='marquee-inner flex will-change-transform min-w-[200%]' style={{ animationDuration: '15s' }}>
          <div className='flex'>
            {[
              'graphql',
              'spring',
              'docker',
              'mongodb',
              'mysql',
              'react',
              'angular',
              'python',
              'kubernetes',
              'c++',
              'javascript'
            ]
              .concat([
                'graphql',
                'spring',
                'docker',
                'mongodb',
                'mysql',
                'react',
                'angular',
                'python',
                'kubernetes',
                'c++',
                'javascript'
              ])
              .map((tech, index) => (
                <img
                  key={`${tech}-${index}`}
                  src={`https://cdn.simpleicons.org/${tech}`}
                  alt={tech}
                  className='h-16 w-auto object-contain mx-6 opacity-80 hover:opacity-100 transition-opacity'
                  draggable={false}
                />
              ))}
          </div>
        </div>
        <div className='absolute right-0 top-0 h-full w-20 md:w-40 z-10 pointer-events-none' />
      </div>

      {/* Marquee icons - Row 2 (reverse direction) */}
      <div className='overflow-hidden w-full relative max-w-5xl mx-auto select-none mt-4'>
        <style>{`
        .marquee-inner-reverse { animation: marqueeScrollReverse linear infinite; }
        @keyframes marqueeScrollReverse { 0% { transform: translateX(-50%); } 100% { transform: translateX(0%); } }
      `}</style>
        <div className='absolute left-0 top-0 h-full w-20 z-10 pointer-events-none' />
        <div
          className='marquee-inner-reverse flex will-change-transform min-w-[200%]'
          style={{ animationDuration: '18s' }}
        >
          <div className='flex'>
            {[
              'nextdotjs',
              'nodedotjs',
              'typescript',
              'tailwindcss',
              'nestjs',
              'php',
              'laravel',
              'neo4j',
              'postgresql',
              'redis',
              'kong',
              'nuxt'
            ]
              .concat([
                'nextdotjs',
                'nodedotjs',
                'typescript',
                'tailwindcss',
                'nestjs',
                'php',
                'laravel',
                'neo4j',
                'postgresql',
                'redis',
                'kong',
                'nuxt'
              ])
              .map((tech, index) => (
                <img
                  key={`${tech}-reverse-${index}`}
                  src={`https://cdn.simpleicons.org/${tech}`}
                  alt={tech}
                  className='h-16 w-auto object-contain mx-6 opacity-80 hover:opacity-100 transition-opacity'
                  draggable={false}
                />
              ))}
          </div>
        </div>
        <div className='absolute right-0 top-0 h-full w-20 md:w-40 z-10 pointer-events-none' />
      </div>
    </div>
  )
}

export default TrendingCategories
