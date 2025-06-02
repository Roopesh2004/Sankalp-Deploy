import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Zap, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowRight } from 'lucide-react';
import * as THREE from 'three';

const Footer = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const particlesMeshRef = useRef<THREE.Points | null>(null);
  
  useEffect(() => {
    // Set up scene
    const scene = new THREE.Scene();
    
    // Set up camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // Set up renderer with better performance settings
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }
    
    // Create optimized geometry for particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 3000; // Reduced for better performance
    
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
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    
    // Create the particle system
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    particlesMeshRef.current = particlesMesh;
    
    // Add some ambient light
    const ambientLight = new THREE.AmbientLight(0x7c3aed, 0.5);
    scene.add(ambientLight);
    
    // Add a point light
    const pointLight = new THREE.PointLight(0x7c3aed, 0.8);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);
    
    // Handle resize with debounce for performance
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
    
    // Animation loop with performance optimizations
    let lastTime = 0;
    const animate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      
      // Only update rotation on each frame if delta time is reasonable
      if (delta < 100 && particlesMeshRef.current) {
        particlesMeshRef.current.rotation.x += 0.0003;
        particlesMeshRef.current.rotation.y += 0.0003;
      }
      
      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate(0);
    
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
    };
  }, []);

  // Animation variants for staggered animations
  const containerAnimation = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemAnimation = {
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

  const iconAnimation = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    }
  };

  const SocialIcon = ({ icon }: { icon: React.ReactNode }) => {
    return (
      <motion.a
        href="#"
        className="bg-dark-300 p-2 rounded-full hover:bg-primary-600 transition-colors relative overflow-hidden group"
        variants={iconAnimation}
        whileHover={{ 
          scale: 1.15,
          boxShadow: "0 0 20px rgba(124, 58, 237, 0.5)"
        }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.span
          className="absolute inset-0 bg-primary-400/20 rounded-full"
          initial={{ scale: 0 }}
          whileHover={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
        {icon}
      </motion.a>
    );
  };

  const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    return (
      <motion.li variants={itemAnimation}>
        <motion.a 
          href={href} 
          className="text-gray-400 hover:text-primary-400 transition-colors flex items-center"
          whileHover={{ 
            x: 5,
            textShadow: "0 0 8px rgba(124, 58, 237, 0.6)"
          }}
        >
          <motion.div
            initial={{ x: 0 }}
            whileHover={{ x: 3 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <ArrowRight className="h-3 w-3 mr-2" />
          </motion.div>
          {children}
        </motion.a>
      </motion.li>
    );
  };

  return (
    <footer className="bg-black text-white pt-16 pb-8 relative overflow-hidden">
      {/* THREE.js Background */}
      <div 
        ref={mountRef} 
        className="absolute inset-0 z-0" 
        style={{ pointerEvents: 'none' }} 
      />
      
      {/* Overlay gradient for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark-100 via-dark-100/95 to-transparent z-1" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12"
          variants={containerAnimation}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <motion.div variants={itemAnimation}>
            <motion.div 
              className="flex items-center space-x-2 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={{
                  rotate: [0, 15, 0, -15, 0],
                  scale: [1, 1.2, 1, 1.2, 1]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <Zap className="h-8 w-8 text-primary-400" />
              </motion.div>
              <motion.span
                className="text-2xl font-bold font-display"
                whileHover={{
                  textShadow: "0 0 8px rgba(255, 255, 255, 0.5)"
                }}
              >
                Sankalp<motion.span 
                  className="text-primary-400"
                  animate={{
                    opacity: [1, 0.7, 1],
                    textShadow: [
                      "0 0 8px rgba(124, 58, 237, 0.2)",
                      "0 0 20px rgba(124, 58, 237, 0.6)",
                      "0 0 8px rgba(124, 58, 237, 0.2)"
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >2.0</motion.span>
              </motion.span>
            </motion.div>
            
            <motion.p 
              className="text-gray-400 mb-6"
              variants={itemAnimation}
            >
              Empowering Coders, Enabling Futures. We bridge the gap between learning and industry success.
            </motion.p>
            
            <motion.div 
              className="flex space-x-4"
              variants={containerAnimation}
            >
              <SocialIcon icon={<Facebook size={18} />} />
              <SocialIcon icon={<Twitter size={18} />} />
              <SocialIcon icon={<Instagram size={18} />} />
              <SocialIcon icon={<Linkedin size={18} />} />
            </motion.div>
          </motion.div>
          
          <motion.div variants={itemAnimation}>
            <motion.h3 
              className="text-lg font-bold mb-6 relative inline-block"
              whileHover={{
                textShadow: "0 0 8px rgba(124, 58, 237, 0.6)"
              }}
            >
              Quick Links
              <motion.span 
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-400"
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </motion.h3>
            <motion.ul 
              className="space-y-3"
              variants={containerAnimation}
            >
              <FooterLink href="#home">Home</FooterLink>
              <FooterLink href="#programs">Programs</FooterLink>
              <FooterLink href="#about">About Us</FooterLink>
              <FooterLink href="#services">Services</FooterLink>
              <FooterLink href="#contact">Contact</FooterLink>
            </motion.ul>
          </motion.div>
          
          <motion.div variants={itemAnimation}>
            <motion.h3 
              className="text-lg font-bold mb-6 relative inline-block"
              whileHover={{
                textShadow: "0 0 8px rgba(124, 58, 237, 0.6)"
              }}
            >
              Programs
              <motion.span 
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-400"
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 0.8, delay: 0.7 }}
              />
            </motion.h3>
            <motion.ul 
              className="space-y-3"
              variants={containerAnimation}
            >
              <FooterLink href="#undergraduate">Undergraduate Program</FooterLink>
              <FooterLink href="#career">Career Transition</FooterLink>
              <FooterLink href="#internship">Paid Internships</FooterLink>
              <FooterLink href="#placement">Placement Assistance</FooterLink>
              <FooterLink href="#mentorship">Mentorship</FooterLink>
            </motion.ul>
          </motion.div>
          
          <motion.div variants={itemAnimation}>
            <motion.h3 
              className="text-lg font-bold mb-6 relative inline-block"
              whileHover={{
                textShadow: "0 0 8px rgba(124, 58, 237, 0.6)"
              }}
            >
              Contact Us
              <motion.span 
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-400"
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 0.8, delay: 0.9 }}
              />
            </motion.h3>
            <motion.ul 
              className="space-y-4"
              variants={containerAnimation}
            >
              <motion.li 
                className="flex items-start"
                variants={itemAnimation}
                whileHover={{
                  x: 3,
                  transition: { type: "spring", stiffness: 300 }
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 15 }}
                  className="mr-3 mt-0.5"
                >
                  <Mail className="h-5 w-5 text-primary-400" />
                </motion.div>
                <motion.span 
                  className="text-gray-400"
                  whileHover={{ color: "#A78BFA" }}
                >
                  spectov.pvt.ltd@gmail.com 
                </motion.span>
              </motion.li>
              
              <motion.li 
                className="flex items-start"
                variants={itemAnimation}
                whileHover={{
                  x: 3,
                  transition: { type: "spring", stiffness: 300 }
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 15 }}
                  className="mr-3 mt-0.5"
                  animate={{
                    rotate: [0, 5, 0, -5, 0]
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: 3,
                    repeatType: "reverse",
                    repeatDelay: 3
                  }}
                >
                  <Phone className="h-5 w-5 text-primary-400" />
                </motion.div>
                <motion.span 
                  className="text-gray-400"
                  whileHover={{ color: "#A78BFA" }}
                >
                  +91 70428 60263
                </motion.span>
              </motion.li>
              
              <motion.li 
                className="flex items-start"
                variants={itemAnimation}
                whileHover={{
                  x: 3,
                  transition: { type: "spring", stiffness: 300 }
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 15 }}
                  className="mr-3 mt-0.5"
                  animate={{
                    y: [0, -3, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatType: "reverse",
                    repeatDelay: 2
                  }}
                >
                  <MapPin className="h-5 w-5 text-primary-400" />
                </motion.div>
                <motion.span 
                  className="text-gray-400"
                  whileHover={{ color: "#A78BFA" }}
                >
                  SpectoV Headquarters, Ghaziabad Loni UP, Chennai, India
                </motion.span>
              </motion.li>
            </motion.ul>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="border-t border-dark-400 pt-8 mt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.p 
              className="text-gray-500 text-sm mb-4 md:mb-0"
              whileHover={{ color: "#A78BFA" }}
            >
              &copy; {new Date().getFullYear()} SpectoV Pvt Ltd. All rights reserved.
            </motion.p>
            <motion.div 
              className="flex space-x-6"
              variants={containerAnimation}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.a 
                href="#" 
                className="text-gray-500 hover:text-gray-400 text-sm relative group"
                variants={itemAnimation}
                whileHover={{ color: "#A78BFA" }}
              >
                Privacy Policy
                <motion.span 
                  className="absolute -bottom-1 left-0 h-0.5 bg-primary-400"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
              <motion.a 
                href="#" 
                className="text-gray-500 hover:text-gray-400 text-sm relative group"
                variants={itemAnimation}
                whileHover={{ color: "#A78BFA" }}
              >
                Terms of Service
                <motion.span 
                  className="absolute -bottom-1 left-0 h-0.5 bg-primary-400"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
              <motion.a 
                href="#" 
                className="text-gray-500 hover:text-gray-400 text-sm relative group"
                variants={itemAnimation}
                whileHover={{ color: "#A78BFA" }}
              >
                Cookie Policy
                <motion.span 
                  className="absolute -bottom-1 left-0 h-0.5 bg-primary-400"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      {/* Floating particles effect */}
      <motion.div 
        className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-primary-600/10 z-2"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.1, 0.3],
          y: [0, -30, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      
      <motion.div 
        className="absolute top-20 left-10 w-24 h-24 rounded-full bg-primary-600/10 z-2"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.1, 0.2],
          x: [0, 20, 0]
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
    </footer>
  );
};

export default Footer;