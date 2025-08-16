import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Clapperboard, Play } from 'lucide-react'
import CustomButton from '@/components/common/Button'
import './style.scss'

interface SectionProps {
  title: string
  posts?: { title: string; isPublic: boolean }[]
}

const Post = ({ title, isPublic, className }: { title: string; isPublic: boolean; className?: string }) => {
  return (
    <AccordionContent className={`bg-gray-100 post p-2 mb-0 flex items-center justify-between ${className}`}>
      <div className='flex items-center text-gray-700 font-medium'>
        <Clapperboard size={15} />
        &nbsp;&nbsp;
        {title}
      </div>
      {isPublic && (
        <div className='flex items-center'>
          <CustomButton icon={<Play size={15} />} variant={'icon'} label='Xem trước bài học này' />
        </div>
      )}
    </AccordionContent>
  )
}

const Section = ({ title, posts }: SectionProps) => {
  return (
    <AccordionItem value={title} className='m-0 shadow-md'>
      <AccordionTrigger className='bg-white text-black font-nomal p-3 text-sm flex items-center !justify-start !gap-0 hover:no-underline'>
        {title}
        <span className='text-xs ml-1'>2 bài học</span>
      </AccordionTrigger>
      {posts && posts.map((post, index) => <Post key={index} title={post.title} isPublic={post.isPublic} />)}
    </AccordionItem>
  )
}

const Sections = () => {
  const sections = [
    {
      title: 'Giới thiệu về khóa học',
      posts: [
        { title: 'Chào mừng đến với khóa học', isPublic: true },
        { title: 'Cách học hiệu quả', isPublic: false },
        { title: 'Giới thiệu giảng viên', isPublic: true }
      ]
    },
    {
      title: 'Cơ bản về React',
      posts: [
        { title: 'JSX là gì?', isPublic: true },
        { title: 'Component và Props', isPublic: true },
        { title: 'State và Lifecycle', isPublic: false },
        { title: 'Xử lý sự kiện', isPublic: true }
      ]
    },
    {
      title: 'Nâng cao về React',
      posts: [
        { title: 'Hooks cơ bản', isPublic: true },
        { title: 'Custom Hooks', isPublic: false },
        { title: 'Context API', isPublic: true },
        { title: 'Performance Optimization', isPublic: false }
      ]
    },
    {
      title: 'Quản lý dữ liệu',
      posts: [
        { title: 'Redux cơ bản', isPublic: true },
        { title: 'Redux Toolkit', isPublic: false },
        { title: 'React Query', isPublic: true }
      ]
    },
    {
      title: 'Triển khai và nâng cấp',
      posts: [
        { title: 'Build & Deploy', isPublic: true },
        { title: 'CI/CD với Github Actions', isPublic: false },
        { title: 'Nâng cấp dự án', isPublic: true }
      ]
    },
    {
      title: 'Câu hỏi thường gặp',
      posts: [
        { title: 'Làm sao để nhận chứng chỉ?', isPublic: true },
        { title: 'Hỗ trợ kỹ thuật', isPublic: true },
        { title: 'Liên hệ giảng viên', isPublic: false }
      ]
    }
  ]

  return (
    <Accordion className='sections-list' type='single' collapsible defaultValue={sections[0]?.title}>
      {sections &&
        sections.map((section, index) => <Section key={index} title={section.title} posts={section.posts} />)}
    </Accordion>
  )
}

export default Sections
