import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CalendarDays, Clock } from 'lucide-react'

const scheduleItems = [
  { time: '10.00 AM', title: 'Họp nhóm', description: 'Thảo luận dự án cuối kỳ' },
  { time: '11.00 AM', title: 'Bài giảng', description: 'Lập trình ReactJS' },
  { time: '05.00 PM', title: 'Ôn tập', description: 'Ôn lại kiến thức đã học' },
  { time: '07.00 PM', title: 'Giải trí', description: 'Chơi thể thao cùng bạn bè' }
]

const ScheduleSection = () => {
  return (
    <Card className='mb-6 shadow-lg'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 md:gap-3'>
          <CalendarDays className='text-dashboard-primary' size={20} md:size={24} />
          <span className='font-semibold text-base md:text-lg'>Lịch của tôi</span>
        </CardTitle>
        <span className='text-xs md:text-sm text-muted-foreground mt-1 flex items-center gap-1 font-medium'>
          <CalendarDays size={14} md:size={16} />
          Ngày: {new Date().toLocaleDateString()}
        </span>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {scheduleItems.map((item, index) => (
            <div
              key={index}
              className='flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 p-2 md:p-3 rounded-lg bg-dashboard-primary/5 hover:bg-dashboard-primary/10 transition-all border border-dashboard-primary/10'
            >
              <div className='flex items-center gap-2 min-w-[70px] md:min-w-[90px]'>
                <Clock className='text-dashboard-primary' size={16} md:size={18} />
                <span className='text-xs md:text-sm font-semibold text-dashboard-primary'>{item.time}</span>
              </div>
              <div className='flex-1 pl-0 md:pl-4'>
                <h4 className='font-semibold text-dashboard-primary text-sm md:text-base'>{item.title}</h4>
                <p className='text-xs md:text-sm text-muted-foreground'>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className='mt-4 md:mt-6 text-center'>
          <Button
            variant='outline'
            className='border-dashboard-primary text-dashboard-primary hover:bg-dashboard-primary hover:text-white transition-all px-3 py-1 text-xs md:text-base'
          >
            Xem tất cả
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default ScheduleSection
