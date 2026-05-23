import ExpandableCheckList from '@/components/common/ExpandableCheckList'

const WhatYouWillLearn = ({ learningPoints }: { learningPoints: string[] }) => {
  return (
    <section className='my-8 bg-white px-4 md:px-0'>
      <div className='shrink-0'>
        <h4 className='font-bold max-w-80 bg-blue-500 text-white p-2 rounded-r-3xl md:pl-12 pl-4'>
          Kiến thức đạt được
        </h4>
      </div>

      <ExpandableCheckList items={learningPoints} listClassName='my-8' />
    </section>
  )
}

export default WhatYouWillLearn
