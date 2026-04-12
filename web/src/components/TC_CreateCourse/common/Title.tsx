import HighGlossBackground from '@/components/common/HighGlossBackground'

const TitleComponent = ({
  title,
  icon,
  description,
  children
}: {
  title: string
  icon?: React.ReactNode
  description: string
  children?: React.ReactNode
}) => {
  return (
    <HighGlossBackground className='mb-12 text-white rounded-[32px] shadow-2xl shadow-blue-900/10 p-10 relative overflow-hidden border border-white/10'>
      <div className='relative z-10'>
        <div className='flex items-center gap-4 mb-6'>
          {icon && (
            <div className='p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-inner group-hover:scale-110 transition-transform duration-500'>
              <div className='text-white brightness-200'>
                {icon}
              </div>
            </div>
          )}
          <h1 className='text-3xl font-black tracking-tight drop-shadow-sm'>
            {title}
          </h1>
        </div>

        <p className='text-blue-50/90 text-[15px] leading-relaxed max-w-2xl font-medium drop-shadow-sm'>
          {description}
        </p>

        {children && (
          <div className='mt-8 pt-8 border-t border-white/10'>
            {children}
          </div>
        )}
      </div>
    </HighGlossBackground>
  )
}

export default TitleComponent
