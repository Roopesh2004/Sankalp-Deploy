import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Rocket, Briefcase, Users, Award } from 'lucide-react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/autoplay';
// Import required modules
import { Autoplay } from 'swiper/modules';
import * as THREE from 'three';

const Features = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const mountRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
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
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      scene.remove(particlesMesh);
      particlesGeometry.dispose();
      particlesMaterial.dispose();
    };
  }, []);

  // ENHANCED: more dramatic staggering and springier animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3, // Increased from 0.2
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 }, // Increased from y: 20
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 120, // Increased from 100
        damping: 15,    // Reduced from 20 for more bounce
      },
    },
  };

  const iconAnimation = {
    hidden: { scale: 0, rotate: -10 }, // Added rotation
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260, // Increased from 200
        damping: 12,    // Reduced from 15 for more bounce
      },
    },
  };

  return (
    <section className="py-16 overflow-hidden relative">
      {/* Background container - using Hero's 3D background */}
      
      
      {/* Gradient overlay for better transition from hero section */}
      <div className="absolute inset-0 bg-gradient-to-b from-black to-[#201f21] z-0" /> {/* Reduced opacity from 90 to 80 */}
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-display">
            Our Features
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Explore the benefits of our program and how we help you achieve success.
          </p>
        </motion.div>

        <Swiper
          modules={[Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          loop={true} // Infinite scrolling
          speed={3000} // Adjusted from 5000 for more noticeable movement
          autoplay={{
            delay: 1, // Tiny delay for smooth effect
            disableOnInteraction: false, // Keeps autoplay running even after interaction
          }}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
        >
          {/* Duplicate the Feature Cards for smooth looping */}
          {[...Array(2)].map((_, index) => (
            <React.Fragment key={index}>
              <SwiperSlide>
                <FeatureCard
                  icon={<Rocket className="h-8 w-8 text-primary-400" />}
                  title="100% Placement"
                  description="Guaranteed placement assistance for all trainees, ensuring jobs in top tech companies."
                  variants={itemVariants}
                  iconVariants={iconAnimation}
                />
              </SwiperSlide>

              <SwiperSlide>
                <FeatureCard
                  icon={<Briefcase className="h-8 w-8 text-primary-400" />}
                  title="Paid Internship"
                  description="Every successful candidate secures a 100% paid internship with a stipend of up to ₹10,000."
                  variants={itemVariants}
                  iconVariants={iconAnimation}
                />
              </SwiperSlide>

              <SwiperSlide>
                <FeatureCard
                  icon={<Users className="h-8 w-8 text-primary-400" />}
                  title="Expert Mentorship"
                  description="Get 1-on-1 mentorship from experienced professionals in the tech industry."
                  variants={itemVariants}
                  iconVariants={iconAnimation}
                />
              </SwiperSlide>

              <SwiperSlide>
                <FeatureCard
                  icon={<Award className="h-8 w-8 text-primary-400" />}
                  title="Real-World Projects"
                  description="Work on industry-relevant projects to build a strong portfolio and gain practical experience."
                  variants={itemVariants}
                  iconVariants={iconAnimation}
                />
              </SwiperSlide>
            </React.Fragment>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
  variants,
  iconVariants,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  variants: any;
  iconVariants: any;
}) => {
  // Custom hooks for internal card animations
  const [isHovered, setIsHovered] = useState(false);
  const [pulseTime, setPulseTime] = useState(0);
  
  // Reference to handle animation frame
  const pulseRef = useRef<number>();
  
  // Setup pulsing animation that matches the background
  useEffect(() => {
    const animatePulse = () => {
      setPulseTime(prev => prev + 0.02);
      pulseRef.current = requestAnimationFrame(animatePulse);
    };
    
    pulseRef.current = requestAnimationFrame(animatePulse);
    
    return () => {
      if (pulseRef.current) {
        cancelAnimationFrame(pulseRef.current);
      }
    };
  }, []);
  
  // Calculate the pulse value for glow effect
  const pulseValue = Math.sin(pulseTime * 3) * 0.5 + 0.5;
  
  // Energy particles animation variants
  const particleVariants = {
    animate: (i: number) => ({
      y: [0, -40, -80],
      x: [0, Math.sin(i * 5) * 15, Math.sin(i * 3) * 10],
      opacity: [0, 0.8, 0],
      scale: [0.5, 1, 0.2],
      transition: {
        duration: 2 + i * 0.5,
        repeat: Infinity,
        ease: "easeOut",
        delay: i * 0.2,
      }
    })
  };

  return (
    <motion.div
      variants={variants}
      className="bg-dark-300 p-8 rounded-xl shadow-lg transition-all duration-300 border border-dark-400 group relative overflow-hidden"
      style={{
        boxShadow: isHovered 
          ? `0 10px 30px -10px rgba(124, 58, 237, ${0.5 + pulseValue * 0.5})` 
          : `0 10px 15px -10px rgba(124, 58, 237, ${0.2 + pulseValue * 0.2})`,
        borderColor: isHovered 
          ? `rgba(124, 58, 237, ${0.6 + pulseValue * 0.4})` 
          : `rgba(124, 58, 237, ${0.1 + pulseValue * 0.1})`,
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ 
        y: -8,
        scale: 1.03,
        transition: { duration: 0.3 }
      }}
    >
      {/* Animated gradient background */}
      <motion.div 
        className="absolute inset-0 opacity-20 bg-gradient-to-br from-primary-800 to-primary-600 z-0 rounded-xl"
        animate={{
          backgroundPosition: isHovered 
            ? ['0% 0%', '100% 100%'] 
            : ['0% 0%', '50% 50%'],
        }}
        transition={{
          duration: isHovered ? 3 : 8,
          ease: "linear",
          repeat: Infinity,
          repeatType: "reverse"
        }}
        style={{
          backgroundSize: "200% 200%",
        }}
      />
      
      {/* Card content container - needs to be above the animated background */}
      <div className="relative z-10">
        {/* Icon container with glow effect */}
        <motion.div
          className="bg-dark-200 p-3 rounded-lg inline-block mb-4 relative group-hover:bg-primary-900/30 transition-colors"
          variants={iconVariants}
          whileHover={{ 
            rotate: 5, 
            scale: 1.1,
            transition: { duration: 0.2 } 
          }}
          animate={{
            boxShadow: `0 0 ${10 + pulseValue * 15}px ${pulseValue * 5}px rgba(124, 58, 237, ${0.3 + pulseValue * 0.4})`
          }}
          transition={{
            boxShadow: {
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }
          }}
        >
          {icon}
        </motion.div>
        
        {/* Animated title with subtle glow on hover */}
        <motion.h3 
          className="text-xl font-bold text-white mb-3 relative"
          variants={variants}
          animate={isHovered ? {
            textShadow: `0 0 8px rgba(124, 58, 237, ${0.5 + pulseValue * 0.5})`
          } : {
            textShadow: "none"
          }}
          transition={{ duration: 0.3 }}
        >
          {title}
        </motion.h3>
        
        {/* Description text with subtle animation */}
        <motion.p 
          className="text-gray-400 relative"
          variants={variants}
          animate={isHovered ? { color: "#B794F4" } : { color: "#9CA3AF" }}
          transition={{ duration: 0.6 }}
        >
          {description}
        </motion.p>
      </div>
      
      {/* Energy particles that float up when card is hovered */}
      {isHovered && (
        <>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bottom-4 left-1/2 w-2 h-2 rounded-full bg-primary-400"
              style={{ x: "-50%" }}
              custom={i}
              variants={particleVariants}
              animate="animate"
            />
          ))}
          
          {/* Pulse ring effect on hover */}
          <motion.div
            className="absolute inset-0 rounded-xl border border-primary-500 z-0"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0, 0.5, 0],
              scale: [0.8, 1.1, 1.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        </>
      )}
      
      {/* Corner energy lines */}
      <motion.div 
        className="absolute h-8 w-1 bg-primary-500 top-0 right-8 rounded-b-full opacity-40"
        animate={{ 
          height: isHovered ? [8, 16, 8] : [8, 12, 8],
          opacity: isHovered ? [0.4, 0.8, 0.4] : [0.2, 0.4, 0.2] 
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div 
        className="absolute h-1 w-8 bg-primary-500 bottom-8 left-0 rounded-r-full opacity-40"
        animate={{ 
          width: isHovered ? [8, 16, 8] : [8, 12, 8],
          opacity: isHovered ? [0.4, 0.8, 0.4] : [0.2, 0.4, 0.2]
        }}
        transition={{ 
          duration: 2.5, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      />
    </motion.div>
  );
};

export default Features;