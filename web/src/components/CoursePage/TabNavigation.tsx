import { useState } from 'react'
import { Search } from 'lucide-react'
import { QASection } from './QASection'

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
            className={`py-4 text-sm font-medium transition-colors relative ${activeTab === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            {tab}
            {activeTab === tab && <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-primary' />}
          </button>
        ))}
      </div>

      <div className='py-8'>
        {activeTab === 'Overview' && (
          <div className='max-w-4xl mx-auto px-6'>
            <h2 className='text-xl font-bold text-foreground mb-4'>Overview</h2>
            <p className='text-muted-foreground'>
              This is the overview section. Add your content here.
            </p>
          </div>
        )}
        {activeTab === 'Q&A' && <QASection />}
      </div>
    </div>
  )
}
