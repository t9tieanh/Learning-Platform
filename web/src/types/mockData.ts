export interface Instructor {
  id: string;
  name: string;
  email: string;
  courseCount: number;
  status: "active" | "locked";
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  instructorId: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
  description?: string;
  thumbnail?: string;
}

export interface Certificate {
  id: string;
  userName: string;
  courseName: string;
  courseId: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  certificateUrl?: string;
  imageUrl?: string;
  organization?: string;
}

export interface Blog {
  id: string;
  title: string;
  author: string;
  publishedAt: string;
}

export const mockInstructors: Instructor[] = [
  {
    id: "1",
    name: "Nguyễn Văn An",
    email: "an.nguyen@example.com",
    courseCount: 12,
    status: "active",
  },
  {
    id: "2",
    name: "Trần Thị Bình",
    email: "binh.tran@example.com",
    courseCount: 8,
    status: "active",
  },
  {
    id: "3",
    name: "Lê Hoàng Cường",
    email: "cuong.le@example.com",
    courseCount: 15,
    status: "active",
  },
  {
    id: "4",
    name: "Phạm Minh Đức",
    email: "duc.pham@example.com",
    courseCount: 5,
    status: "locked",
  },
];

export const mockCourses: Course[] = [
  {
    id: "1",
    title: "React từ cơ bản đến nâng cao",
    instructor: "Nguyễn Văn An",
    instructorId: "1",
    createdAt: "2024-01-15",
    status: "approved",
    description: "Khóa học toàn diện về ReactJS, từ các khái niệm cơ bản đến các kỹ thuật nâng cao như hooks, context API, và performance optimization.",
  },
  {
    id: "2",
    title: "Node.js Backend Development",
    instructor: "Trần Thị Bình",
    instructorId: "2",
    createdAt: "2024-02-20",
    status: "pending",
    description: "Học cách xây dựng RESTful API với Node.js, Express, và MongoDB. Bao gồm authentication, authorization, và best practices.",
  },
  {
    id: "3",
    title: "UI/UX Design Fundamentals",
    instructor: "Lê Hoàng Cường",
    instructorId: "3",
    createdAt: "2024-03-10",
    status: "approved",
    description: "Khám phá các nguyên tắc cơ bản của thiết kế UI/UX, từ research, wireframing, prototyping đến testing.",
  },
  {
    id: "4",
    title: "Python for Data Science",
    instructor: "Phạm Minh Đức",
    instructorId: "4",
    createdAt: "2024-03-25",
    status: "rejected",
    description: "Khóa học về Python áp dụng trong Data Science, bao gồm pandas, numpy, và các thư viện machine learning cơ bản.",
  },
];

export const mockCertificates: Certificate[] = [
  {
    id: "1",
    userName: "Hoàng Minh Tuấn",
    courseName: "React từ cơ bản đến nâng cao",
    courseId: "1",
    submittedAt: "2024-03-28",
    status: "pending",
    certificateUrl: 'https://www.credly.com/badges/b2c04f72-b12c-482d-820b-14ccd2027f01/public_url',
    imageUrl: 'https://picsum.photos/400/200',
    organization: 'Amazon'
  },
  {
    id: "2",
    userName: "Ngô Thanh Hà",
    courseName: "UI/UX Design Fundamentals",
    courseId: "3",
    submittedAt: "2024-03-27",
    status: "approved",
    certificateUrl: 'https://www.credly.com/badges/b2c04f72-b12c-482d-820b-14ccd2027f01/public_url',
    imageUrl: 'https://png.pngtree.com/png-vector/20210715/ourlarge/pngtree-certificate-graduation-template-design-with-blue-and-golden-png-image_3601584.jpg',
    organization: 'Amazon'

  },
  {
    id: "3",
    userName: "Đặng Quốc Khánh",
    courseName: "React từ cơ bản đến nâng cao",
    courseId: "1",
    submittedAt: "2024-03-26",
    status: "pending",
    organization: 'Amazon',
    certificateUrl: 'https://www.credly.com/badges/b2c04f72-b12c-482d-820b-14ccd2027f01/public_url',
    imageUrl: 'https://png.pngtree.com/png-vector/20210715/ourlarge/pngtree-certificate-graduation-template-design-with-blue-and-golden-png-image_3601584.jpg'
  },
];

export const mockBlogs: Blog[] = [
  {
    id: "1",
    title: "10 mẹo học lập trình hiệu quả",
    author: "Nguyễn Văn An",
    publishedAt: "2024-03-20",
  },
  {
    id: "2",
    title: "Xu hướng công nghệ 2024",
    author: "Trần Thị Bình",
    publishedAt: "2024-03-18",
  },
  {
    id: "3",
    title: "Thiết kế responsive với Tailwind CSS",
    author: "Lê Hoàng Cường",
    publishedAt: "2024-03-15",
  },
];
