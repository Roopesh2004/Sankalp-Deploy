const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  // Create connection without database specified
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'student_db'}`);
    console.log(`Database ${process.env.DB_NAME || 'student_db'} created or already exists`);
    
    // Use the database
    await connection.execute(`USE ${process.env.DB_NAME || 'student_db'}`);
    
    // Create students table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        phone VARCHAR(20),
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Students table created or already exists');
    
    // Create pending table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS pending (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        transactionid VARCHAR(100) NOT NULL,
        courseName VARCHAR(100) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status TINYINT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Pending table created or already exists');
    
    // Create courses table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        thumbnail VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Courses table created or already exists');
    
    // Create course_modules table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS course_modules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        courseId INT NOT NULL,
        title VARCHAR(100) NOT NULL,
        day INT NOT NULL,
        videoUrl VARCHAR(255),
        FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
      )
    `);
    console.log('Course modules table created or already exists');
    
    // Create module_materials table with courseId field
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS module_materials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        moduleId INT NOT NULL,
        courseId INT NOT NULL,
        material VARCHAR(255) NOT NULL,
        FOREIGN KEY (moduleId) REFERENCES course_modules(id) ON DELETE CASCADE,
        FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
      )
    `);
    console.log('Module materials table created or already exists');
    
    // Create user_courses table (for tracking which users have access to which courses)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        courseId INT NOT NULL,
        accessGranted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
        UNIQUE KEY user_course (userId, courseId)
      )
    `);
    console.log('User courses table created or already exists');
    
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await connection.end();
  }
}

setupDatabase();

