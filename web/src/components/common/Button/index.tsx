import { Button } from '@/components/ui/button'

const CustomButton = ({ label, className, onClick }: { label: string; className?: string; onClick: () => void }) => {
  return (
    <>
      <Button className={className} onClick={onClick}>
        {label}
      </Button>
    </>
  )
}

export default CustomButton
