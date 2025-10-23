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
    <div className='mb-8 bg-blue-950 text-white rounded-xl shadow-lg p-6'>
      <h1 className='text-2xl flex items-center font-semibold mb-3 text-blue-300'>
        {icon && <span className='mr-2'>{icon}</span>}
        {title}
      </h1>
      <p className='text-blue-100 text-base leading-relaxed'>{description}</p>
      {children}
    </div>
  )
}

export default TitleComponent
