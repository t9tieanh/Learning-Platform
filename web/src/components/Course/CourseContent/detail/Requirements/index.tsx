import ExpandableCheckList from '@/components/common/ExpandableCheckList'

interface RequirementsProps {
  requirements: string[]
}

const Requirements = ({ requirements }: RequirementsProps) => {
  return <ExpandableCheckList items={requirements ?? []} listClassName='my-3' />
}

export default Requirements
