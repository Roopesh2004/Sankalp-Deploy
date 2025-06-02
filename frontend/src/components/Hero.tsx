import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Typewriter from 'typewriter-effect';
import * as THREE from 'three';
import { SphereAnimation } from '../extras/Sphere';
import Features from './Features';

const Hero = () => {
  const mountRef = useRef(null);
  const animationRef = useRef();
  const sceneRef = useRef();
  const rendererRef = useRef();
  const particlesRef = useRef();
  const [isMobile, setIsMobile] = useState(false);
  const [isLowPerfDevice, setIsLowPerfDevice] = useState(false);
  const [animationInitialized, setAnimationInitialized] = useState(false);

  // Create and initialize the THREE.js scene
  const initializeScene = () => {
    if (animationInitialized || !mountRef.current) return;
    
    try {
      // Create scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      
      // Create camera with better positioning for mobile
      const camera = new THREE.PerspectiveCamera(
        isMobile ? 60 : 75, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
      );
      camera.position.z = isMobile ? 7 : 5; // Move camera back on mobile
      
      // Create renderer with optimized settings
      const renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: isMobile ? false : true,
        powerPreference: "high-performance", // Always use high performance
        precision: isMobile ? "lowp" : "mediump", // Lower precision on mobile
        failIfMajorPerformanceCaveat: false // Don't fail on lower performance
      });
      
      // Set appropriate pixel ratio for better mobile performance
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);
      rendererRef.current = renderer;
      
      // Clear container before adding renderer
      if (mountRef.current) {
        while (mountRef.current.firstChild) {
          mountRef.current.removeChild(mountRef.current.firstChild);
        }
        mountRef.current.appendChild(renderer.domElement);
      }

      // Create optimized particles
      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = isMobile ? 800 : 3000; // Reduced particle count for mobile
      
      const posArray = new Float32Array(particlesCount * 3);
      for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * (isMobile ? 10 : 15); // Smaller area on mobile
      }
      
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      particlesGeometry.setDrawRange(0, particlesCount);

      // Optimized material for mobile
      const particlesMaterial = new THREE.PointsMaterial({
        size: isMobile ? 0.1 : 0.03, // Larger particles on mobile for better visibility
        color: 0x7c3aed,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
      });
      
      const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particlesMesh);
      particlesRef.current = particlesMesh;

      // Add lights - keep simple for better performance
      const ambientLight = new THREE.AmbientLight(0x7c3aed, 0.5);
      scene.add(ambientLight);
      
      const pointLight = new THREE.PointLight(0x7c3aed, 0.8);
      pointLight.position.set(2, 3, 4);
      scene.add(pointLight);

      // Add resize handler
      const handleResize = () => {
        if (!rendererRef.current) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      };
      
      window.addEventListener('resize', handleResize);
      
      // Simplified animation loop with throttled frame rate for mobile
      let lastFrameTime = 0;
      const frameInterval = isMobile ? 40 : 16; // ~25fps on mobile, ~60fps on desktop
      
      const animate = (currentTime) => {
        if (!particlesRef.current || !rendererRef.current || !sceneRef.current) return;
        
        // Throttle frame rate
        if (currentTime - lastFrameTime < frameInterval) {
          animationRef.current = requestAnimationFrame(animate);
          return;
        }
        lastFrameTime = currentTime;
        
        // Slower rotation on mobile for better visibility
        particlesRef.current.rotation.x += isMobile ? 0.0001 : 0.0005;
        particlesRef.current.rotation.y += isMobile ? 0.0001 : 0.0005;
        
        rendererRef.current.render(sceneRef.current, camera);
        animationRef.current = requestAnimationFrame(animate);
      };
      
      // Start animation
      animationRef.current = requestAnimationFrame(animate);
      setAnimationInitialized(true);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        if (mountRef.current && rendererRef.current?.domElement) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
        
        // Clean up resources
        if (particlesGeometry) {
          particlesGeometry.dispose();
        }
        if (particlesMaterial) {
          particlesMaterial.dispose();
        }
        if (rendererRef.current) {
          rendererRef.current.dispose();
        }
      };
    } catch (error) {
      console.error("Error initializing Three.js:", error);
      // Fallback for devices that don't support WebGL
      setIsLowPerfDevice(true);
    }
  };

  useEffect(() => {
    // Detect mobile and low performance devices
    const checkPerformance = () => {
      // More reliable mobile detection
      const ua = navigator.userAgent;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      setIsMobile(isMobileDevice);
      
      // Check for WebGL support
      let canvas = document.createElement('canvas');
      let hasWebGL = false;
      
      try {
        hasWebGL = !!(window.WebGLRenderingContext && 
          (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      } catch (e) {
        hasWebGL = false;
      }
      
      // Set low performance only if WebGL is not supported
      const isLowPerf = !hasWebGL;
      setIsLowPerfDevice(isLowPerf);
      
      return { isMobile: isMobileDevice, isLowPerf };
    };
    
    const { isLowPerf } = checkPerformance();
    
    // Don't initialize if it's a low-performance device
    if (!isLowPerf) {
      // Add a small delay to ensure the component is fully mounted
      const timer = setTimeout(() => {
        initializeScene();
      }, 100);
      
      return () => {
        clearTimeout(timer);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, []);

  // Animation variants
  const titleAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  };

  const subtitleAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay: 0.2
      }
    }
  };

  const cardAnimation = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  return (
    <div>
      <section id="home" className="h-[100vh] flex justify-center items-center overflow-hidden relative bg-black">
        {/* Background animation container */}
        <div 
          ref={mountRef} 
          className="absolute inset-0 z-0" 
          style={{ pointerEvents: 'none' }} 
        />
        
        {/* Fallback background for low-performance devices */}
        {isLowPerfDevice && (
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-purple-900/20 to-black">
            {/* Adding some animated particles as a fallback */}
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
        
        <div className="container mx-auto px-4 md:px-6 relative z-10 w-full md:w-[90vw]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.15
                  }
                }
              }}
            >
              <motion.div 
                className="inline-block bg-primary-900/30 text-primary-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4 md:mb-6"
                variants={titleAnimation}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 20px rgba(124, 58, 237, 0.3)"
                }}
              >
                Training Program
              </motion.div>
              
              <motion.h1 
                className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 md:mb-6 font-display"
                variants={titleAnimation}
              >
                <motion.span
                  className="inline-block text-4xl md:text-5xl"
                  variants={subtitleAnimation}
                >
                  <Typewriter
                    options={{
                      strings: ['Sankalp', 'Transform Your Career', 'Learn. Grow. Succeed.'],
                      autoStart: true,
                      loop: true,
                      deleteSpeed: 50,
                      delay: 80,
                    }}
                  />
                </motion.span>
                <motion.div 
                  className="text-primary-400 mt-2"
                  variants={subtitleAnimation}
                  whileHover={{
                    scale: 1.02,
                    textShadow: "0 0 8px rgba(124, 58, 237, 0.6)"
                  }}
                >
                  Bridging Silence, Building Connections
                </motion.div>
              </motion.h1>
              
              <motion.p 
                className="text-base md:text-lg text-gray-300 mb-6 md:mb-8 max-w-xl"
                variants={titleAnimation}
              >
                Join our comprehensive training program and master the skills that top tech companies demand. Get hands-on experience, mentorship, and guaranteed placement opportunities.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                variants={titleAnimation}
              >
                <motion.button
                  className="bg-primary-600 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full font-medium transition-colors flex items-center justify-center gap-2 relative overflow-hidden group"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 0 25px rgba(124, 58, 237, 0.5)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.span
                    className="absolute inset-0 bg-white/30"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.5 }}
                  />
                  Get Started 
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <ArrowRight size={18} />
                  </motion.span>
                </motion.button>
                
                <motion.button
                  className="border-2 border-dark-400 text-gray-300 px-6 md:px-8 py-2.5 md:py-3 rounded-full font-medium hover:border-primary-600 hover:text-primary-400 transition-colors relative overflow-hidden"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 0 25px rgba(124, 58, 237, 0.2)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.span
                    className="absolute inset-0 bg-primary-600/10"
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  Learn More
                </motion.button>
              </motion.div>
            </motion.div>

            <motion.div
              className="relative hidden md:block"
              initial="hidden"
              animate="visible"
              variants={cardAnimation}
            >
              <motion.div 
                className="relative z-10"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
              >
                {/* Only render SphereAnimation if not on a low-performance device */}
                {!isLowPerfDevice && <SphereAnimation/>}
                
                {/* Fallback for low-performance devices */}
                {isLowPerfDevice && (
                  <div className="h-64 w-64 rounded-full bg-gradient-to-br from-purple-600 to-indigo-800 mx-auto opacity-80 shadow-lg shadow-purple-600/30" />
                )}
                
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  whileHover={{ opacity: 0.8 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      <Features/>
      
      {/* Add CSS for the fallback animation */}
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

export default Hero;