import { BiSolidDetail } from 'react-icons/bi'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface FeedbackProps {
  owner: {
    name: string
    avatar: string
  }
  content: string
  rating: number
  createdAt: string
}

const Feedback = ({ feedback }: { feedback: FeedbackProps }) => {
  return (
    <div className='grid grid-cols-8 gap-2'>
      <div className='col-span-1'>
        <Avatar>
          <AvatarImage src={feedback.owner.avatar} alt={feedback.owner.name} />
          <AvatarFallback>{feedback.owner.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
      <div className='col-span-7'>
        <h3 className='text-sm font-semibold'>{feedback.owner.name}</h3>
        <p className='text-sm'>Sinh viên</p>
        <p className='text-sm text-gray-800'>{feedback.createdAt}</p>
        <p className='text-gray-600 text-sm mt-2 italic'>{feedback.content}</p>
      </div>
    </div>
  )
}

const Feedbacks = () => {
  const feedbacks: FeedbackProps[] = [
    {
      owner: {
        name: 'Phạm Tiến Anh',
        avatar: 'https://i.pravatar.cc/150?img=3'
      },
      content:
        'Khóa học này thực sự rất hữu ích, giúp mình hiểu rõ hơn về các khái niệm React và áp dụng được vào dự án thực tế. Giảng viên hướng dẫn rất chi tiết và dễ hiểu.',
      rating: 5,
      createdAt: '2023-03-15'
    },
    {
      owner: {
        name: 'Nguyễn Đức Sang',
        avatar: 'https://i.pravatar.cc/150?img=4'
      },
      content:
        'Nội dung khóa học rất đầy đủ và cập nhật, tuy nhiên tốc độ giảng hơi nhanh nên mình phải xem lại một số bài để nắm chắc kiến thức. Tổng thể thì rất hài lòng.',
      rating: 4,
      createdAt: '2023-03-16'
    },
    {
      owner: {
        name: 'Nguyễn Công Qúy',
        avatar: 'https://i.pravatar.cc/150?img=5'
      },
      content:
        'Mình đánh giá cao sự hỗ trợ của giảng viên trong suốt quá trình học. Các ví dụ thực hành rất sát với thực tế, giúp mình tự tin hơn khi làm việc với React.',
      rating: 5,
      createdAt: '2023-03-17'
    },
  ]

  return (
    <>
      <h4 className='font-bold bg-slate-800 text-white p-2 rounded-r-3xl max-w-md text-center flex'>
        <BiSolidDetail size={20} className='mt-1' />
        &nbsp;Phản hồi từ học viên khóa học này
      </h4>
      <div className='feedback-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 p-10 place-items-center'>
        {feedbacks.map((feedback, index) => (
          <Feedback key={index} feedback={feedback} />
        ))}
      </div>
    </>
  )
}

export default Feedbacks
