import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const CustomCard = ({
  title,
  icon,
  description,
  content
}: {
  title: string
  icon?: React.ReactNode
  description?: string
  content: React.ReactNode
}) => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <CardDescription>{description}</CardDescription>
          {content}
        </CardContent>
      </Card>
    </>
  )
}

export default CustomCard
