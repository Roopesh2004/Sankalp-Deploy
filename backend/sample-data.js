const mysql = require('mysql2/promise');
require('dotenv').config();

async function insertSampleData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'student_db'
  });

  try {
    // Insert sample course
    const [courseResult] = await connection.execute(
      'INSERT INTO courses (title, description, thumbnail) VALUES (?, ?, ?)',
      [
        'Sankalp 2.0 Training Program',
        'Comprehensive training program for students by SpectoV',
        'https://example.com/course-thumbnail.jpg'
      ]
    );
    
    const courseId = courseResult.insertId;
    console.log(`Created course with ID: ${courseId}`);
    
    // Insert sample modules
    const modules = [
      {
        title: 'Introduction to the Program',
        day: 1,
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Replace with your actual unlisted YouTube URL
        materials: ['Introduction Slides', 'Getting Started Guide']
      },
      {
        title: 'Core Concepts',
        day: 2,
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Replace with your actual unlisted YouTube URL
        materials: ['Core Concepts PDF', 'Practice Exercises']
      },
      {
        title: 'Advanced Techniques',
        day: 3,
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Replace with your actual unlisted YouTube URL
        materials: ['Advanced Techniques Manual', 'Case Studies']
      }
    ];
    
    for (const module of modules) {
      const [moduleResult] = await connection.execute(
        'INSERT INTO course_modules (courseId, title, day, videoUrl) VALUES (?, ?, ?, ?)',
        [courseId, module.title, module.day, module.videoUrl]
      );
      
      const moduleId = moduleResult.insertId;
      console.log(`Created module with ID: ${moduleId}`);
      
      // Insert materials for this module
      for (const material of module.materials) {
        await connection.execute(
          'INSERT INTO module_materials (moduleId, courseId, material) VALUES (?, ?, ?)',
          [moduleId, courseId, material]
        );
      }
    }
    
    console.log('Sample data inserted successfully');
  } catch (error) {
    console.error('Error inserting sample data:', error);
  } finally {
    await connection.end();
  }
}

insertSampleData();
