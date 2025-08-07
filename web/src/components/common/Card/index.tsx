import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const CustomCard = ({
  title,
  icon,
  description,
  content,
  className
}: {
  title: string
  icon?: React.ReactNode
  description?: string
  content: React.ReactNode
  className?: string
}) => {
  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className='text-lg flex items-center'>{icon}&nbsp;{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    </>
  )
}

export default CustomCard
