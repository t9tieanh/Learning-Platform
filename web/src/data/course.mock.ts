import { Course } from '@/types/course.type'

export const mockCourse: Course = {
  id: 'course-1',
  title: 'React nâng cao: Xây dựng ứng dụng thực tế',
  thumbnailUrl: 'https://picsum.photos/seed/react/1200/600',
  introVideo: 'https://www.w3schools.com/html/mov_bbb.mp4',
  shortDescription: 'Khóa học giúp bạn đi từ hiểu biết cơ bản về React đến xây dựng ứng dụng production.',
  longDescription:
    'Trong khoá học này bạn sẽ học các patterns nâng cao của React, tối ưu hiệu năng, quản lý state với các thư viện phổ biến, viết unit test và deploy ứng dụng thực tế.',
  studentsCount: 1240,
  rating: 4.7,
  reviewsCount: 312,
  originalPrice: 1990000,
  finalPrice: 990000,
  category: 'Frontend',
  tags: ['react', 'typescript', 'frontend', 'performance'],
  status: 'published',
  learningOutcomes: [
    'Hiểu sâu về hooks và lifecycle',
    'Tối ưu re-render và memoization',
    'Quản lý state phức tạp với Zustand/Redux',
    'Triển khai CI/CD cho ứng dụng React'
  ],
  prerequisites: ['JavaScript cơ bản', 'HTML/CSS cơ bản'],
  sections: [
    {
      id: 'sec-1',
      title: 'Giới thiệu & Thiết lập',
      order: 1,
      lessons: [
        {
          id: 'l-1',
          title: 'Giới thiệu khóa học',
          type: 'video',
          duration: '05:12',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          completed: false
        },
        {
          id: 'l-2',
          title: 'Cài đặt môi trường',
          type: 'article',
          duration: '08:30'
        }
      ]
    },
    {
      id: 'sec-2',
      title: 'Hooks nâng cao',
      order: 2,
      lessons: [
        {
          id: 'l-3',
          title: 'useMemo & useCallback',
          type: 'video',
          duration: '12:45',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
        }
      ]
    }
  ],
  instructor: {
    id: 'instr-1',
    name: 'Nguyễn Văn A',
    image: 'https://i.pravatar.cc/150?img=12',
    bio: 'Kỹ sư phần mềm với 8 năm kinh nghiệm frontend',
    coursesCount: 6,
    email: 'nguyenvana@example.com'
  },
  stats: {
    revenue: 125000000,
    publishedAt: '2024-09-10'
  },
  reviews: [
    {
      id: 'r-1',
      reviewerName: 'Phạm Tiến Anh',
      reviewerAvatar: 'https://i.pravatar.cc/150?img=3',
      rating: 5,
      comment: 'Khóa học rất chất lượng, nội dung thực tế và dễ áp dụng.',
      date: '2024-10-01'
    },
    {
      id: 'r-2',
      reviewerName: 'Nguyễn Thị B',
      reviewerAvatar: 'https://i.pravatar.cc/150?img=8',
      rating: 4,
      comment: 'Giảng viên giải thích rõ ràng, chỉ mong có thêm bài tập thực hành.',
      date: '2024-10-05'
    }
  ]
}

export const mockCourses: Course[] = [mockCourse]

export default mockCourse
