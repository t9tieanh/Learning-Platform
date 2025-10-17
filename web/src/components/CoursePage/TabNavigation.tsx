import { useState } from 'react'
import { Search } from 'lucide-react'

const tabs = ['Overview', 'Q&A']

export const TabNavigation = () => {
  const [activeTab, setActiveTab] = useState('Overview')

  return (
    <div className='border-b border-border'>
      <div className='flex items-center gap-8 px-6'>
        <button className='p-4 text-muted-foreground hover:text-foreground transition-colors'>
          <Search className='w-5 h-5' />
        </button>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-4 text-sm font-medium transition-colors relative ${
              activeTab === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
            {activeTab === tab && <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-primary' />}
          </button>
        ))}
      </div>
    </div>
  )
}
