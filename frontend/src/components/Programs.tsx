import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { GraduationCap, Briefcase, ArrowRight } from 'lucide-react';
import * as THREE from 'three';

const Programs = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  // Background animation setup
  const mountRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const [isVisible, setIsVisible] = useState(false);
  
  // Setup Three.js background
  useEffect(() => {
    if (!mountRef.current) return;
    
    setIsVisible(true);
    
    // Set up scene
    const scene = new THREE.Scene();
    
    // Set up camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }
    
    // Create a geometry for particles - HERO BACKGROUND
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 5000;
    
    const posArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
      // Create a cube of particles
      posArray[i] = (Math.random() - 0.5) * 15;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    // Create material for particles
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.03,
      color: 0x7c3aed,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    
    // Create the particle system
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    // Add some ambient light
    const ambientLight = new THREE.AmbientLight(0x7c3aed, 0.5);
    scene.add(ambientLight);
    
    // Add a point light
    const pointLight = new THREE.PointLight(0x7c3aed, 0.8);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);
    
    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    const animate = () => {
      particlesMesh.rotation.x += 0.0005;
      particlesMesh.rotation.y += 0.0005;
      
      // Add mouse interaction
      const mouseX = 0;
      const mouseY = 0;
      particlesMesh.position.x += (mouseX - particlesMesh.position.x) * 0.05;
      particlesMesh.position.y += (-mouseY - particlesMesh.position.y) * 0.05;
      
      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      scene.remove(particlesMesh);
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      
      setIsVisible(false);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
      },
    },
  };

  const titleVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    },
  };

  return (
    <section id="programs" className="py-20 bg-black relative overflow-hidden mx-auto">
      {/* Background animation container */}
      <div ref={mountRef} className="absolute inset-0 z-0" style={{ pointerEvents: 'none' }} />
      
      {/* Gradient overlay - slightly more transparent for better visibility of background */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-100/80 to-dark-100/70 z-0" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10 w-[90vw]">
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={titleVariants}
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-white mb-4 font-display"
            variants={titleVariants}
          >
            Our Training Programs
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-300 max-w-2xl mx-auto"
            variants={titleVariants}
          >
            Choose the program that aligns with your career goals and take the first step towards a successful tech career.
          </motion.p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 gap-10"
        >
          <ProgramCard
            icon={<GraduationCap className="h-10 w-10 text-white" />}
            title="Undergraduate Program"
            subtitle="Crack Top Tech Companies"
            description="For students looking to secure placements in top-tier companies, our Undergraduate Training Program is designed to build a strong foundation in coding, problem-solving, and real-world application development."
            features={[
              "Expert mentorship from industry professionals",
              "Real-world projects to build your portfolio",
              "Comprehensive interview preparation",
              "Placement assistance in leading MNCs and startups"
            ]}
            color="from-primary-600 to-primary-800"
            variants={cardVariants}
          />

          <ProgramCard
            icon={<Briefcase className="h-10 w-10 text-white" />}
            title="Career Transition Program"
            subtitle="Shift to Tech Roles"
            description="If you're a working professional from a non-tech background and want to switch to a high-paying tech career, our Career Transition Program is for you."
            features={[
              "Learn Full Stack Development, AI, App Development",
              "Structured, hands-on learning approach",
              "Industry-recognized skills certification",
              "Career counseling and job placement support"
            ]}
            color="from-secondary-600 to-secondary-800"
            variants={cardVariants}
          />
        </motion.div>
      </div>
    </section>
  );
};

const ProgramCard = ({ 
  icon, 
  title, 
  subtitle,
  description, 
  features,
  color,
  variants
}: { 
  icon: React.ReactNode; 
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  color: string;
  variants: any;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [pulseTime, setPulseTime] = useState(0);
  const pulseRef = useRef<number>();
  
  // Energy pulse animation with faster rate
  useEffect(() => {
    const animatePulse = () => {
      setPulseTime(prev => prev + 0.03); // Faster pulse rate (was 0.02)
      pulseRef.current = requestAnimationFrame(animatePulse);
    };
    
    pulseRef.current = requestAnimationFrame(animatePulse);
    
    return () => {
      if (pulseRef.current) {
        cancelAnimationFrame(pulseRef.current);
      }
    };
  }, []);
  
  // Calculate pulse value for glow effects with wider range
  const pulseValue = Math.sin(pulseTime * 2.5) * 0.6 + 0.6; // Increased range and base value
  
  const featureVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
      }
    }
  };
  
  // Energy particles animation with more particles
  const particleVariants = {
    animate: (i: number) => ({
      y: [0, -40, -80], // Longer travel distance
      x: [0, Math.sin(i * 5) * 15, Math.sin(i * 3) * 12], // Wider oscillation
      opacity: [0, 0.8, 0], // More visible (was 0.6)
      scale: [0.5, 1.2, 0.2], // Larger scale (was 0.8)
      transition: {
        duration: 1.5 + i * 0.4,
        repeat: Infinity,
        ease: "easeOut",
        delay: i * 0.2,
      }
    })
  };

  return (
    <motion.div
      variants={variants}
      className="bg-dark-300 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow border border-dark-400 relative"
      whileHover={{ y: -8 }} // More movement on hover (was -5)
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        boxShadow: isHovered 
          ? `0 15px 40px -10px rgba(124, 58, 237, ${0.6 + pulseValue * 0.4})` // Stronger glow
          : `0 8px 20px -5px rgba(124, 58, 237, ${0.2 + pulseValue * 0.2})`, // Stronger ambient glow
        borderColor: isHovered 
          ? `rgba(124, 58, 237, ${0.7 + pulseValue * 0.3})` // More visible border
          : `rgba(45, 55, 72, ${0.8 + pulseValue * 0.2})`,
      }}
    >
      {/* Animated gradient background with higher opacity */}
      <motion.div 
        className="absolute inset-0 opacity-20 z-0" // Increased from opacity-10
        animate={{
          background: isHovered 
            ? `radial-gradient(circle at ${50 + Math.sin(pulseTime * 3) * 25}% ${50 + Math.cos(pulseTime * 2) * 25}%, rgba(124, 58, 237, 0.9), rgba(79, 70, 229, 0.3))` // More vibrant gradient
            : `radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.4), rgba(79, 70, 229, 0.2))`, // Higher base opacity
          opacity: isHovered ? [0.2, 0.4, 0.2] : 0.2 // More visible (was 0.1, 0.3, 0.1)
        }}
        transition={{
          opacity: {
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          },
          background: {
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse"
          }
        }}
      />
      
      <motion.div 
        className={`bg-gradient-to-r ${color} p-6 flex items-start relative overflow-hidden`}
        whileHover={{ scale: 1.03 }} // Slightly more scaling (was 1.02)
        transition={{ duration: 0.2 }}
      >
        {/* Animated light beam in header - brighter and more frequent */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full opacity-50" // Increased from opacity-30
          animate={{
            background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,${0.2 + pulseValue * 0.3}) 50%, transparent 100%)`, // Brighter
            left: ['-100%', '100%']
          }}
          transition={{
            left: {
              duration: 2, // Faster (was 3)
              repeat: Infinity,
              repeatDelay: 0.5 // Less delay (was 1)
            }
          }}
        />
        
        <motion.div 
          className="mr-4 bg-white/30 p-3 rounded-lg relative z-10" // Increased from bg-white/20
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.8 }}
          animate={{
            boxShadow: `0 0 ${8 + pulseValue * 12}px ${pulseValue * 5}px rgba(255, 255, 255, ${0.5 + pulseValue * 0.3})` // Stronger glow
          }}
        >
          {icon}
          
          {/* Energy particles around icon - always visible but more intense on hover */}
          {[...Array(5)].map((_, i) => ( // More particles (was 3)
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-white" // Larger particles (was 1.5)
              style={{ 
                top: '50%', 
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
              custom={i}
              variants={particleVariants}
              animate="animate"
              initial={{ opacity: isHovered ? 1 : 0.5 }} // Always visible but more intense on hover
            />
          ))}
        </motion.div>
        
        <div>
          <motion.h3 
            className="text-2xl font-bold text-white mb-1"
            variants={featureVariants}
            animate={{
              textShadow: `0 0 ${isHovered ? 12 : 6}px rgba(255, 255, 255, ${0.4 + pulseValue * 0.4})` // Always has glow, stronger on hover
            }}
          >
            {title}
          </motion.h3>
          <motion.p 
            className="text-white/80 font-medium"
            variants={featureVariants}
          >
            {subtitle}
          </motion.p>
        </div>
      </motion.div>
      
      <div className="p-6 relative z-10">
        <motion.p 
          className="text-gray-300 mb-6"
          variants={featureVariants}
        >
          {description}
        </motion.p>
        
        <div className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              className="flex items-start"
              variants={featureVariants}
              custom={index}
              whileHover={{ x: 12 }} // More movement (was 10)
              animate={isHovered ? { x: [0, 3, 0] } : { x: 0 }} // More movement (was 2)
              transition={isHovered ? { 
                x: { duration: 0.5, repeat: 0 },
                delay: index * 0.05
              } : {}}
            >
              <motion.div 
                className="flex-shrink-0 h-5 w-5 rounded-full bg-primary-900/40 flex items-center justify-center mt-1" // More visible bg (was /30)
                animate={{
                  backgroundColor: ['rgba(79, 70, 229, 0.4)', 'rgba(124, 58, 237, 0.7)', 'rgba(79, 70, 229, 0.4)'] // More vibrant colors
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: index * 0.1
                }}
              >
                <motion.svg 
                  className="h-3.5 w-3.5 text-primary-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  animate={{
                    scale: [1, 1.3, 1], // More scaling (was 1.2)
                    color: ['#a78bfa', '#d8b4fe', '#a78bfa'] // Brighter middle color
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: index * 0.1
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </motion.svg>
              </motion.div>
              <p className="ml-3 text-gray-300">{feature}</p>
            </motion.div>
          ))}
        </div>
        
        <motion.button
          className="w-full bg-dark-200 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-dark-400 transition-colors border border-dark-400 relative overflow-hidden"
          whileHover={{ scale: 1.03 }} // More scaling (was 1.02)
          whileTap={{ scale: 0.97 }} // More scaling (was 0.98)
        >
          {/* Button hover effect - more visible sweep */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary-900/10 via-primary-700/20 to-primary-900/10" // More visible gradient
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              x: {
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop"
              }
            }}
          />
          
          <span className="relative z-10">Learn More</span> 
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="relative z-10"
          >
            <ArrowRight size={16} />
          </motion.div>
        </motion.button>
      </div>
      
      {/* Corner energy lines - more visible */}
      <motion.div 
        className="absolute h-6 w-1.5 bg-primary-500 top-0 right-6 rounded-b-full opacity-50" // Wider and more visible (was w-1, opacity-30)
        animate={{ 
          height: isHovered ? [6, 16, 6] : [6, 10, 6], // Higher variation
          opacity: isHovered ? [0.5, 0.8, 0.5] : [0.3, 0.5, 0.3] // More visible
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div 
        className="absolute h-1.5 w-6 bg-primary-500 bottom-6 left-0 rounded-r-full opacity-50" // Taller and more visible (was h-1, opacity-30)
        animate={{ 
          width: isHovered ? [6, 16, 6] : [6, 10, 6], // Higher variation
          opacity: isHovered ? [0.5, 0.8, 0.5] : [0.3, 0.5, 0.3] // More visible
        }}
        transition={{ 
          duration: 2.5, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      />

      {/* Additional corner energy lines for more visual interest */}
      <motion.div 
        className="absolute h-1.5 w-6 bg-primary-500 top-6 left-0 rounded-r-full opacity-50"
        animate={{ 
          width: isHovered ? [6, 12, 6] : [6, 8, 6],
          opacity: isHovered ? [0.5, 0.8, 0.5] : [0.3, 0.5, 0.3]
        }}
        transition={{ 
          duration: 2.2, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.3
        }}
      />
      
      <motion.div 
        className="absolute h-6 w-1.5 bg-primary-500 bottom-0 right-6 rounded-t-full opacity-50"
        animate={{ 
          height: isHovered ? [6, 12, 6] : [6, 8, 6],
          opacity: isHovered ? [0.5, 0.8, 0.5] : [0.3, 0.5, 0.3]
        }}
        transition={{ 
          duration: 1.8, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.7
        }}
      />
    </motion.div>
  );
};

export default Programs;