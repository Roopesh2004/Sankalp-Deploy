import { Course, User } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@sankalp.com',
    phone: '1234567890',
    role: 'admin',
  },
];

export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Full Stack Web Development',
    description: 'Learn modern web development from scratch to deployment',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
    duration: '12 weeks',
    curriculum: [
      {
        title: 'Frontend Fundamentals',
        topics: ['HTML5', 'CSS3', 'JavaScript ES6+', 'React Basics'],
        duration: '4 weeks'
      },
      {
        title: 'Backend Development',
        topics: ['Node.js', 'Express', 'RESTful APIs', 'Database Design'],
        duration: '4 weeks'
      },
      {
        title: 'Advanced Concepts',
        topics: ['Authentication', 'Testing', 'Deployment', 'Performance'],
        duration: '4 weeks'
      }
    ],
    modules: [
      {
        id: 'm1',
        title: 'Introduction to HTML & CSS',
        day: 1,
        videoUrl: 'https://example.com/video1',
        materials: ['HTML Basics Guide.pdf', 'CSS Fundamentals Handbook.pdf'],
      },
      {
        id: 'm2',
        title: 'JavaScript Fundamentals',
        day: 2,
        videoUrl: 'https://example.com/video2',
        materials: ['JavaScript Basics.pdf', 'Coding Exercises.pdf'],
      },
      {
        id: 'm3',
        title: 'React Essentials',
        day: 3,
        videoUrl: 'https://example.com/video3',
        materials: ['React Guide.pdf', 'Component Patterns.pdf'],
      },
    ],
  },
  {
    id: '2',
    title: 'Data Science Fundamentals',
    description: 'Master the basics of data science and analytics',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
    duration: '10 weeks',
    curriculum: [
      {
        title: 'Python Programming',
        topics: ['Python Basics', 'Data Structures', 'Functions', 'OOP'],
        duration: '3 weeks'
      },
      {
        title: 'Data Analysis',
        topics: ['NumPy', 'Pandas', 'Data Visualization', 'Statistical Analysis'],
        duration: '4 weeks'
      },
      {
        title: 'Machine Learning',
        topics: ['Supervised Learning', 'Unsupervised Learning', 'Model Evaluation'],
        duration: '3 weeks'
      }
    ],
    modules: [
      {
        id: 'm1',
        title: 'Python Basics',
        day: 1,
        videoUrl: 'https://example.com/video1',
        materials: ['Python Introduction.pdf', 'Practice Problems.pdf'],
      },
      {
        id: 'm2',
        title: 'Data Analysis with Pandas',
        day: 2,
        videoUrl: 'https://example.com/video2',
        materials: ['Pandas Guide.pdf', 'Data Analysis Examples.pdf'],
      },
    ],
  },
];