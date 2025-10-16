import { Course } from '@/types/course.type'

export const mockCourse: Course = {
  id: 'course_01',
  title: 'Xây dựng API RESTful với Node.js & Express',
  coverImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1200&h=600&fit=crop',
  introVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  shortDescription:
    'Học cách xây dựng API RESTful chuyên nghiệp từ đầu đến cuối với Node.js, Express và MongoDB. Khóa học bao gồm authentication, authorization, testing và deployment.',
  longDescription: `
    <h2>Giới thiệu khóa học</h2>
    <p>Khóa học này sẽ giúp bạn nắm vững kiến thức về việc xây dựng API RESTful sử dụng Node.js và Express.</p>
  `,
  studentsCount: 1240,
  rating: 4.7,
  reviewsCount: 312,
  price: 1499000,
  category: 'Lập trình Backend',
  tags: ['Node.js', 'API', 'Backend', 'Express', 'MongoDB'],
  status: 'published',
  learningOutcomes: [
    'Hiểu rõ kiến trúc REST và các best practices',
    'Xây dựng API an toàn với authentication và authorization',
    'Triển khai testing cho API',
    'Deploy API lên production server',
    'Xử lý errors và validation hiệu quả',
    'Làm việc với MongoDB và Mongoose'
  ],
  prerequisites: ['JavaScript cơ bản (ES6+)', 'Node.js căn bản', 'Hiểu biết về HTTP protocol', 'Git và GitHub'],
  sections: [
    {
      id: 's1',
      title: 'Khởi đầu với Node.js',
      order: 1,
      lessons: [
        {
          id: 'l1',
          title: 'Giới thiệu khóa học',
          type: 'video',
          duration: '5:12',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          completed: true
        },
        {
          id: 'l2',
          title: 'Setup môi trường phát triển',
          type: 'video',
          duration: '12:45',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          completed: true
        },
        {
          id: 'l3',
          title: 'Tạo project đầu tiên',
          type: 'video',
          duration: '18:30',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          completed: false
        }
      ]
    },
    {
      id: 's2',
      title: 'REST API Fundamentals',
      order: 2,
      lessons: [
        {
          id: 'l4',
          title: 'REST là gì?',
          type: 'video',
          duration: '15:20',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
        },
        {
          id: 'l5',
          title: 'HTTP Methods và Status Codes',
          type: 'video',
          duration: '22:15',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
        },
        {
          id: 'l6',
          title: 'Thiết kế API endpoints',
          type: 'article',
          duration: '10:00'
        },
        {
          id: 'l7',
          title: 'Quiz: REST Fundamentals',
          type: 'quiz',
          duration: '15:00'
        }
      ]
    },
    {
      id: 's3',
      title: 'Express.js Framework',
      order: 3,
      lessons: [
        {
          id: 'l8',
          title: 'Giới thiệu Express.js',
          type: 'video',
          duration: '10:30',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
        },
        {
          id: 'l9',
          title: 'Routing trong Express',
          type: 'video',
          duration: '25:45',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
        },
        {
          id: 'l10',
          title: 'Middleware pattern',
          type: 'video',
          duration: '20:00',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
        }
      ]
    },
    {
      id: 's4',
      title: 'Database với MongoDB',
      order: 4,
      lessons: [
        {
          id: 'l11',
          title: 'MongoDB cơ bản',
          type: 'video',
          duration: '18:30'
        },
        {
          id: 'l12',
          title: 'Mongoose ODM',
          type: 'video',
          duration: '30:15'
        },
        {
          id: 'l13',
          title: 'Schema và Models',
          type: 'video',
          duration: '25:00'
        }
      ]
    }
  ],
  instructor: {
    id: 'ins_01',
    name: 'Nguyễn Văn An',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    bio: 'Senior Backend Developer với 10+ năm kinh nghiệm. Chuyên gia về Node.js, microservices và cloud architecture.',
    coursesCount: 8,
    email: 'nguyenvanan@example.com'
  },
  stats: {
    revenue: 183876000,
    publishedAt: '2024-09-01'
  },
  reviews: [
    {
      id: 'r1',
      reviewerName: 'Trần Minh Tuấn',
      reviewerAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
      rating: 5,
      comment:
        'Khóa học rất chi tiết và dễ hiểu. Giảng viên giải thích rất rõ ràng, các ví dụ thực tế giúp mình áp dụng ngay vào công việc. Highly recommended!',
      date: '2025-01-15'
    },
    {
      id: 'r2',
      reviewerName: 'Lê Thị Mai',
      reviewerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      rating: 5,
      comment:
        'Nội dung khóa học đầy đủ từ cơ bản đến nâng cao. Mình đã build được API cho dự án của công ty sau khi học xong.',
      date: '2025-01-10'
    },
    {
      id: 'r3',
      reviewerName: 'Phạm Đức Anh',
      reviewerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      rating: 4,
      comment: 'Khóa học hay, giảng viên nhiệt tình. Chỉ mong có thêm phần về GraphQL và microservices.',
      date: '2025-01-05'
    },
    {
      id: 'r4',
      reviewerName: 'Hoàng Thị Lan',
      reviewerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      rating: 5,
      comment: 'Perfect! Đây là khóa học Node.js tốt nhất mà mình từng học. Cảm ơn thầy rất nhiều!',
      date: '2024-12-28'
    },
    {
      id: 'r5',
      reviewerName: 'Ngô Văn Bình',
      reviewerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      rating: 4,
      comment: 'Nội dung tốt, video chất lượng cao. Tuy nhiên mình thấy phần testing có thể chi tiết hơn một chút.',
      date: '2024-12-20'
    },
    {
      id: 'r6',
      reviewerName: 'Vũ Thị Hương',
      reviewerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
      rating: 5,
      comment: 'Xuất sắc! Mình đã chuyển từ frontend sang backend sau khóa học này. Cảm ơn giảng viên!',
      date: '2024-12-15'
    }
  ]
}
