import React, { useState, useRef, useEffect, Suspense, lazy } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Settings, BookOpen, Clock, Award, ChevronRight } from 'lucide-react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load components
const CourseCard = lazy(() => import('../components/CourseCard'));
const CourseDetails = lazy(() => import('../components/CourseDetails'));
const ProfileSettings = lazy(() => import('../components/ProfileSettings'));

// Optimized THREE.js configuration for better performance (same as Hero)
const setupThreeJS = (mountElement: HTMLDivElement) => {
  const isMobile = window.innerWidth < 768;
  const particlesCount = isMobile ? 800 : 3000;
  
  const scene = new THREE.Scene();
  
  const camera = new THREE.PerspectiveCamera(
    isMobile ? 60 : 75, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    1000
  );
  camera.position.z = isMobile ? 7 : 5;
  
  const renderer = new THREE.WebGLRenderer({ 
    alpha: true, 
    antialias: isMobile ? false : true,
    powerPreference: "high-performance",
    precision: isMobile ? "lowp" : "mediump",
    failIfMajorPerformanceCaveat: false
  });
  
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  
  // Make sure the canvas covers the entire viewport
  renderer.domElement.style.position = 'fixed';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.width = '100vw';
  renderer.domElement.style.height = '100vh';
  renderer.domElement.style.zIndex = '-1';
  renderer.domElement.style.pointerEvents = 'none';
  
  mountElement.appendChild(renderer.domElement);
  
  const particlesGeometry = new THREE.BufferGeometry();
  const posArray = new Float32Array(particlesCount * 3);
  
  for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * (isMobile ? 10 : 15);
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  particlesGeometry.setDrawRange(0, particlesCount);
  
  const particlesMaterial = new THREE.PointsMaterial({
    size: isMobile ? 0.1 : 0.03,
    color: 0x7c3aed,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
  });
  
  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particlesMesh);
  
  const ambientLight = new THREE.AmbientLight(0x7c3aed, 0.5);
  scene.add(ambientLight);
  
  const pointLight = new THREE.PointLight(0x7c3aed, 0.8);
  pointLight.position.set(2, 3, 4);
  scene.add(pointLight);
  
  let resizeTimeout: NodeJS.Timeout;
  const handleResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, 100);
  };
  
  window.addEventListener('resize', handleResize);
  
  let animationId: number;
  let lastFrameTime = 0;
  const frameInterval = isMobile ? 40 : 16;
  
  const animate = (currentTime: number) => {
    if (currentTime - lastFrameTime < frameInterval) {
      animationId = requestAnimationFrame(animate);
      return;
    }
    lastFrameTime = currentTime;
    
    particlesMesh.rotation.x += isMobile ? 0.0001 : 0.0005;
    particlesMesh.rotation.y += isMobile ? 0.0001 : 0.0005;
    
    renderer.render(scene, camera);
    animationId = requestAnimationFrame(animate);
  };

  animate(0);
  
  return () => {
    window.removeEventListener('resize', handleResize);
    cancelAnimationFrame(animationId);
    if (mountElement.contains(renderer.domElement)) {
      mountElement.removeChild(renderer.domElement);
    }
    
    scene.remove(particlesMesh);
    particlesGeometry.dispose();
    particlesMaterial.dispose();
    renderer.dispose();
  };
};

// Enhanced Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <motion.div className="relative">
      <motion.div
        className="w-12 h-12 border-4 border-primary-400/20 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-0 w-12 h-12 border-4 border-primary-400 rounded-full border-t-transparent border-r-transparent"
        animate={{ rotate: -360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-2 w-8 h-8 bg-primary-500 rounded-full"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </motion.div>
  </div>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { 
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 50, opacity: 0, scale: 0.9 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { 
      type: "spring", 
      stiffness: 100,
      damping: 15
    }
  }
};

const floatingVariants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Enhanced Custom Course Card Component
interface CourseCardProps {
  course: {
    id: number;
    title: string;
    description: string;
    thumbnail:string,
    created: string;
    level: string;
    image: string;
  };
  onClick: () => void;
  index: number;
}

const EnhancedCourseCard: React.FC<CourseCardProps> = ({ course, onClick, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      variants={itemVariants}
      className="group relative h-[500px]" // Fixed height for consistent card sizes
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ 
        scale: 1.05,
        rotateY: 5,
        z: 50
      }}
      whileTap={{ scale: 0.98 }}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Floating background glow */}
      <motion.div
        className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 rounded-3xl blur-xl"
        animate={isHovered ? {
          scale: 1.1,
          opacity: 0.8
        } : {
          scale: 0.9,
          opacity: 0.3
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Main card */}
      <div className="relative bg-gradient-to-br from-black/90 via-gray-900/80 to-black/90 backdrop-blur-xl rounded-2xl border border-primary-800/30 shadow-2xl overflow-hidden h-full">
        {/* Animated border */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: `conic-gradient(from ${index * 60}deg, transparent, rgba(124, 58, 237, 0.5), transparent)`
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-[1px] bg-gradient-to-br from-black/95 via-gray-900/90 to-black/95 rounded-2xl" />
        
        {/* Content */}
        <div className="relative p-8 h-full flex flex-col">
          {/* Header with floating icon */}
          <div className="flex items-center justify-between mb-6">
            <motion.div
              variants={floatingVariants}
              animate="animate"
              className="p-2 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl backdrop-blur-lg border border-purple-500/30 w-full"
            >
              <img src={course.thumbnail} className='object-cover w-full h-[150px]'></img>
            </motion.div>
          </div>
          
          {/* Course info */}
          <div className="flex-1 flex flex-col">
            <motion.h3 
              className="text-2xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300"
              layoutId={`title-${course.id}`}
            >
              {course.title}
            </motion.h3>
            
            <motion.p 
              className="text-gray-300 text-sm leading-relaxed mb-6 line-clamp-3 flex-1"
              animate={{ opacity: isHovered ? 1 : 0.8 }}
            >
              {course.description}
            </motion.p>


          </div>
          
          {/* Enhanced CTA Button */}
          <motion.button
            onClick={() => onClick()}
            className="relative group/btn w-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white font-semibold py-4 px-6 rounded-xl overflow-hidden mt-auto"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Button background animation */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-purple-600 to-blue-600"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6 }}
            />
            
            {/* Button content */}
            <div className="relative flex items-center justify-center space-x-2">
              <span>Start Learning</span>
              <motion.div
                animate={{ x: isHovered ? 5 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-5 h-5" />
              </motion.div>
            </div>
            
            {/* Sparkle effects */}
            <AnimatePresence>
              {isHovered && (
                <>
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      initial={{ 
                        x: Math.random() * 100 + "%", 
                        y: Math.random() * 100 + "%",
                        scale: 0 
                      }}
                      animate={{ 
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0]
                      }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ 
                        duration: 1,
                        delay: i * 0.1,
                        repeat: Infinity,
                        repeatDelay: 2
                      }}
                    />
                  ))}
                </>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Type definitions
interface Course {
  id: number;
  title: string;
  description: string;
  created_at: string;
  level: string;
  thumbnail?: string;
}

interface Module {
  id: number;
  courseId: number;
  title: string;
  description: string;
  day: number;
}

interface Material {
  id: number;
  moduleId: number;
  courseId: number;
  material: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

export const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseModules, setCourseModules] = useState<Module[]>([]);
  const [modulesMaterials, setModulesMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLowPerfDevice, setIsLowPerfDevice] = useState(false);
  const [animationInitialized, setAnimationInitialized] = useState(false);
  
  // Initialize THREE.js background animation
  useEffect(() => {
    const checkPerformance = () => {
      let canvas = document.createElement('canvas');
      let hasWebGL = false;
      
      try {
        hasWebGL = !!(window.WebGLRenderingContext && 
          (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      } catch (e) {
        hasWebGL = false;
      }
      
      const isLowPerf = !hasWebGL;
      setIsLowPerfDevice(isLowPerf);
      return isLowPerf;
    };
    
    const isLowPerf = checkPerformance();
    
    if (!isLowPerf && mountRef.current && !animationInitialized) {
      const timer = setTimeout(() => {
        if (mountRef.current) {
          const cleanup = setupThreeJS(mountRef.current);
          setAnimationInitialized(true);
          return cleanup;
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [animationInitialized]);
  
  // Fetch courses from backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('https://sankalp-deploy-1.onrender.com/api/courses');
        if (!response.ok) throw new Error('Failed to fetch courses');
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);
  
  // Fetch course modules when a course is selected
  useEffect(() => {
    if (selectedCourse) {
      const fetchCourseModules = async () => {
        try {
          const response = await fetch(`https://sankalp-deploy-1.onrender.com/api/course-modules/${selectedCourse}`);
          if (!response.ok) throw new Error('Failed to fetch course modules');
          const data = await response.json();
          setCourseModules(data);
          
          // Fetch materials for all modules in this course
          const materialsResponse = await fetch(`https://sankalp-deploy-1.onrender.com/api/module-materials/${selectedCourse}`);
          if (!materialsResponse.ok) throw new Error('Failed to fetch module materials');
          const materialsData = await materialsResponse.json();
          setModulesMaterials(materialsData);
        } catch (error) {
          console.error('Error fetching course details:', error);
        }
      };
      
      fetchCourseModules();
    }
  }, [selectedCourse]);

  // Handle profile update
  const handleProfileUpdate = async (userData: Partial<User>) => {
    try {
      // Update local state immediately for better UX
      if (user) {
        const updatedUser = { ...user, ...userData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.location.reload(); // Reload to reflect changes
      }
      setShowSettings(false);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  // Prepare course data with modules and materials
  const course = selectedCourse ? {
    ...courses.find(c => c.id.toString() === selectedCourse),
    modules: courseModules.map(module => ({
      ...module,
      materials: modulesMaterials
        .filter(material => material.moduleId === module.id)
        .map(material => material.material || '')
    }))
  } : null;

  const [viewTransition, setViewTransition] = useState(false);
  
  const changeView = (newCourseId: string | null) => {
    setViewTransition(true);
    setTimeout(() => {
      setSelectedCourse(newCourseId);
      setViewTransition(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-black relative">
      {/* Background animation container - now covers entire page */}
      <div 
        ref={mountRef} 
        className="fixed inset-0 w-full h-full z-0" 
        style={{ pointerEvents: 'none' }} 
      />
      
      {/* Enhanced fallback background for low-performance devices */}
      {isLowPerfDevice && (
        <div className="fixed inset-0 z-0 bg-gradient-to-br from-purple-900/30 via-black to-blue-900/20">
          <div className="absolute w-full h-full overflow-hidden">
            {[...Array(100)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-purple-500 rounded-full opacity-40"
                style={{
                  width: Math.random() * 6 + 2 + 'px',
                  height: Math.random() * 6 + 2 + 'px',
                  top: Math.random() * 100 + '%',
                  left: Math.random() * 100 + '%',
                }}
                animate={{
                  y: [-20, -100, -20],
                  x: [-10, 10, -10],
                  opacity: [0.2, 0.8, 0.2],
                  scale: [0.5, 1.2, 0.5]
                }}
                transition={{
                  duration: Math.random() * 8 + 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 5
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Navigation Bar */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-20 bg-black/90 backdrop-blur-2xl border-b border-primary-800/30 shadow-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center space-x-4">
              {/* Enhanced Logo */}
              <motion.div 
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div className="relative">
                  <img 
                    src="/logo.png" 
                    alt="Sankalp Logo" 
                    className="w-12 h-12 object-contain"
                  />
                  <motion.div
                    className="absolute inset-0 bg-purple-500/20 rounded-full blur-md"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                
                <motion.h1 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent"
                >
                  Sankalp Training Portal
                </motion.h1>
              </motion.div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Enhanced Settings Button */}
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 30px rgba(124, 58, 237, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSettings(true)}
                className="relative group border-2 border-gray-700 text-gray-300 px-6 py-3 rounded-2xl font-medium hover:border-primary-600 hover:text-primary-400 transition-all duration-300 flex items-center overflow-hidden"
              >
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Settings className="w-5 h-5" />
                </motion.div>
                <span className="relative z-10">Settings</span>
              </motion.button>
              
              {/* Enhanced User Profile */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center text-gray-300 bg-gradient-to-r from-primary-900/40 to-blue-900/40 backdrop-blur-lg px-6 py-3 rounded-2xl border border-primary-800/30"
              >
                <motion.div
                  className="mr-3 p-2 bg-primary-600/20 rounded-full"
                  animate={{ 
                    boxShadow: ["0 0 0 0 rgba(124, 58, 237, 0.4)", "0 0 0 8px rgba(124, 58, 237, 0)", "0 0 0 0 rgba(124, 58, 237, 0)"]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <User className="w-5 h-5 text-primary-400" />
                </motion.div>
                <span className="font-medium">{user?.name}</span>
              </motion.div>
              
              {/* Enhanced Logout Button */}
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 30px rgba(239, 68, 68, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="relative bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-300 flex items-center overflow-hidden group"
              >
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-600"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
                <LogOut className="w-5 h-5 mr-2 relative z-10" />
                <span className="relative z-10">Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <Suspense fallback={<LoadingFallback />}>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {showSettings ? (
                <ProfileSettings
                  user={user!}
                  onSave={handleProfileUpdate}
                  onClose={() => setShowSettings(false)}
                />
              ) : course ? (
                <motion.div 
                  variants={itemVariants} 
                  className="bg-black/80 backdrop-blur-lg border border-primary-800/20 p-6 rounded-2xl shadow-xl mx-4"
                >
                  <CourseDetails
                    course={course}
                    onBack={() => changeView(null)}
                    email={user?.email}
                  />
                </motion.div>
              ) : (
                <>
                  {/* Enhanced Page Title */}
                  <motion.div 
                    variants={itemVariants}
                    className="text-center mb-12"
                  >
                    <motion.h2 
                      className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4"
                      animate={{ 
                        backgroundPosition: ["0%", "100%", "0%"]
                      }}
                      transition={{ duration: 5, repeat: Infinity }}
                    >
                      Available Courses
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-gray-400 text-lg max-w-2xl mx-auto"
                    >
                      Embark on your learning journey with our comprehensive courses designed to elevate your skills
                    </motion.p>
                  </motion.div>
                  
                  {loading ? (
                    <LoadingFallback />
                  ) : (
                    <motion.div 
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4"
                      variants={containerVariants}
                    >
                      {courses.map((course, index) => (
                        <EnhancedCourseCard
                          key={course.id}
                          course={{
                            id: course.id,
                            title: course.title || '',
                            description: course.description || '',
                            thumbnail:course.thumbnail || '',
                            created: course.created_at || '',
                            level: course.level || '',
                            image: course.thumbnail || ''
                          }}
                          onClick={() => changeView(course.id.toString())}
                          index={index}
                        />
                      ))}
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          </Suspense>
        </AnimatePresence>
      </main>

      {/* Enhanced global styles */}
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) translateX(10px) rotate(5deg);
          }
          50% {
            transform: translateY(-10px) translateX(20px) rotate(-5deg);
          }
          75% {
            transform: translateY(-30px) translateX(10px) rotate(3deg);
          }
          100% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #7c3aed, #3b82f6);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #8b5cf6, #60a5fa);
        }
        
        /* Smooth transitions for all elements */
        * {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Enhanced glow effects */
        .glow-effect {
          filter: drop-shadow(0 0 20px rgba(124, 58, 237, 0.3));
        }
        
        /* Animated gradient backgrounds */
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 6s ease infinite;
        }
        
        /* Particle animation for fallback */
        @keyframes particle-float {
          0% {
            transform: translateY(100vh) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-100px) translateX(100px) rotate(360deg);
            opacity: 0;
          }
        }
        
        /* Enhanced hover effects */
        .hover-lift:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        /* Glitch effect for special elements */
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        
        .glitch-effect:hover {
          animation: glitch 0.3s ease-in-out;
        }
        
        /* Ripple effect */
        .ripple {
          position: relative;
          overflow: hidden;
        }
        
        .ripple::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }
        
        .ripple:hover::before {
          width: 300px;
          height: 300px;
        }
      `}</style>

      {/* Enhanced Animated Footer - Seamless Integration */}
<motion.footer 
  className="relative mt-20 overflow-hidden"
  initial={{ opacity: 0, y: 100 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1, delay: 0.5 }}
>
  {/* Floating background particles */}
  <div className="absolute inset-0 overflow-hidden">
    {[...Array(30)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute bg-purple-500/20 rounded-full"
        style={{
          width: Math.random() * 3 + 1 + 'px',
          height: Math.random() * 3 + 1 + 'px',
          top: Math.random() * 100 + '%',
          left: Math.random() * 100 + '%',
        }}
        animate={{
          y: [-20, -80, -20],
          x: [-10, 10, -10],
          opacity: [0.1, 0.4, 0.1],
        }}
        transition={{
          duration: Math.random() * 8 + 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: Math.random() * 3
        }}
      />
    ))}
  </div>

  {/* Main footer content */}
  <div className="relative z-10 py-20 px-4">
    <div className="max-w-7xl mx-auto text-center">
      {/* Mascot container with sick animations */}
      <motion.div 
        className="relative inline-block"
        initial={{ scale: 0, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 80, 
          damping: 12,
          delay: 0.8 
        }}
      >
        {/* Multiple glow layers for sick effect */}
        <motion.div
          className="absolute inset-0 w-48 h-48 mx-auto bg-gradient-to-r from-purple-600/60 via-blue-600/60 to-cyan-600/60 rounded-full"
          style={{ filter: 'blur(40px)' }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute inset-0 w-48 h-48 mx-auto bg-gradient-to-r from-cyan-500/40 via-purple-500/40 to-blue-500/40 rounded-full"
          style={{ filter: 'blur(60px)' }}
          animate={{
            scale: [1.2, 1.6, 1.2],
            opacity: [0.3, 0.7, 0.3],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        
        {/* Mascot image with sick movement */}
        <motion.div
          className="relative z-10 w-48 h-48 mx-auto"
          whileHover={{ 
            scale: 1.15,
            rotate: [0, -8, 8, -8, 0],
            transition: { duration: 0.6 }
          }}
          animate={{
            y: [-8, 8, -8],
            rotate: [-2, 2, -2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <motion.img 
            src="/mascot.png" 
            alt="Sankalp Mascot" 
            className="w-full h-full object-contain drop-shadow-2xl"
            animate={{
              filter: [
                'drop-shadow(0 0 20px rgba(124, 58, 237, 0.8))',
                'drop-shadow(0 0 40px rgba(59, 130, 246, 0.8))',
                'drop-shadow(0 0 30px rgba(6, 182, 212, 0.8))',
                'drop-shadow(0 0 20px rgba(124, 58, 237, 0.8))'
              ]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Energy particles around mascot */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full"
              style={{
                top: `${30 + Math.sin(i * Math.PI / 6) * 70}%`,
                left: `${50 + Math.cos(i * Math.PI / 6) * 70}%`,
                filter: 'blur(1px)'
              }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
                x: [0, Math.cos(i * Math.PI / 6) * 20, 0],
                y: [0, Math.sin(i * Math.PI / 6) * 20, 0]
              }}
              transition={{
                duration: 2.5,
                delay: i * 0.15,
                repeat: Infinity,
                repeatDelay: 2
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Animated text below mascot */}
      <motion.div
        className="mt-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <motion.p 
          className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 text-lg font-bold"
          animate={{
            backgroundPosition: ["0%", "100%", "0%"]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          Bridging Silence, Building Connections
        </motion.p>
      </motion.div>
    </div>
  </div>

  {/* Bottom energy wave */}
  <motion.div
    className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600"
    animate={{
      backgroundPosition: ["0%", "100%", "0%"],
      opacity: [0.6, 1, 0.6]
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: "linear"
    }}
  />
</motion.footer>

    </div>
  );
};
