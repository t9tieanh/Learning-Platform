import { useState } from 'react'
import { BarChart3, Target, DollarSign, MessageSquare, GraduationCap } from 'lucide-react'
import AnalyticsTab from '@/components/TC_Statistics/AnalyticsTab'
import RevenueTab from '@/components/TC_Statistics/RevenueTab'
import FeedbackTab from '@/components/TC_Statistics/FeedbackTab'

const tabs = [
  { id: 'analytics', label: 'Phân tích học viên', icon: BarChart3 },
  { id: 'revenue', label: 'Doanh thu', icon: DollarSign },
  { id: 'feedback', label: 'Phản hồi', icon: MessageSquare }
] as const

type TabId = (typeof tabs)[number]['id']

const tabContent: Record<TabId, JSX.Element> = {
  analytics: <AnalyticsTab />,
  revenue: <RevenueTab />,
  feedback: <FeedbackTab />
}

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>('analytics')

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <header className='border-b border-border bg-card sticky top-0 z-10'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3'>
          <div className='rounded-xl bg-blue-100 p-2'>
            <BarChart3 size={22} className='text-blue-600' />
          </div>
          <div>
            <h1 className='text-lg font-bold text-card-foreground tracking-tight'>Trang thống kê</h1>
            <p className='text-xs text-muted-foreground'>Tổng quan hiệu suất khóa học</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className='border-b border-border bg-card'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6'>
          <nav className='flex gap-1 overflow-x-auto -mb-px'>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 py-6'>{tabContent[activeTab]}</main>
    </div>
  )
}

export default Index
