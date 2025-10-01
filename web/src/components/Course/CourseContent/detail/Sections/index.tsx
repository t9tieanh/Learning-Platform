import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { PlayCircle, Clock, FileText } from 'lucide-react'

const CourseSections = () => {
  const sections = [
    {
      title: 'Giới thiệu về khóa học',
      lessons: 2,
      duration: '30 phút',
      topics: ['Tổng quan về khóa học và mục tiêu', 'Cài đặt môi trường phát triển']
    },
    {
      title: 'Cơ bản về React',
      lessons: 2,
      duration: '45 phút',
      topics: ['Components và JSX', 'Props và State cơ bản']
    },
    {
      title: 'Nâng cao về React',
      lessons: 2,
      duration: '60 phút',
      topics: ['Hooks và Context API', 'State Management với Redux']
    },
    {
      title: 'Quản lý dữ liệu',
      lessons: 2,
      duration: '50 phút',
      topics: ['API Integration', 'Form Handling và Validation']
    },
    {
      title: 'Triển khai và nâng cấp',
      lessons: 2,
      duration: '40 phút',
      topics: ['Build và Deploy ứng dụng', 'Performance Optimization']
    },
    {
      title: 'Câu hỏi thường gặp',
      lessons: 2,
      duration: '25 phút',
      topics: ['Debugging và Troubleshooting', 'Best Practices và Tips']
    }
  ]

  return (
    <Accordion type='single' collapsible className='w-full space-y-4'>
      {sections.map((section, index) => (
        <AccordionItem
          key={index}
          value={`item-${index}`}
          className='border border-border rounded-lg bg-card hover:shadow-soft transition-all duration-300'
        >
          <AccordionTrigger className='px-6 py-4 hover:no-underline group'>
            <div className='flex items-center justify-between w-full text-left'>
              <div className='flex items-center gap-4'>
                <div className='w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-semibold'>
                  {index + 1}
                </div>
                <div>
                  <h3 className='font-semibold text-foreground group-hover:text-primary transition-colors'>
                    {section.title}
                  </h3>
                  <div className='flex items-center gap-4 mt-1 text-sm text-muted-foreground'>
                    <div className='flex items-center gap-1'>
                      {React.createElement(FileText, { className: 'w-4 h-4' })}
                      <span>{section.lessons} bài học</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      {React.createElement(Clock, { className: 'w-4 h-4' })}
                      <span>{section.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
              <Badge className='hidden sm:inline-flex bg-blue-600'>{section.lessons} bài</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className='px-6 pb-6'>
            <div className='ml-14 space-y-3'>
              {section.topics.map((topic, topicIndex) => (
                <div
                  key={topicIndex}
                  className='flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors'
                >
                  <div className='w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center'>
                    {React.createElement(PlayCircle, { className: 'w-4 h-4 text-primary' })}
                  </div>
                  <span className='text-muted-foreground'>{topic}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export default CourseSections
