import React from 'react';
import { motion } from 'framer-motion';

interface CourseCardProps {
  course: {
    id: number;
    title: string;
    description: string;
    duration: string;
    level: string;
    image?: string;
  };
  onClick: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer h-full flex flex-col"
    >
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 h-40 rounded-t-lg flex items-center justify-center">
        {course.image ? (
          <img 
            src={course.image} 
            alt={course.title} 
            className="h-full w-full object-cover rounded-t-lg"
          />
        ) : (
          <div className="text-4xl font-bold text-white">
            {course.title.charAt(0)}
          </div>
        )}
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg font-semibold text-primary-400 mb-2">{course.title}</h3>
        <p className="text-gray-400 text-sm mb-4 flex-grow">
          {course.description.length > 100 
            ? `${course.description.substring(0, 100)}...` 
            : course.description}
        </p>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>{course.duration}</span>
          <span>{course.level}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
