// server.js - Backend for registration form
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

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
app.post('/api/verify-registration', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
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
    
    // Insert new user
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO students (name, email, phone, password) VALUES (?, ?, ?, ?)',
      [name, userEmail, phone, hashedPassword]
    );
    
    connection.release();
    
    // Clear the OTP
    registrationOtpStore.delete(email);
    
    res.status(201).json({
      message: 'Registration successful',
      userId: result.insertId
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
        phone: user.phone
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


  app.post('/api/pending', async (req, res) => {
    try {
      const { name, email, transid, refid , courseName, amt, courseId } = req.body;
      
      console.log(`Pending registration for email: ${email}, course: ${courseName}`);
      
      // Validate input
      if (!name || !email || !transid || !courseName || !amt || !courseId) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      
      // Get user from database
      const connection = await pool.getConnection();
      
      // Check if already in pending for this course
      const [existingPending] = await connection.execute(
        'SELECT * FROM pending WHERE email = ? AND courseName = ?',
        [email, courseName]
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
        'INSERT INTO pending (name, email, transactionid, referalid, courseName, amount, courseId, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, email, transid, refid, courseName, amt, courseId, 0]
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


  app.post('/api/pending-check', async (req, res) => {
    try {
      const { email, courseId } = req.body;
      
      console.log(`Pending check for email: ${email}, courseId: ${courseId}`);
      
      // Validate input
      if (!email || !courseId) {
        return res.status(400).json({ message: 'Email and courseId are required' });
      }
      
      // Get user from database
      const connection = await pool.getConnection();
      const [pendingRecords] = await connection.execute(
        'SELECT * FROM pending WHERE email = ? AND courseId = ?',
        [email, courseId]
      );
      
      connection.release();
      
      if (pendingRecords.length > 0) {
        return res.json({
          message: 'Registration status found',
          value: pendingRecords[0].status
        });
      } else {
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
        'SELECT * FROM pending'
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
      const { courseId, email } = req.body;
      
      console.log(`Approving registration for email: ${email}`);
      
      // Get connection
      const connection = await pool.getConnection();
      
      // First, get the pending record to get courseId
      const [pendingRecords] = await connection.execute(
        'SELECT * FROM pending WHERE email = ? AND courseId=? AND status = 0',
        [email,courseId]
      );
      
      if (pendingRecords.length === 0) {
        connection.release();
        return res.status(404).json({ message: 'No pending registration found' });
      }
      
      const pendingRecord = pendingRecords[0];
      
      // Update pending status
      await connection.execute(
        'UPDATE pending SET status = ? WHERE email = ? AND courseId = ?',
        [1, email, pendingRecord.courseId]
      );
      
      // Get user ID
      const [users] = await connection.execute(
        'SELECT id, name FROM students WHERE email = ?',
        [email]
      );
      
      if (users.length === 0) {
        connection.release();
        return res.status(404).json({ message: 'User not found' });
      }
      
      const userId = users[0].id;
      const userName = users[0].name;
      
      // Add to user_courses table
      await connection.execute(
        'INSERT INTO user_courses (userId, courseId) VALUES (?, ?)',
        [userId, pendingRecord.courseId]
      );
      
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
    console.log(courses);
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
    const { email, courseId } = req.body;
    
    console.log(`Checking course access for email: ${email}, courseId: ${courseId}`);
    
    // Validate input
    if (!email || !courseId) {
      return res.status(400).json({ message: 'Email and courseId are required' });
    }
    
    // Get user ID from email
    const connection = await pool.getConnection();
    const [users] = await connection.execute(
      'SELECT id FROM students WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      connection.release();
      return res.json({ hasAccess: false });
    }
    
    const userId = users[0].id;
    
    // Check if user has access to this course
    const [accessRecords] = await connection.execute(
      'SELECT * FROM user_courses WHERE userId = ? AND courseId = ?',
      [userId, courseId]
    );
    
    connection.release();
    console.log(accessRecords)
    return res.json({
      hasAccess: accessRecords.length > 0,
      grantedDate:accessRecords[0].accessGranted
    });
    
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
    const { email, moduleId } = req.body;
    
    if (!email || !moduleId) {
      return res.status(400).json({ message: 'Email and moduleId are required' });
    }
    
    // Verify the user has access to this module's course
    const connection = await pool.getConnection();
    
    // Get user ID
    const [users] = await connection.execute(
      'SELECT id FROM students WHERE email = ?',
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
    const { originalEmail, name, email, phone } = req.body;
    
    // Validate input
    if (!originalEmail || !name || !email) {
      return res.status(400).json({ message: 'Name, email, and original email are required' });
    }
    
    const connection = await pool.getConnection();
    
    try {
      // Check if the new email is already taken (if changing email)
      if (originalEmail !== email) {
        const [existingUsers] = await connection.execute(
          'SELECT id FROM students WHERE email = ? AND email != ?',
          [email, originalEmail]
        );
        
        if (existingUsers.length > 0) {
          connection.release();
          return res.status(400).json({ message: 'Email is already in use' });
        }
      }
      
      // Update user profile
      const [result] = await connection.execute(
        'UPDATE students SET name = ?, email = ?, phone = ? WHERE email = ?',
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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
