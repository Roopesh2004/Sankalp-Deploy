import React, { useState, useRef, useEffect, Suspense, lazy } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Settings } from 'lucide-react';
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

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-4">
    <motion.div
      className="w-6 h-6 border-2 border-primary-400 rounded-full border-t-transparent"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

// Type definitions (keeping exactly as original)
interface Course {
  id: number;
  title: string;
  description: string;
  duration: string;
  level: string;
  image?: string;
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
        const cleanup = setupThreeJS(mountRef.current!);
        setAnimationInitialized(true);
        return cleanup;
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [animationInitialized]);
  
  // Fetch courses from backend (keeping exactly as original)
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
  
  // Fetch course modules when a course is selected (keeping exactly as original)
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

  // Handle profile update (keeping exactly as original)
  const handleProfileUpdate = async (userData: Partial<User>) => {
    try {
      // Update local state immediately for better UX
      if (user) {
        const updatedUser = { ...user, ...userData };
        // Update user in context (assuming setUser is available from useAuth)
        // If not available, you'll need to modify AuthContext to provide this
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.location.reload(); // Reload to reflect changes
      }
      setShowSettings(false);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  // Prepare course data with modules and materials (keeping exactly as original)
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
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background animation container - same as Hero */}
      <div 
        ref={mountRef} 
        className="absolute inset-0 z-0" 
        style={{ pointerEvents: 'none' }} 
      />
      
      {/* Fallback background for low-performance devices - same as Hero */}
      {isLowPerfDevice && (
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-purple-900/20 to-black">
          <div className="absolute w-full h-full overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-purple-500 rounded-full opacity-70"
                style={{
                  width: Math.random() * 4 + 1 + 'px',
                  height: Math.random() * 4 + 1 + 'px',
                  top: Math.random() * 100 + '%',
                  left: Math.random() * 100 + '%',
                  animation: `float ${Math.random() * 10 + 20}s linear infinite`
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <nav className="relative z-20 bg-black/80 backdrop-blur-lg border-b border-primary-800/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <motion.h1 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-2xl font-bold text-primary-400"
              >
                Sankalp Training Portal
              </motion.h1>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 20px rgba(124, 58, 237, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSettings(true)}
                className="border-2 border-gray-700 text-gray-300 px-4 py-2 rounded-full font-medium hover:border-primary-600 hover:text-primary-400 transition-all duration-300 flex items-center relative overflow-hidden"
              >
                <motion.span
                  className="absolute inset-0 bg-primary-600/10"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <Settings className="w-5 h-5 mr-2" />
                Settings
              </motion.button>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center text-gray-300 bg-primary-900/30 px-4 py-2 rounded-full"
              >
                <User className="w-5 h-5 mr-2 text-primary-400" />
                <span>{user?.name}</span>
              </motion.div>
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 20px rgba(239, 68, 68, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-full font-medium hover:bg-red-700 transition-all duration-300 flex items-center relative overflow-hidden"
              >
                <motion.span
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.5 }}
                />
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
                  <motion.h2 
                    variants={itemVariants}
                    className="text-3xl font-bold text-primary-400 mb-8 text-center"
                  >
                    Available Courses
                  </motion.h2>
                  {loading ? (
                    <LoadingFallback />
                  ) : (
                    <motion.div 
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4"
                      variants={containerVariants}
                    >
                      {courses.map((course, index) => (
                        <motion.div
                          key={course.id}
                          variants={itemVariants}
                          className="bg-black/80 backdrop-blur-lg rounded-2xl p-6 border border-primary-800/20 shadow-xl hover:border-primary-600/40 transition-all duration-300"
                          whileHover={{ 
                            scale: 1.02,
                            boxShadow: "0 0 30px rgba(124, 58, 237, 0.2)"
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <CourseCard
                            course={{
                              id: course.id,
                              title: course.title || '',
                              description: course.description || '',
                              duration: course.duration || '',
                              level: course.level || '',
                              image: course.image || ''
                            }}
                            onClick={() => changeView(course.id.toString())}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          </Suspense>
        </AnimatePresence>
      </main>

      {/* Add CSS for the fallback animation - same as Hero */}
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-100px) translateX(50px);
          }
          50% {
            transform: translateY(-50px) translateX(100px);
          }
          75% {
            transform: translateY(-150px) translateX(50px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }
      `}</style>
    </div>
  );
};
