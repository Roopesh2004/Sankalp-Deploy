import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';
import * as THREE from 'three';

const Services = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    // Set up scene
    const scene = new THREE.Scene();
    
    // Set up camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }
    
    // Create a geometry for particles
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
      
      // Non-reactive animation (no mouse interaction)
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
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      scene.remove(particlesMesh);
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  // Animations for container and title
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const titleVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.7,
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    }
  };

  // Services data with background images from public folder
  const services = [
    {
      backgroundImage: "/appdev.png",
      color: "from-green-600 to-green-800",
      highlight: "green",
      link: "/getstarted"
    },
    {
      backgroundImage: "/cc.png",
      color: "from-purple-600 to-purple-800",
      highlight: "purple",
      link: "/getstarted"
    },
    {
      backgroundImage: "/cp.jpg",
      color: "from-red-600 to-red-800",
      highlight: "red",
      link: "/getstarted"
    },
    {
      backgroundImage: "/da.jpg",
      color: "from-yellow-600 to-yellow-800",
      highlight: "yellow",
      link: "/getstarted"
    },
    {
      backgroundImage: "/dl.jpg",
      color: "from-indigo-600 to-indigo-800",
      highlight: "indigo",
      link: "/getstarted"
    },
    {
      backgroundImage: "/devops.jpg",
      color: "from-teal-600 to-teal-800",
      highlight: "teal",
      link: "/getstarted"
    },
    {
      backgroundImage: "/genai.jpg",
      color: "from-pink-600 to-pink-800",
      highlight: "pink",
      link: "/getstarted"
    },
    {
      backgroundImage: "/ml.jpg",
      color: "from-cyan-600 to-cyan-800",
      highlight: "cyan",
      link: "/getstarted"
    },
    {
      backgroundImage: "/webdev.jpg",
      color: "from-orange-600 to-orange-800",
      highlight: "orange",
      link: "/getstarted"
    }
  ];

  const handleCardClick = () => {
    // Navigate to /getstarted
    window.location.href = '/getstarted';
  };

  return (
    <section id="services" className="py-20 bg-black relative overflow-hidden">
      {/* Three.js Background container */}
      <div ref={mountRef} className="absolute inset-0 z-0" style={{ pointerEvents: 'none' }} />
      
      <div className="w-[95vw] container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-5xl font-bold text-white mb-4 font-display"
            variants={titleVariants}
            initial="hidden"
            animate="visible"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-purple-600">
              Our Courses
            </span>
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Explore our comprehensive range of technical courses designed to prepare you for the future of technology with hands-on learning and industry expertise.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              backgroundImage={service.backgroundImage}
              color={service.color}
              highlight={service.highlight}
              delay={index * 0.1}
              onClick={handleCardClick}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

interface ServiceCardProps { 
  backgroundImage: string;
  color: string;
  highlight: string;
  delay: number;
  onClick: () => void;
}

const ServiceCard = ({ 
  backgroundImage,
  color,
  highlight,
  delay,
  onClick
}: ServiceCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const controls = useAnimation();
  
  const cardVariants: Variants = {
    hidden: { 
      opacity: 0,
      y: 30, 
      scale: 0.9 
    },
    visible: { 
      opacity: 1,
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 200, 
        damping: 20,
        delay 
      } 
    },
    hover: { 
      y: -10,
      scale: 1.03,
      boxShadow: `0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3), 0 0 0 2px rgb(139, 92, 246, 0.3)`,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 15 
      } 
    }
  };

  const glowVariants: Variants = {
    initial: { opacity: 0 },
    hover: { 
      opacity: 0.6,
      transition: { duration: 0.3 }
    }
  };

  useEffect(() => {
    if (isHovered) {
      controls.start('hover');
    } else {
      controls.start('visible');
    }
  }, [isHovered, controls]);

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate={controls}
      className="bg-dark-300/80 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300 border border-dark-400 relative cursor-pointer aspect-[4/3]"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Animated glow effect */}
      <motion.div 
        className="absolute inset-0 blur-xl rounded-xl"
        variants={glowVariants}
        initial="initial"
        animate={isHovered ? "hover" : "initial"}
        style={{ 
          backgroundColor: highlight === 'blue' ? 'rgba(59, 130, 246, 0.2)' :
                          highlight === 'green' ? 'rgba(16, 185, 129, 0.2)' :
                          highlight === 'purple' ? 'rgba(139, 92, 246, 0.2)' :
                          highlight === 'red' ? 'rgba(239, 68, 68, 0.2)' :
                          highlight === 'yellow' ? 'rgba(245, 158, 11, 0.2)' :
                          highlight === 'indigo' ? 'rgba(99, 102, 241, 0.2)' :
                          highlight === 'teal' ? 'rgba(20, 184, 166, 0.2)' :
                          highlight === 'pink' ? 'rgba(236, 72, 153, 0.2)' :
                          highlight === 'cyan' ? 'rgba(6, 182, 212, 0.2)' :
                          highlight === 'orange' ? 'rgba(249, 115, 22, 0.2)' :
                          'rgba(99, 102, 241, 0.2)'
        }}
      />

      {/* Full card image */}
      <div className="absolute inset-0 relative overflow-hidden">
        <img 
          src={backgroundImage}
          alt="Course"
          className="w-full h-full object-cover"
        />
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)'
          }}
        />
        {/* Animated particles in the card */}
        {isHovered && (
          <motion.div 
            className="absolute inset-0 opacity-60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 0.5 }}
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white"
                initial={{ 
                  x: Math.random() * 100 + '%', 
                  y: Math.random() * 100 + '%',
                  opacity: Math.random() * 0.5 + 0.3
                }}
                animate={{ 
                  y: [null, Math.random() * -100], 
                  opacity: [null, 0],
                }}
                transition={{
                  duration: Math.random() * 2 + 1,
                  repeat: Infinity,
                  repeatType: 'loop',
                  ease: 'easeOut',
                  delay: Math.random() * 2
                }}
                style={{
                  width: Math.random() * 3 + 1 + 'px',
                  height: Math.random() * 3 + 1 + 'px',
                }}
              />
            ))}
          </motion.div>
        )}
      </div>
      
      {/* Bottom shine effect */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-1"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={isHovered ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={{ 
          background: color.includes('blue') ? 'linear-gradient(to right, #2563eb, #3b82f6)' :
                     color.includes('green') ? 'linear-gradient(to right, #059669, #10b981)' :
                     color.includes('purple') ? 'linear-gradient(to right, #7c3aed, #8b5cf6)' :
                     color.includes('red') ? 'linear-gradient(to right, #dc2626, #ef4444)' :
                     color.includes('yellow') ? 'linear-gradient(to right, #d97706, #f59e0b)' :
                     color.includes('indigo') ? 'linear-gradient(to right, #4f46e5, #6366f1)' :
                     color.includes('teal') ? 'linear-gradient(to right, #0d9488, #14b8a6)' :
                     color.includes('pink') ? 'linear-gradient(to right, #db2777, #ec4899)' :
                     color.includes('cyan') ? 'linear-gradient(to right, #0891b2, #06b6d4)' :
                     color.includes('orange') ? 'linear-gradient(to right, #ea580c, #f97316)' :
                     'linear-gradient(to right, #4f46e5, #6366f1)'
        }}
      />
    </motion.div>
  );
};

export default Services;