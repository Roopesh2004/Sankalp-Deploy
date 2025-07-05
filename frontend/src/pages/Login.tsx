import React, { useState, useRef, useEffect } from 'react';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';
import CourseCard from '../components/CourseCard';
import { mockCourses } from '../data/mockData';
import { GraduationCap, Shield, BookOpen } from 'lucide-react';
import * as THREE from 'three';

// Optimized THREE.js configuration for better performance
const setupThreeJS = (mountElement: HTMLDivElement) => {
  // Lower particle count for mobile devices
  const isMobile = window.innerWidth < 768;
  const particlesCount = isMobile ? 1500 : 3000;
  
  // Set up scene with optimized settings
  const scene = new THREE.Scene();
  
  // Set up camera with wider angle for better visibility on small screens
  const camera = new THREE.PerspectiveCamera(
    isMobile ? 85 : 75, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    1000
  );
  camera.position.z = isMobile ? 6 : 5;
  
  // Set up renderer with lower pixel ratio for mobile
  const renderer = new THREE.WebGLRenderer({ 
    alpha: true, 
    antialias: !isMobile, 
    powerPreference: 'high-performance'
  });
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio for better performance
  
  mountElement.appendChild(renderer.domElement);
  
  // Create optimized particles
  const particlesGeometry = new THREE.BufferGeometry();
  const posArray = new Float32Array(particlesCount * 3);
  
  for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * (isMobile ? 12 : 15);
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  
  // Use smaller particles on mobile for better performance
  const particlesMaterial = new THREE.PointsMaterial({
    size: isMobile ? 0.05 : 0.03,
    color: 0x7c3aed,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending
  });
  
  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particlesMesh);
  
  // Optimize lighting
  const ambientLight = new THREE.AmbientLight(0x7c3aed, 0.5);
  scene.add(ambientLight);
  
  // Handle resize efficiently with debounce
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
  
  // Use requestAnimationFrame for smooth animation
  let animationId: number;
  const animate = () => {
    // Slow down rotation for smoother look
    particlesMesh.rotation.x += 0.0003;
    particlesMesh.rotation.y += 0.0003;
    
    renderer.render(scene, camera);
    animationId = requestAnimationFrame(animate);
  };
  
  animate();
  
  // Return cleanup function
  return () => {
    window.removeEventListener('resize', handleResize);
    cancelAnimationFrame(animationId);
    mountElement.removeChild(renderer.domElement);
    
    // Dispose resources
    scene.remove(particlesMesh);
    particlesGeometry.dispose();
    particlesMaterial.dispose();
    renderer.dispose();
  };
};

export const Login: React.FC = () => {
  const [view, setView] = useState<'employee-login' | 'student-login' | 'admin-login' | 'register' | 'forgot-password'>('student-login');
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [box, setBox]=useState('student');

  useEffect(() => {
    let cleanup: () => void;
    
    if (mountRef.current) {
      cleanup = setupThreeJS(mountRef.current);
      
      // Set loaded state with a small delay to ensure smooth initial animations
      setTimeout(() => setIsLoaded(true), 100);
    }
    
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  // Add CSS class to trigger view change animation
  const [viewTransition, setViewTransition] = useState(false);
  
  const changeView = (newView: typeof view) => {
    setViewTransition(true);
    setTimeout(() => {
      setView(newView);
      setViewTransition(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeInTitle {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .title-animation {
          opacity: 0;
          animation: fadeInTitle 0.6s ease-out forwards;
        }
        
        .subtitle-animation {
          opacity: 0;
          animation: fadeInTitle 0.6s ease-out 0.2s forwards;
        }
        
        .buttons-animation {
          opacity: 0;
          animation: fadeIn 0.6s ease-out 0.4s forwards;
        }
        
        .content-animation {
          opacity: 0;
          animation: fadeIn 0.6s ease-out 0.6s forwards;
        }
        
        .view-exit {
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        
        .view-enter {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        /* Button hover effects with pure CSS */
        .btn-hover {
          transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.3s ease;
        }
        
        .btn-hover:hover {
          transform: scale(1.03);
        }
        
        .btn-hover:active {
          transform: scale(0.97);
        }
        
        .btn-primary:hover {
          box-shadow: 0 0 20px rgba(124, 58, 237, 0.4);
        }
        
        .btn-secondary:hover {
          border-color: rgb(124, 58, 237);
          color: rgb(167, 139, 250);
        }
        
        /* Course card animations */
        .card-animation {
          opacity: 0;
          transform: translateY(20px);
        }
        
        .card-animation-1 { animation: fadeIn 0.5s ease-out 0.1s forwards; }
        .card-animation-2 { animation: fadeIn 0.5s ease-out 0.2s forwards; }
        .card-animation-3 { animation: fadeIn 0.5s ease-out 0.3s forwards; }
        .card-animation-4 { animation: fadeIn 0.5s ease-out 0.4s forwards; }
      `}</style>
      
      {/* 3D Background container with optimized rendering */}
      <div ref={mountRef} className="absolute inset-0 z-0" style={{ pointerEvents: 'none' }} />
      
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`text-center mb-12 ${isLoaded ? 'title-animation' : 'opacity-0'}`}>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-primary-400">Sankalp</span> <span className="text-white">Training Portal</span>
          </h1>
          <p className={`text-xl text-gray-300 ${isLoaded ? 'subtitle-animation' : 'opacity-0'}`}>
            Bridging Silence, Building Connections
          </p>
        </div>

        <div className={`flex flex-wrap justify-center gap-4 mb-12 ${isLoaded ? 'buttons-animation' : 'opacity-0'}`}>
          <button
            onClick={() => {
              changeView('student-login')
              setBox('student');
            }}
            className={`flex items-center px-6 py-3 rounded-full btn-hover ${
              view === 'student-login'
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 btn-primary'
                : 'bg-black/80 border-2 border-gray-700 text-gray-300 btn-secondary'
            }`}
          >
            <GraduationCap className="w-5 h-5 mr-2" />
            Student Login
          </button>

          <button
            onClick={() => {
              changeView('employee-login');
              setBox('employee');
            }}
            className={`flex items-center px-6 py-3 rounded-full btn-hover ${
              view === 'employee-login'
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 btn-primary'
                : 'bg-black/80 border-2 border-gray-700 text-gray-300 btn-secondary'
            }`}
          >
            <GraduationCap className="w-5 h-5 mr-2" />
            Employee Login
          </button>
          
          <button
            onClick={() => changeView('admin-login')}
            className={`flex items-center px-6 py-3 rounded-full btn-hover ${
              view === 'admin-login'
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 btn-primary'
                : 'bg-black/80 border-2 border-gray-700 text-gray-300 btn-secondary'
            }`}
          >
            <Shield className="w-5 h-5 mr-2" />
            Admin Login
          </button>
          
          
        </div>
 
        <div className={`flex justify-center ${viewTransition ? 'view-exit' : isLoaded ? 'view-enter' : 'opacity-0'}`}>
          {view === 'employee-login' && (
            <div className="content-animation">
              <LoginForm
                type="employee"
                onRegisterClick={() => changeView('register')}
                onForgotPassword={() => changeView('forgot-password')}
              />
            </div>
          )}
          {view === 'student-login' && (
            <div className="content-animation">
              <LoginForm
                type="student"
                onRegisterClick={() => changeView('register')}
                onForgotPassword={() => changeView('forgot-password')}
              />
            </div>
          )}
          {view === 'admin-login' && 
            <div className="content-animation">
              <LoginForm 
                type="admin" 
                onForgotPassword={() => changeView('forgot-password')}
              />
            </div>
          }
          {view === 'register' && (
            <div className="content-animation">
              {box==='student' && (<RegisterForm onLoginClick={() => changeView('student-login')} reg={box} />)}
              {box==='employee' && (<RegisterForm onLoginClick={() => changeView('employee-login')}  reg={box}/>)}
            </div>
          )}

            {view === 'forgot-password' && (
            <div className="content-animation">
              <ForgotPasswordForm onBackToLogin={() => changeView('student-login')} />
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};
