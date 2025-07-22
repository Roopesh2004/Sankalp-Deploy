// server.js - Backend for registration form
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const fetch = require('node-fetch');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'student_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Constants
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const VIDEO_TOKEN_EXPIRY = '1m'; // 1 minute
const OTP_EXPIRY = 10 * 60 * 1000; // 10 minutes in milliseconds
const REGISTRATION_OTP_EXPIRY = 10 * 60 * 1000; // 10 minutes in milliseconds

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Store OTPs in memory (in production, use Redis or another persistent store)
const otpStore = new Map(); // email -> { otp, expiry }
// Store registration OTPs in memory (in production, use Redis or another persistent store)
const registrationOtpStore = new Map(); // email -> { otp, expiry, userData }

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    res.json({ message: 'Database connection successful!' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ message: 'Failed to connect to database', error: error.message });
  }
});

// Modified registration endpoint with OTP verification
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    // Validate input
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Check if user already exists
    const connection = await pool.getConnection();
    const [existingUsers] = await connection.execute(
      'SELECT * FROM students WHERE email = ?',
      [email]
    );
    
    connection.release();
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + REGISTRATION_OTP_EXPIRY;
    
    // Store OTP with user data
    registrationOtpStore.set(email, { 
      otp, 
      expiry,
      userData: { name, email, phone, password }
    });
    
    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Email Verification OTP',
      html: `
        <h1>Email Verification</h1>
        <p>Your OTP for email verification is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ 
      message: 'OTP sent to your email. Please verify to complete registration.' 
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// New endpoint to verify registration OTP
// app.post('/api/verify-registration', async (req, res) => {
//   try {
//     const { email, otp, reg } = req.body;
    
//     if (!email || !otp) {
//       return res.status(400).json({ message: 'Email and OTP are required' });
//     }
    
//     // Check if OTP exists and is valid
//     const otpData = registrationOtpStore.get(email);
    
//     if (!otpData) {
//       return res.status(400).json({ message: 'No OTP found for this email' });
//     }
    
//     if (Date.now() > otpData.expiry) {
//       registrationOtpStore.delete(email);
//       return res.status(400).json({ message: 'OTP has expired' });
//     }
    
//     if (otpData.otp !== otp) {
//       return res.status(400).json({ message: 'Invalid OTP' });
//     }
    
//     // OTP is valid, proceed with registration
//     const { name, email: userEmail, phone, password } = otpData.userData;
    
//     // Hash password
//     const saltRounds = 10;
//     const hashedPassword = await bcrypt.hash(password, saltRounds);
    
//     // Insert new user
//     const connection = await pool.getConnection();
//     const [result] = await connection.execute(
//       `INSERT INTO ${reg}s (name, email, phone, password, referal) VALUES (?, ?, ?, ?, ?)`,
//       [name, userEmail, phone, hashedPassword]
//     );
    
//     connection.release();
    
//     // Clear the OTP
//     registrationOtpStore.delete(email);
    
//     res.status(201).json({
//       message: 'Registration successful',
//       userId: result.insertId
//     });
    
//   } catch (error) {
//     console.error('Registration verification error:', error);
//     res.status(500).json({ message: 'Registration verification failed', error: error.message });
//   }
// });


app.post('/api/verify-registration', async (req, res) => {
  try {
    const { email, otp, reg } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }
    
    // Check if OTP exists and is valid
    const otpData = registrationOtpStore.get(email);
    
    if (!otpData) {
      return res.status(400).json({ message: 'No OTP found for this email' });
    }
    
    if (Date.now() > otpData.expiry) {
      registrationOtpStore.delete(email);
      return res.status(400).json({ message: 'OTP has expired' });
    }
    
    if (otpData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    // OTP is valid, proceed with registration
    const { name, email: userEmail, phone, password } = otpData.userData;
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Generate unique referral ID
    const generateReferralId = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    
    const connection = await pool.getConnection();
    
    let referralId;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 100;
    
    // Generate unique referral ID
    while (!isUnique && attempts < maxAttempts) {
      referralId = generateReferralId();
      
      // Check if referral ID already exists
      const [existingReferral] = await connection.execute(
        `SELECT id FROM ${reg}s WHERE referal = ?`,
        [referralId]
      );
      
      if (existingReferral.length === 0) {
        isUnique = true;
      }
      
      attempts++;
    }
    
    // If unable to generate unique ID after max attempts
    if (!isUnique) {
      connection.release();
      return res.status(500).json({ message: 'Unable to generate unique referral ID. Please try again.' });
    }
    
    // Insert new user with unique referral ID
    const [result] = await connection.execute(
      `INSERT INTO ${reg}s (name, email, phone, password, referal) VALUES (?, ?, ?, ?, ?)`,
      [name, userEmail, phone, hashedPassword, referralId]
    );
    
    connection.release();
    
    // Clear the OTP
    registrationOtpStore.delete(email);
    
    res.status(201).json({
      message: 'Registration successful',
      userId: result.insertId,
      referralId: referralId
    });
    
  } catch (error) {
    console.error('Registration verification error:', error);
    res.status(500).json({ message: 'Registration verification failed', error: error.message });
  }
});

// Updated login endpoint with better debugging and error handling
app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      console.log(`Login attempt for email: ${email}`);
      
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      
      // Get user from database
      const connection = await pool.getConnection();
      const [users] = await connection.execute(
        'SELECT * FROM students WHERE email = ?',
        [email]
      );
      
      connection.release();
      
      if (users.length === 0) {
        console.log(`No user found with email: ${email}`);
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      const user = users[0];
      console.log(`User found: ${user.name}, comparing passwords`);
      console.log(password,user.password)
      
      // Compare password
      const passwordMatch = await bcrypt.compare(password, user.password);
      
      if (!passwordMatch) {
        console.log('Password does not match');
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      console.log('Login successful');
      
      // Create user object without password
      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        referal:user.referal,
        points:user.points
      };

      // console.log(userResponse)
      
      res.json({
        message: 'Login successful',
        user: userResponse
      });
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed', error: error.message });
    }
  });


  app.post('/api/pending', async (req, res) => {
    try {
      const { pendingRegistrationData, reg } = req.body;
      const { name, email, transid, refid , courseName, amt, courseId } = pendingRegistrationData;
      
      console.log(`Pending registration for email: ${email}, course: ${courseName}`);
      
      // Validate input
      if (!name || !email || !transid || !courseName || !amt || !courseId) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      
      // Get user from database
      const connection = await pool.getConnection();
      
      // Check if already in pending for this course
      const [existingPending] = await connection.execute(
        'SELECT * FROM pending WHERE email = ? AND courseName = ? AND employee = ?',
        [email, courseName, reg==='student'?0:1]
      );
      
      if (existingPending.length > 0) {
        connection.release();
        return res.status(409).json({ 
          message: 'You already have a pending registration for this course',
          value: 0
        });
      }
      
      // Insert into pending table
      const [result] = await connection.execute(
        'INSERT INTO pending (name, email, transactionid, referalid, courseName, amount, courseId, status, employee) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [name, email, transid, refid, courseName, amt, courseId, 0, reg==='student'?0:1]
      );
      
      connection.release();
      
      console.log('Registration is under review');
      
      res.json({
        message: 'Registration is under review',
        value: 0
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed', error: error.message });
    }
  });


   app.post('/api/maintenance', async (req, res) => {
    try {
      const {registrationData , reg} = req.body;

      const regData= registrationData;
      console.log(regData)
      
      // Validate input
      if (!regData) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      
      // Get user from database
      const connection = await pool.getConnection();

      

      
      // Check if already in pending for this course
      const [existingPending] = await connection.execute(
        'UPDATE pending SET maintenance_fee = ?, maintenance_transaction = ? WHERE email = ? AND courseName = ? AND employee = ?',
        [1,regData.transid,regData.email, regData.courseName,reg==='employee'?1:0]
      );
      
      if (existingPending.length) {
        connection.release();
        return res.status(409).json({});
      }
      
      // console.log('Registration is under review');
      
      res.json({});
      
    } catch (error) {
      // console.error('Registration error:', error);
      res.status(500).json();
    }
  });

  


  app.post('/api/pending-check', async (req, res) => {
    try {
      const { email, courseId, reg } = req.body;
      
      console.log(`Pending check for email: ${email}, courseId: ${courseId}`);
      
      // Validate input
      if (!email || !courseId) {
        return res.status(400).json({ message: 'Email and courseId are required' });
      }
      
      // Get user from database
      const connection = await pool.getConnection();
      const [pendingRecords] = await connection.execute(
        'SELECT * FROM pending WHERE email = ? AND courseId = ? AND employee = ?',
        [email, courseId, reg==='employee'?1:0]
      );
      
      connection.release();
      
      if (pendingRecords.length > 0) {
        console.log("Found")
        return res.json({
          message: 'Registration status found',
          value: pendingRecords[0]
        });
      } else {
        console.log("Not Found")
        return res.json({
          message: 'No registration found',
          value: -1
        });
      }
      
    } catch (error) {
      console.error('Pending check error:', error);
      res.status(500).json({ message: 'Failed to check registration status', error: error.message });
    }
  });


  app.get('/api/admin-check', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [pendingRecords] = await connection.execute(
        'SELECT * FROM pending where maintenance_fee=1'
      );
      connection.release();
      
      if (pendingRecords.length > 0) {
        res.json({
          data: pendingRecords,
        });
      } else {
        res.json({
          data: [],
        });
      }
      
    } catch (error) {
      console.error('Admin check error:', error);
      res.status(500).json({ message: 'Failed to fetch pending registrations', error: error.message });
    }
  });


  app.post('/api/admin-approve', async (req, res) => {
    try {
      const { courseId, email, reg } = req.body;
      
      console.log(`Approving registration for email: ${email}`);
      
      // Get connection
      const connection = await pool.getConnection();
      
      // First, get the pending record to get courseId
      const [pendingRecords] = await connection.execute(
        'SELECT * FROM pending WHERE email = ? AND courseId=? AND status = 0 AND maintenance_fee = 1 AND employee = ?',
        [email,courseId, reg]
      );
      
      if (pendingRecords.length === 0) {
        connection.release();
        return res.status(404).json({ message: 'No pending registration found' });
      }
      
      const pendingRecord = pendingRecords[0];
      
      // Update pending status
      await connection.execute(
        'UPDATE pending SET status = ? WHERE email = ? AND courseId = ? AND employee = ?',
        [1, email, pendingRecord.courseId, reg]
      );
      
      const table = reg === 0 ? 'students' : 'employees';

      const [users] = await connection.execute(
        `SELECT id, name FROM ${table} WHERE email = ?`,
        [email]
      );
      console.log("Referal: ",pendingRecord)
      const [increasereferal] = await connection.execute(
        `UPDATE ${table} SET points = points + 10 WHERE referal = ?`,
        [pendingRecord.referalid]
      );
      
      if (users.length === 0) {
        connection.release();
        return res.status(404).json({ message: 'User not found' });
      }
      
      const userId = users[0].id;
      const userName = users[0].name;
      
      // Add to user_courses table

      if(reg===0){
        await connection.execute(
          'INSERT INTO user_courses (userId, courseId) VALUES (?, ?)',
          [userId, pendingRecord.courseId]
        );
      }else{
        await connection.execute(
          'INSERT INTO employees_courses (studentId, courseId) VALUES (?, ?)',
          [userId, pendingRecord.courseId]
      );
      }

      
      connection.release();
      
      // Send approval email
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Course Registration Approved',
        html: `
          <h1>Congratulations, ${userName}!</h1>
          <p>Your registration for <strong>${pendingRecord.courseName}</strong> has been approved.</p>
          <p>You can now access all course materials and videos.</p>
          <p>Thank you for choosing our platform!</p>
          <p>Best regards,<br>The Admin Team</p>
        `
      };
      
      await transporter.sendMail(mailOptions);
      console.log(`Approval email sent to ${email}`);
      
      res.json({
        message: 'Registration approved successfully',
        status: 1
      });
      
    } catch (error) {
      console.error('Approval error:', error);
      res.status(500).json({ message: 'Failed to approve registration', error: error.message });
    }
  });

// Get all courses
app.get('/api/courses', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [courses] = await connection.execute('SELECT * FROM courses');
    connection.release();
    // console.log(courses);
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Failed to fetch courses', error: error.message });
  }
});

// Get modules for a specific course
app.get('/api/course-modules/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const connection = await pool.getConnection();
    const [modules] = await connection.execute(
      'SELECT * FROM course_modules WHERE courseId = ? ORDER BY day ASC',
      [courseId]
    );
    connection.release();
    console.log(modules);
    res.json(modules);
  } catch (error) {
    console.error('Error fetching course modules:', error);
    res.status(500).json({ message: 'Failed to fetch course modules', error: error.message });
  }
});

// Get materials for modules in a course
app.get('/api/module-materials/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const connection = await pool.getConnection();
    const [materials] = await connection.execute(
      'SELECT * FROM module_materials WHERE courseId = ?',
      [courseId]
    );
    connection.release();
    
    res.json(materials);
  } catch (error) {
    console.error('Error fetching module materials:', error);
    res.status(500).json({ message: 'Failed to fetch module materials', error: error.message });
  }
});

// Add endpoint to check if user has access to a course
app.post('/api/check-course-access', async (req, res) => {
  try {
    const { email, courseId, reg } = req.body;
    
    console.log(`Checking course access for email: ${email}, courseId: ${courseId}`);
    
    // Validate input
    if (!email || !courseId) {
      return res.status(400).json({ message: 'Email and courseId are required' });
    }
    
    // Get user ID from email
    const connection = await pool.getConnection();
    const [users] = await connection.execute(
      `SELECT id FROM ${reg}s WHERE email = ?`,
      [email]
    );
    
    if (users.length === 0) {
      connection.release();
      return res.json({ hasAccess: false });
    }
    
    const userId = users[0].id;

    console.log(userId)
    
    const [accessRecords]= reg==="student" ?
      await connection.execute(
        'SELECT * FROM user_courses WHERE userId = ? AND courseId = ?',
        [userId, courseId]
      )
      :
      await connection.execute(
        'SELECT * FROM employees_courses WHERE studentId = ? AND courseId = ?',
        [userId, courseId]
      )
    
    connection.release();
    console.log(accessRecords)

    if (accessRecords.length !==0){
      return res.json({
        hasAccess: accessRecords.length > 0,
        grantedDate:accessRecords[0].accessGranted
      });
    }else{
      return res.json({hasAccess: false})
    }
    
    
  } catch (error) {
    console.error('Course access check error:', error);
    res.status(500).json({ message: 'Failed to check course access', error: error.message });
  }
});

// Add this endpoint to securely serve videos
app.get('/api/secure-video/:moduleId', async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { token } = req.query;
    
    if (!moduleId) {
      return res.status(400).send('Module ID is required');
    }
    
    // Verify the token
    if (!token) {
      return res.status(403).send('Access denied: No token provided');
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(403).send('Access denied: Invalid or expired token');
    }
    
    const { email, moduleId: tokenModuleId } = decoded;
    
    // Verify the moduleId matches the one in the token
    if (parseInt(moduleId) !== parseInt(tokenModuleId)) {
      return res.status(403).send('Access denied: Token not valid for this video');
    }
    
    // Get user ID and verify course access
    const connection = await pool.getConnection();
    
    // Get user ID
    const [users] = await connection.execute(
      'SELECT id FROM students WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      connection.release();
      return res.status(403).send('Access denied: User not found');
    }
    
    const userId = users[0].id;
    
    // Get module info to find courseId
    const [modules] = await connection.execute(
      'SELECT courseId, videoUrl FROM course_modules WHERE id = ?',
      [moduleId]
    );
    
    if (modules.length === 0) {
      connection.release();
      return res.status(404).send('Module not found');
    }
    
    const courseId = modules[0].courseId;
    const videoUrl = modules[0].videoUrl;
    
    // Check if user has access to this course
    const [accessRecords] = await connection.execute(
      'SELECT * FROM user_courses WHERE userId = ? AND courseId = ?',
      [userId, courseId]
    );
    
    connection.release();
    
    if (accessRecords.length === 0) {
      return res.status(403).send('Access denied: No course access');
    }
    
    if (!videoUrl) {
      return res.status(404).send('Video not found');
    }
    
    // Extract YouTube video ID from URL
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = videoUrl.match(youtubeRegex);
    
    if (!match || !match[1]) {
      return res.status(400).send('Invalid YouTube URL');
    }
    
    const videoId = match[1];
    
    // Create HTML with custom timeline and controls at the bottom
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Secure Video Player</title>
        <style>
          body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background-color: #000; font-family: Arial, sans-serif; }
          .container { width: 100%; height: 100%; display: flex; flex-direction: column; }
          .video-container { flex: 1; position: relative; overflow: hidden; }
          .watermark { position: fixed; top: 0; left: 0; width: 100%; background: rgba(0,0,0,0.7); 
                      color: white; text-align: center; padding: 5px; font-size: 12px; z-index: 1000; }
          /* Full overlay to prevent all mouse interactions with the video */
          .click-blocker {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 10;
            background: transparent;
            cursor: not-allowed;
          }
          /* Controls container at the bottom */
          .controls-container {
            background: #111;
            padding: 10px;
            color: white;
            z-index: 20;
          }
          /* Custom timeline */
          .timeline-container {
            width: 100%;
            height: 10px;
            background: #333;
            border-radius: 5px;
            margin-bottom: 10px;
            position: relative;
            cursor: pointer;
          }
          .timeline-progress {
            height: 100%;
            background: #8b5cf6;
            border-radius: 5px;
            width: 0%;
            transition: width 0.1s;
          }
          /* Time display */
          .time-display {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            margin-bottom: 10px;
          }
          /* Controls info */
          .controls-info {
            text-align: center;
            padding: 5px;
            font-size: 14px;
            color: #aaa;
          }
        </style>
        <script>
          // Prevent right-click
          document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
          });
          
          // YouTube iframe API
          let player;
          let isUpdatingTimeline = false;
          
          // Load YouTube API
          function loadYouTubeAPI() {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
          }
          
          // Format time in MM:SS format
          function formatTime(seconds) {
            seconds = Math.floor(seconds);
            const minutes = Math.floor(seconds / 60);
            seconds = seconds % 60;
            return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
          }
          
          // Update timeline and time display
          function updateTimeline() {
            if (!player || isUpdatingTimeline) return;
            
            const currentTime = player.getCurrentTime() || 0;
            const duration = player.getDuration() || 0;
            const progress = (currentTime / duration) * 100;
            
            document.querySelector('.timeline-progress').style.width = progress + '%';
            document.getElementById('current-time').textContent = formatTime(currentTime);
            document.getElementById('total-time').textContent = formatTime(duration);
            
            // Update every 500ms
            setTimeout(updateTimeline, 500);
          }
          
          // Create YouTube player when API is ready
          function onYouTubeIframeAPIReady() {
            player = new YT.Player('youtube-player', {
              height: '100%',
              width: '100%',
              videoId: '${videoId}',
              playerVars: {
                'autoplay': 1,
                'controls': 0,
                'disablekb': 1,
                'fs': 0,
                'modestbranding': 1,
                'rel': 0,
                'iv_load_policy': 3,
                'showinfo': 0
              },
              events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
              }
            });
          }
          
          function onPlayerReady(event) {
            event.target.playVideo();
            
            // Add user identifier as watermark
            const userInfo = document.getElementById('user-info');
            userInfo.textContent = 'Licensed to: ${email} | This video is for educational purposes only. Unauthorized distribution is prohibited.';
            
            // Start updating timeline
            updateTimeline();
          }
          
          function onPlayerStateChange(event) {
            // Update play/pause state if needed
          }
          
          // Handle timeline click (seek)
          function setupTimelineInteraction() {
            const timelineContainer = document.querySelector('.timeline-container');
            
            timelineContainer.addEventListener('click', function(e) {
              if (!player) return;
              
              isUpdatingTimeline = true;
              
              const rect = timelineContainer.getBoundingClientRect();
              const clickPosition = (e.clientX - rect.left) / rect.width;
              const seekTime = clickPosition * player.getDuration();
              
              player.seekTo(seekTime, true);
              
              // Update timeline immediately for better UX
              document.querySelector('.timeline-progress').style.width = (clickPosition * 100) + '%';
              
              setTimeout(() => {
                isUpdatingTimeline = false;
              }, 100);
            });
          }
          
          // Handle only specific keyboard controls
          document.addEventListener('keydown', function(e) {
            // Block most keyboard shortcuts
            if (
              e.keyCode === 123 || // F12
              e.keyCode === 27 ||  // ESC
              (e.ctrlKey && (e.keyCode === 83 || e.keyCode === 85 || e.keyCode === 67 || e.keyCode === 86)) // Ctrl+S, Ctrl+U, Ctrl+C, Ctrl+V
            ) {
              e.preventDefault();
              return false;
            }
            
            // Allow only specific video controls
            if (player && player.getPlayerState) {
              // Space bar for play/pause
              if (e.keyCode === 32) {
                e.preventDefault();
                if (player.getPlayerState() === YT.PlayerState.PLAYING) {
                  player.pauseVideo();
                } else {
                  player.playVideo();
                }
              }
              
              // Left arrow for rewind 10 seconds
              if (e.keyCode === 37) {
                e.preventDefault();
                player.seekTo(Math.max(0, player.getCurrentTime() - 10), true);
              }
              
              // Right arrow for forward 10 seconds
              if (e.keyCode === 39) {
                e.preventDefault();
                player.seekTo(player.getCurrentTime() + 10, true);
              }
            }
          });
          
          // Initialize everything when page loads
          window.addEventListener('DOMContentLoaded', function() {
            loadYouTubeAPI();
            setupTimelineInteraction();
          });
        </script>
      </head>
      <body>
        <div class="container">
          <div class="watermark" id="user-info">Protected Content</div>
          
          <div class="video-container">
            <div id="youtube-player"></div>
            <!-- Full overlay to block all clicks on the video itself -->
            <div class="click-blocker"></div>
          </div>
          
          <div class="controls-container">
            <!-- Time display -->
            <div class="time-display">
              <span id="current-time">00:00</span>
              <span id="total-time">00:00</span>
            </div>
            
            <!-- Custom timeline that can be clicked -->
            <div class="timeline-container">
              <div class="timeline-progress"></div>
            </div>
            
            <!-- Controls info -->
            <div class="controls-info">
              Keyboard Controls: Space = Play/Pause | ← = Rewind 10s | → = Forward 10s
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Set headers to prevent caching
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Send the secure HTML
    res.send(html);
    
  } catch (error) {
    console.error('Error serving secure video:', error);
    res.status(500).send('Error serving video');
  }
});

// Add a new endpoint to generate video tokens
app.post('/api/generate-video-token', async (req, res) => {
  try {
    const { email, moduleId, reg } = req.body;
    
    if (!email || !moduleId) {
      return res.status(400).json({ message: 'Email and moduleId are required' });
    }
    
    // Verify the user has access to this module's course
    const connection = await pool.getConnection();
    
    // Get user ID
    const [users] = await connection.execute(
      `SELECT id FROM ${reg}s WHERE email = ?`,
      [email]
    );
    
    if (users.length === 0) {
      connection.release();
      return res.status(403).json({ message: 'Access denied: User not found' });
    }
    
    const userId = users[0].id;
    
    // Get module info to find courseId
    const [modules] = await connection.execute(
      'SELECT courseId FROM course_modules WHERE id = ?',
      [moduleId]
    );
    
    if (modules.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Module not found' });
    }
    
    const courseId = modules[0].courseId;
    
    // Check if user has access to this course
    const [accessRecords] = await connection.execute(
      'SELECT * FROM user_courses WHERE userId = ? AND courseId = ?',
      [userId, courseId]
    );
    
    connection.release();
    
    if (accessRecords.length === 0) {
      return res.status(403).json({ message: 'Access denied: No course access' });
    }
    
    // Generate a token
    const token = jwt.sign(
      { email, moduleId },
      JWT_SECRET,
      { expiresIn: VIDEO_TOKEN_EXPIRY }
    );
    
    res.json({ token });
    
  } catch (error) {
    console.error('Error generating video token:', error);
    res.status(500).json({ message: 'Failed to generate token', error: error.message });
  }
});

// Add course with modules and materials
app.post('/api/courses', async (req, res) => {
  try {
    const { title, description, thumbnail, syllabus, weeks, modules } = req.body;
    
    // Validate input
    if (!title || !description || !modules || !Array.isArray(modules) || !weeks || !Array.isArray(weeks)) {
      return res.status(400).json({ message: 'Invalid course data' });
    }
    
    const connection = await pool.getConnection();
    
    // Start transaction
    await connection.beginTransaction();
    
    try {
      // Insert course
      const [courseResult] = await connection.execute(
        'INSERT INTO courses (title, description, thumbnail, syllabus) VALUES (?, ?, ?, ?)',
        [title, description, thumbnail || '', syllabus || '']
      );
      
      const courseId = courseResult.insertId;
      
      // Insert modules and materials

      for (const module of modules) {
        if (!module.title || !module.day || !module.videoUrl || !module.week) {
          throw new Error('Invalid module data');
        }
        
        const [moduleResult] = await connection.execute(
          'INSERT INTO course_modules (courseId, title, week, day, videoUrl) VALUES (?, ?, ?, ?, ?)',
          [courseId, module.title, module.week, module.day, module.videoUrl]
        );
        
        const moduleId = moduleResult.insertId;
        
        // Insert materials if provided
        if (module.materials && Array.isArray(module.materials)) {
          for (const material of module.materials) {
            await connection.execute(
              'INSERT INTO module_materials (moduleId, courseId, material) VALUES (?, ?, ?)',
              [moduleId, courseId, material]
            );
          }
        }
      }
      
      // Commit transaction
      await connection.commit();
      
      res.status(201).json({ 
        message: 'Course created successfully', 
        courseId 
      });
      
    } catch (error) {
      // Rollback on error
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Failed to create course', error: error.message });
  }
});

// Update user profile
app.post('/api/update-profile', async (req, res) => {
  try {
    const { reg, originalEmail, name, email, phone } = req.body;
    
    // Validate input
    if (!originalEmail || !name || !email) {
      return res.status(400).json({ message: 'Name, email, and original email are required' });
    }
    
    const connection = await pool.getConnection();
    
    try {
      // Check if the new email is already taken (if changing email)
      if (originalEmail !== email) {
        const [existingUsers] = await connection.execute(
          `SELECT id FROM ${reg}s WHERE email = ? AND email != ?`,
          [email, originalEmail]
        );
        
        if (existingUsers.length > 0) {
          connection.release();
          return res.status(400).json({ message: 'Email is already in use' });
        }
      }
      
      // Update user profile
      const [result] = await connection.execute(
        `UPDATE ${reg}s SET name = ?, email = ?, phone = ? WHERE email = ?`,
        [name, email, phone || null, originalEmail]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('User not found');
      }
      
      connection.release();
      
      res.json({ 
        message: 'Profile updated successfully',
        user: { name, email, phone }
      });
      
    } catch (error) {
      connection.release();
      throw error;
    }
    
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email and message are required' });
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Send email to admin
    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_FROM}>`,
      replyTo: email, // This allows admin to reply directly to the user
      to: process.env.ADMIN_EMAIL || 'admin@sankalp.com',
      subject: 'New Contact Form Submission',
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    // Send confirmation email to user
    const confirmationMailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Thank you for contacting Sankalp',
      html: `
        <h2>Thank you for contacting us!</h2>
        <p>Dear ${name},</p>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p>Here's a copy of your message:</p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <p>Best regards,<br>The Sankalp Team</p>
      `
    };
    
    await transporter.sendMail(confirmationMailOptions);
    
    res.status(200).json({ message: 'Message sent successfully' });
    
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
});

// Forgot password endpoint - generates and sends OTP
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Check if user exists
    const connection = await pool.getConnection();
    const [users] = await connection.execute(
      'SELECT * FROM students WHERE email = ?',
      [email]
    );
    
    connection.release();
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'No account found with this email' });
    }
    
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + OTP_EXPIRY;
    
    // Store OTP with expiry
    otpStore.set(email, { otp, expiry });
    
    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Reset OTP',
      html: `
        <h1>Password Reset Request</h1>
        <p>Your OTP for password reset is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.json({ message: 'OTP sent to your email' });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to process request', error: error.message });
  }
});

// Verify OTP endpoint
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }
    
    // Check if OTP exists and is valid
    const otpData = otpStore.get(email);
    
    if (!otpData) {
      return res.status(400).json({ message: 'No OTP found for this email' });
    }
    
    if (Date.now() > otpData.expiry) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'OTP has expired' });
    }
    
    if (otpData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    // OTP is valid
    res.json({ message: 'OTP verified successfully' });
    
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Failed to verify OTP', error: error.message });
  }
});

// Reset password endpoint
app.post('/api/reset-password', async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    
    if (!email || !otp || !password) {
      return res.status(400).json({ message: 'Email, OTP, and password are required' });
    }
    
    // Verify OTP again
    const otpData = otpStore.get(email);
    
    if (!otpData || otpData.otp !== otp || Date.now() > otpData.expiry) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    
    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Update password in database
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'UPDATE students SET password = ? WHERE email = ?',
      [hashedPassword, email]
    );
    
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Clear the OTP
    otpStore.delete(email);
    
    // Send confirmation email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Reset Successful',
      html: `
        <h1>Password Reset Successful</h1>
        <p>Your password has been reset successfully.</p>
        <p>If you didn't make this change, please contact support immediately.</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.json({ message: 'Password reset successful' });
    
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
});





app.post('/api/verify-certificate', async (req, res) => {
    try {
      const { holderName, domainName , issueDate } = req.body;

      console.log("Checking certificate for ", holderName, " at ", domainName, " at ", issueDate);
      
      // Validate input
      if (!holderName || !domainName || !issueDate) {
        return res.status(400).json({ message: 'HolderName and DomainName are required' });
      }
      
      // Get user from database
      const connection = await pool.getConnection();
      const [pendingRecords] = await connection.execute(
        'SELECT * FROM certificates WHERE name = ? AND domain = ? AND issueDate = ?',
        [holderName, domainName, issueDate]
      );
      
      connection.release();

      if (pendingRecords.length == 1) {
        // console.log("Found")
        return res.json({
          message: 'Registration status found',
          value: pendingRecords[0].status
        });
      } else {
        // console.log("Not found")
        return res.json({
          message: 'No registration found',
          value: -1
        });
      }
      
    } catch (error) {
      console.error('Pending check error:', error);
      res.status(500).json({ message: 'Failed to check registration status', error: error.message });
    }
  });




  app.post('/api/employee_login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      console.log(`Employee Login attempt for email: ${email}`);
      
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      
      // Get user from database
      const connection = await pool.getConnection();
      const [users] = await connection.execute(
        'SELECT * FROM employees WHERE email = ?',
        [email]
      );
      
      connection.release();
      
      if (users.length === 0) {
        console.log(`No user found with email: ${email}`);
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      const user = users[0];
      console.log(`User found: ${user.name}, comparing passwords`);
      console.log(password,user.password)
      
      // Compare password
      const passwordMatch = await bcrypt.compare(password, user.password);
      
      if (!passwordMatch) {
        console.log('Password does not match');
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      console.log('Login successful');
      
      // Create user object without password
      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        referal: user.referal,
        points: user.points
      };
      
      res.json({
        message: 'Login successful',
        user: userResponse
      });
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed', error: error.message });
    }
  });





  app.post('/api/employee_register', async (req, res) => {
    console.log("Found");
  try {
    const { name, email, phone, password } = req.body;
    
    // Validate input
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Check if user already exists
    const connection = await pool.getConnection();
    const [existingUsers] = await connection.execute(
      'SELECT * FROM employees WHERE email = ?',
      [email]
    );
    
    connection.release();
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + REGISTRATION_OTP_EXPIRY;
    
    // Store OTP with user data
    registrationOtpStore.set(email, { 
      otp, 
      expiry,
      userData: { name, email, phone, password }
    });
    
    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Email Verification OTP',
      html: `
        <h1>Email Verification</h1>
        <p>Your OTP for email verification is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ 
      message: 'OTP sent to your email. Please verify to complete registration.' 
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

app.get('/api/user-courses/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const connection = await pool.getConnection();

    // Fetch all courses the user is registered for
    const [courses] = await connection.execute(
      `SELECT c.id, c.title, c.description, c.thumbnail, c.syllabus
       FROM user_courses uc
       JOIN courses c ON uc.courseId = c.id
       WHERE uc.userId = ?`,
      [userId]
    );

    connection.release();
    console.log(courses);
    res.status(200).json({
      success: true,
      data : courses
    });
  } catch (error) {
    console.error('Error fetching user courses:', error);
    res.status(500).json({ message: 'Failed to retrieve user courses', error: error.message });
  }
});

app.get('/api/user-course-modules/:userId/:courseId', async (req, res) => {
  const { userId, courseId } = req.params;

  try {
    if (!userId || isNaN(userId) || !courseId || isNaN(courseId)) {
      return res.status(400).json({ message: 'Invalid user or course ID' });
    }

    const connection = await pool.getConnection();

    // Step 1: Check user-course access
    const [accessResult] = await connection.execute(
      `SELECT accessGranted FROM user_courses WHERE userId = ? AND courseId = ?`,
      [userId, courseId]
    );

    if (accessResult.length === 0) {
      connection.release();
      return res.status(403).json({ message: 'Access not granted for this course' });
    }

    const accessGranted = new Date(accessResult[0].accessGranted);
    const now = new Date();
    const weeksPassed = Math.floor((now - accessGranted) / (7 * 24 * 60 * 60 * 1000));

    // Step 2: Fetch modules and materials using LEFT JOIN
    const [rows] = await connection.execute(
      `
      SELECT 
        m.*, 
        mat.id AS materialId, 
        mat.material 
      FROM course_modules m
      LEFT JOIN module_materials mat 
        ON mat.moduleId = m.id AND mat.courseId = m.courseId
      WHERE m.courseId = ? AND m.week <= ?
      ORDER BY m.week ASC, m.day ASC
      `,
      [courseId, weeksPassed + 1]
    );

    connection.release();

    // Step 3: Group materials under each module
    const modules = {};
    for (const row of rows) {
      if (!modules[row.id]) {
        modules[row.id] = {
          id: row.id,
          courseId: row.courseId,
          title: row.title,
          week: row.week,
          day: row.day,
          videoUrl: row.videoUrl,
          materials: []
        };
      }

      if (row.materialId) {
        modules[row.id].materials.push({
          id: row.materialId,
          material: row.material
        });
      }
    }
    console.log(modules)
    res.status(200).json({
      success: true,
      data: Object.values(modules)
    });
  } catch (error) {
    console.error('Error fetching course modules:', error);
    res.status(500).json({ message: 'Failed to retrieve modules', error: error.message });
  }
});


app.post('/api/generate-video-token-mobile', async (req, res) => {
  const { userId, moduleId } = req.body;
  console.log(`Generating video token for userId: ${userId}, moduleId: ${moduleId}`);
  if (!userId || !moduleId) {
    return res.status(400).json({ message: 'userId and moduleId are required' });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // 1. Fetch module → get courseId & videoUrl
    const [mods] = await connection.execute(
      'SELECT courseId, videoUrl FROM course_modules WHERE id = ?',
      [moduleId]
    );
    if (mods.length === 0) {
      return res.status(404).json({ message: 'Module not found' });
    }
    const { courseId, videoUrl } = mods[0];

    // 2. Check user-course access
    const [access] = await connection.execute(
      'SELECT 1 FROM user_courses WHERE userId = ? AND courseId = ? LIMIT 1',
      [userId, courseId]
    );
    if (access.length === 0) {
      return res.status(403).json({ message: 'No access to this course' });
    }

    // 3. Issue the token
    const token = jwt.sign(
      { userId, moduleId },
      JWT_SECRET,
      { expiresIn: VIDEO_TOKEN_EXPIRY }
    );

    console.log(`Token generated for userId: ${userId}, moduleId: ${moduleId} , token: ${token}`);
    return res.json({ success: true, token });

  } catch (err) {
    console.error('Error in generate-video-token-mobile:', err);
    return res.status(500).json({ message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
});



app.get('/api/secure-video-mobile/:moduleId', async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { token } = req.query;

    if (!moduleId || !token) return res.status(400).send('Module ID and token are required');

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(403).send('Access denied: Invalid or expired token');
    }

    const { userId, moduleId: tokenModuleId } = decoded;
    if (parseInt(moduleId) !== parseInt(tokenModuleId))
      return res.status(403).send('Access denied: Token not valid for this video');

    const connection = await pool.getConnection();

    const [[userRow]] = await connection.execute(
      'SELECT email FROM students WHERE id = ?',
      [userId]
    );
    if (!userRow) {
      connection.release();
      return res.status(403).send('User not found');
    }

    const [[module]] = await connection.execute(
      'SELECT videoUrl FROM course_modules WHERE id = ?',
      [moduleId]
    );
    connection.release();

    if (!module || !module.videoUrl) return res.status(404).send('Video not found');

    const match = module.videoUrl.match(/(?:youtube\.com\/.*[?&]v=|youtu\.be\/)([^"&?\/\s]{11})/);
    if (!match || !match[1]) return res.status(400).send('Invalid YouTube URL');

    const videoId = match[1];

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Secure YouTube Player</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      background: black;
    }
    .video-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
    }
    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    .block-top,
    .block-bottom {
      position: absolute;
      left: 0;
      right: 0;
      background: transparent;
      z-index: 10;
    }
    .block-top { top: 0; }
    .block-bottom { bottom: 0; }
    /* Portrait orientation */
    @media (orientation: portrait) {
      .block-top,
      .block-bottom {
        height: 8%;
      }
    }

    /* Landscape orientation */
    @media (orientation: landscape) {
      .block-top,
      .block-bottom {
        height: 15%; /* or any value that suits landscape layout */
      }
    }
  </style>
</head>
<body>
  <div class="video-wrapper">
    <iframe
      src="https://www.youtube.com/embed/${videoId}?controls=1&modestbranding=1&rel=0&fs=1&playsinline=1"
      allowfullscreen
      allow="autoplay; encrypted-media"
    ></iframe>
    <div class="block-top"></div>
    <div class="block-bottom"></div>
  </div>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-store');
    res.send(html);
  } catch (error) {
    console.error('Secure video iframe error:', error);
    res.status(500).send('Server error');
  }
});

// Backend (Express)
app.get('/api/recommend-courses/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const connection = await pool.getConnection();

    // Get all courseIds that the user is already enrolled in
    const [enrolled] = await connection.execute(
      `SELECT courseId FROM user_courses WHERE userId = ?`,
      [userId]
    );

    const enrolledCourseIds = enrolled.map(row => row.courseId);

    // Build the query dynamically
    let recommendedQuery = `SELECT id, title, description FROM courses`;
    let params = [];

    if (enrolledCourseIds.length > 0) {
      const placeholders = enrolledCourseIds.map(() => '?').join(', ');
      recommendedQuery += ` WHERE id NOT IN (${placeholders})`;
      params = enrolledCourseIds;
    }

    recommendedQuery += ` ORDER BY RAND() LIMIT 3`;

    const [recommended] = await connection.execute(recommendedQuery, params);

    connection.release();

    res.status(200).json({
      success: true,
      data: recommended,
    });
  } catch (error) {
    console.error('Error recommending courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommended courses',
      error: error.message,
    });
  }
});

app.post('/api/logout', (req, res) => {
  // If you're using JWTs or cookies, you could invalidate them here
  console.log('User logged out');
  res.status(200).json({ message: 'Logout successful' });
});


app.post('/api/forgot-password-mobile', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Check if user exists
    const connection = await pool.getConnection();
    const [users] = await connection.execute(
      'SELECT * FROM students WHERE email = ?',
      [email]
    );

    connection.release();

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + OTP_EXPIRY;

    // Store OTP with expiry
    otpStore.set(email, { otp, expiry });

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Reset OTP',
      html: `
        <h1>Password Reset Request</h1>
        <p>Your OTP for password reset is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    // ✅ Send structured success response
    res.json({ success: true, message: 'OTP sent to your email' });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process request',
      error: error.message,
    });
  }
});



app.get('/api/recommend-courses-all/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const connection = await pool.getConnection();

    // Get all courseIds the user is already enrolled in
    const [enrolled] = await connection.execute(
      `SELECT courseId FROM user_courses WHERE userId = ?`,
      [userId]
    );

    const enrolledCourseIds = enrolled.map(row => row.courseId);

    let query = `SELECT id, title, description FROM courses`;
    let params = [];

    if (enrolledCourseIds.length > 0) {
      const placeholders = enrolledCourseIds.map(() => '?').join(', ');
      query += ` WHERE id NOT IN (${placeholders})`;
      params = enrolledCourseIds;
    }

    // Optional: random order
    query += ` ORDER BY RAND()`;

    const [unregistered] = await connection.execute(query, params);

    connection.release();

    res.status(200).json({
      success: true,
      data: unregistered,
    });
  } catch (error) {
    console.error('Error fetching unregistered courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unregistered courses',
      error: error.message,
    });
  }
});







// Certificate generation endpoint
app.post('/api/generate-certificate', async (req, res) => {
  try {
    const { name, domain, start_date, end_date, gender } = req.body;

    // Validate input
    if (!name || !domain || !start_date || !end_date) {
      return res.status(400).json({
        message: 'Missing required fields: name, domain, start_date, end_date'
      });
    }

    // Prepare data for Python script
    const certificateData = {
      name,
      domain,
      start_date,
      end_date,
      gender: gender || 'other'
    };

    console.log("Certificate Data: ", certificateData);

    // Call Flask certificate service (app.py server)
    const FLASK_SERVICE_URL = process.env.FLASK_SERVICE_URL || 'http://localhost:5001';

    const response = await fetch(`${FLASK_SERVICE_URL}/api/generate-certificate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(certificateData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return res.status(response.status).json({
        message: 'Failed to generate certificate',
        error: errorData.error || 'Flask service error'
      });
    }

    // Store certificate info in database
    try {
      const connection = await pool.getConnection();
      const issued_date = new Date().toISOString().split('T')[0];

      await connection.execute(
        'INSERT INTO certificates (name, domain, status, issueDate) VALUES (?, ?, ?, ?)',
        [name, domain, 1, issued_date]
      );
      connection.release();
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue with file sending even if database insert fails
    }

    // Forward the PDF response from Flask service
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${name.replace(/[^a-zA-Z0-9]/g, '_')}_Certificate.pdf"`);

    // Pipe the response from Flask service to client
    response.body.pipe(res);

  } catch (error) {
    console.error('Certificate generation error:', error);
    res.status(500).json({
      message: 'Certificate generation failed',
      error: error.message
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


