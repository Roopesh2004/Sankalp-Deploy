import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Rocket, Code, Users, Award } from 'lucide-react';
import * as THREE from 'three';

const WhyChoose = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const mountRef = useRef(null);
  const animationRef = useRef();

  // Initialize THREE.js background (matching Hero section)
  useEffect(() => {
    if (!mountRef.current) return;

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
    
    // Create a geometry for particles (matching Hero section)
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
    
    // Animation loop - Animated but not reactive to hover
    const animate = () => {
      // Slow, continuous rotation for ambient movement
      particlesMesh.rotation.x += 0.0005;
      particlesMesh.rotation.y += 0.0005;
      
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

  return (
    <section className="py-20 relative overflow-hidden">
      {/* 3D Background container (matching Hero section) */}
      <div ref={mountRef} className="absolute inset-0 z-0" style={{ pointerEvents: 'none' }} />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-200/70 to-dark-200/60 z-10" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-20">
        <div className="text-center mb-16">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-white mb-4 font-display"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            Why Choose SpectoV?
          </motion.h2>
          <motion.p
            className="text-lg text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            We're committed to your success with industry-leading training and career support.
          </motion.p>
        </div>
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 gap-10"
        >
          <ReasonCard
            icon={<Rocket className="h-10 w-10 text-white" />}
            title="100% Placement & Paid Internship"
            description="We guarantee 100% placement assistance and a paid internship with a stipend of up to ₹10,000. Our program ensures you gain real-world experience and become industry-ready while earning from day one."
            variants={cardVariants}
          />
          <ReasonCard
            icon={<Code className="h-10 w-10 text-white" />}
            title="Industry-Aligned Training & Real-World Projects"
            description="Our curriculum is designed by top industry experts and includes live projects, hackathons, and hands-on coding challenges. This ensures you develop practical skills that employers look for in the tech industry."
            variants={cardVariants}
          />
          <ReasonCard
            icon={<Users className="h-10 w-10 text-white" />}
            title="Personalized Mentorship & Interview Preparation"
            description="Get 1-on-1 mentorship from experienced professionals, resume-building support, and mock interviews to crack top FAANG and MNC job interviews with confidence."
            variants={cardVariants}
          />
          <ReasonCard
            icon={<Award className="h-10 w-10 text-white" />}
            title="Career Support for Students & Professionals"
            description="Whether you're an undergraduate looking to land a top job or a professional wanting to shift to a tech career, we have customized training paths to help you succeed in your career transition."
            variants={cardVariants}
          />
        </motion.div>
      </div>
    </section>
  );
};

const ReasonCard = ({ icon, title, description, variants }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [pulseTime, setPulseTime] = useState(0);
  const pulseRef = useRef();

  // Energy pulse animation
  useEffect(() => {
    const animatePulse = () => {
      setPulseTime(prev => prev + 0.03);
      pulseRef.current = requestAnimationFrame(animatePulse);
    };

    pulseRef.current = requestAnimationFrame(animatePulse);

    return () => {
      if (pulseRef.current) {
        cancelAnimationFrame(pulseRef.current);
      }
    };
  }, []);

  const pulseValue = Math.sin(pulseTime * 2.5) * 0.6 + 0.6;

  return (
    <motion.div
      variants={variants}
      className="bg-dark-300/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow border border-dark-400 relative"
      whileHover={{ y: -8, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        boxShadow: isHovered
          ? `0 15px 40px -10px rgba(124, 58, 237, ${0.6 + pulseValue * 0.4})`
          : `0 8px 20px -5px rgba(124, 58, 237, ${0.2 + pulseValue * 0.2})`,
        borderColor: isHovered
          ? `rgba(124, 58, 237, ${0.7 + pulseValue * 0.3})`
          : `rgba(45, 55, 72, ${0.8 + pulseValue * 0.2})`,
      }}
    >
      <motion.div
        className={`absolute inset-0 opacity-20 z-0`}
        animate={{
          background: isHovered
            ? `radial-gradient(circle at ${50 + Math.sin(pulseTime * 3) * 25}% ${50 + Math.cos(pulseTime * 2) * 25}%, rgba(124, 58, 237, 0.9), rgba(79, 70, 229, 0.3))`
            : `radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.4), rgba(79, 70, 229, 0.2))`,
          opacity: isHovered ? [0.2, 0.4, 0.2] : 0.2
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

      {/* Glowing accent line */}
      <motion.div 
        className="absolute h-1 top-0 left-0 right-0 bg-gradient-to-r from-primary-600 via-primary-400 to-primary-600"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ 
          scaleX: isHovered ? 1 : 0.3, 
          opacity: isHovered ? 1 : 0.7,
          boxShadow: isHovered ? `0 0 10px 1px rgba(124, 58, 237, ${0.7 + pulseValue * 0.3})` : 'none'
        }}
        transition={{ duration: 0.4 }}
      />

      <motion.div
        className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 flex items-start relative overflow-hidden"
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.2 }}
      >
        {/* Animated background particles for each card */}
        <motion.div 
          className="absolute inset-0 z-0 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.2 : 0 }}
          transition={{ duration: 0.4 }}
        >
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                scale: Math.random() * 0.5 + 0.5,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </motion.div>

        <motion.div
          className="mr-4 bg-white/30 p-3 rounded-lg relative z-10"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.8 }}
          animate={{
            boxShadow: `0 0 ${8 + pulseValue * 12}px ${pulseValue * 5}px rgba(255, 255, 255, ${0.5 + pulseValue * 0.3})`
          }}
        >
          {icon}
        </motion.div>

        <div className="relative z-10">
          <motion.h3 
            className="text-2xl font-bold text-white mb-1"
            whileHover={{
              textShadow: "0 0 8px rgba(255, 255, 255, 0.6)"
            }}
          >
            {title}
          </motion.h3>
          <motion.p className="text-white/80 font-medium">
            {description}
          </motion.p>

          {/* Animated highlight when hovered */}
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-white/50 rounded"
            initial={{ width: 0 }}
            animate={{ width: isHovered ? "100%" : 0 }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WhyChoose;