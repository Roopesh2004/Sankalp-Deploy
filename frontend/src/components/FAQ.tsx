import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Sparkles, Star } from 'lucide-react';
import * as THREE from 'three';

const faqs = [
  {
    question: "What is the duration of the training program?",
    answer: "Our training program typically runs for 12 weeks, with flexible timing options available for working professionals."
  },
  {
    question: "Is there a guaranteed placement after completion?",
    answer: "Yes, we offer 100% placement assistance and guarantee job opportunities with our partner companies upon successful completion of the program."
  },
  {
    question: "What is the eligibility criteria?",
    answer: "The program is open to both students and working professionals. Basic programming knowledge and a strong willingness to learn are the main requirements."
  },
  {
    question: "How much is the program fee?",
    answer: "Program fees vary based on the course selected. We offer flexible payment options and EMI facilities. Contact our counselors for detailed information."
  },
  {
    question: "Do you provide internship opportunities?",
    answer: "Yes, we provide paid internship opportunities with a stipend of up to ₹10,000 during the training period."
  }
];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const particlesRef = useRef<THREE.Points>();
  const animationRef = useRef<number>();
  const frameId = useRef<number>();

  // Memoize animation variants
  const animations = useMemo(() => ({
    headerAnimation: {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 100, damping: 20 }
      }
    },
    titleAnimation: {
      hidden: { opacity: 0, scale: 0.95 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }
      }
    },
    letterAnimation: {
      hidden: { y: 50, opacity: 0 },
      visible: (i: number) => ({
        y: 0,
        opacity: 1,
        transition: { delay: i * 0.05, duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }
      })
    },
    faqItemAnimation: {
      hidden: { opacity: 0, scale: 0.95, y: 20 },
      visible: (index: number) => ({
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: "spring", stiffness: 100, damping: 20, delay: index * 0.1 }
      })
    },
    glowAnimation: {
      initial: { boxShadow: "0 0 0 rgba(124, 58, 237, 0)" },
      hover: { boxShadow: "0 0 20px rgba(124, 58, 237, 0.3)", transition: { duration: 0.3 } }
    },
    sparkleAnimation: {
      initial: { opacity: 0, scale: 0 },
      animate: { opacity: [0, 1, 0], scale: [0, 1, 0], transition: { duration: 1.5, repeat: Infinity, repeatType: "loop" } }
    },
    wordAnimation: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] } }
    }
  }), []);

  const setupScene = useCallback(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
      precision: "mediump"
    });
    
    // Use full viewport width/height for the renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = Math.min(window.innerWidth < 768 ? 3000 : 5000, 7000); // Increased particle count
    const posArray = new Float32Array(particlesCount * 3);
    
    // Create a wider distribution of particles
    for (let i = 0; i < particlesCount * 3; i += 3) {
      // Wider spread on X and Y axes
      posArray[i] = (Math.random() - 0.5) * 25;     // X position
      posArray[i + 1] = (Math.random() - 0.5) * 25; // Y position
      posArray[i + 2] = (Math.random() - 0.5) * 15; // Z position
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setDrawRange(0, particlesCount);

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.04, // Slightly larger particles
      color: 0x7c3aed,
      transparent: true,
      opacity: 0.5, // Increased opacity
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    
    return { scene, camera, renderer, particlesGeometry, particlesMaterial, particles };
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;
    
    const { renderer, camera, scene, particles, particlesGeometry, particlesMaterial } = setupScene();
    sceneRef.current = scene;
    rendererRef.current = renderer;
    particlesRef.current = particles;

    // Clear any previous canvas
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    mountRef.current.appendChild(renderer.domElement);

    // Position the canvas to cover the entire section
    if (mountRef.current.firstChild) {
      const canvas = mountRef.current.firstChild as HTMLCanvasElement;
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.zIndex = '0';
      canvas.style.pointerEvents = 'none';
    }

    let lastTime = 0;
    const animate = (time: number) => {
      if (time - lastTime < 16) { // Cap at ~60fps
        frameId.current = requestAnimationFrame(animate);
        return;
      }
      
      lastTime = time;
      
      if (particles && renderer && scene) {
        particles.rotation.x += 0.0003;
        particles.rotation.y += 0.0003;
        
        // Make particles slowly move up and down
        particles.position.y = Math.sin(time * 0.0005) * 0.5;
        
        renderer.render(scene, camera);
      }
      
      frameId.current = requestAnimationFrame(animate);
    };

    animate(0);

    const handleResize = () => {
      if (!renderer || !camera) return;
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      
      renderer.setSize(width, height);
    };

    const debouncedResize = debounce(handleResize, 250);
    window.addEventListener('resize', debouncedResize);
    
    // Initial resize to ensure correct dimensions
    handleResize();

    return () => {
      window.removeEventListener('resize', debouncedResize);
      if (frameId.current) cancelAnimationFrame(frameId.current);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, [setupScene]);

  // Split text for character animation
  const SplitText = ({ text, animation }: { text: string, animation: any }) => {
    return (
      <span className="inline-block">
        {text.split('').map((char, index) => (
          <motion.span
            key={index}
            custom={index}
            variants={animation}
            initial="hidden"
            animate="visible"
            className="inline-block"
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </span>
    );
  };

  return (
    <section className="py-20 bg-black relative overflow-hidden min-h-screen">
      {/* 3D Background container - now fixed position to cover entire viewport */}
      <div ref={mountRef} className="fixed inset-0 z-0" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div 
            className="inline-block relative mb-4"
            variants={animations.titleAnimation}
          >
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-white font-display relative z-10"
              whileHover={{
                textShadow: "0 0 8px rgba(124, 58, 237, 0.6)",
                scale: 1.05,
                transition: { duration: 0.3 }
              }}
            >
              <SplitText text="Frequently Asked Questions" animation={animations.letterAnimation} />
            </motion.h2>
            
            {/* Animated decoration elements */}
            <motion.div 
              className="absolute -left-6 -top-6 text-purple-400"
              initial="initial"
              animate="animate"
              variants={animations.sparkleAnimation}
            >
              <Sparkles size={24} />
            </motion.div>
            
            <motion.div 
              className="absolute -right-6 -bottom-6 text-purple-400"
              initial="initial"
              animate="animate"
              variants={animations.sparkleAnimation}
              style={{ animationDelay: "0.5s" }}
            >
              <Star size={20} />
            </motion.div>
          </motion.div>
          
          <motion.p 
            className="text-lg text-gray-300 max-w-2xl mx-auto"
            variants={animations.headerAnimation}
            whileHover={{
              color: "#a78bfa",
              scale: 1.02,
              transition: { duration: 0.3 }
            }}
          >
            Find answers to common questions about our training program and career opportunities.
          </motion.p>
        </motion.div>

        <motion.div 
          className="max-w-4xl mx-auto flex flex-col justify-center items-center gap-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.1 }}
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={animations.faqItemAnimation}
              className="relative w-full"
              onHoverStart={() => setHoverIndex(index)}
              onHoverEnd={() => setHoverIndex(null)}
            >
              {/* Animated highlight effect when hovered */}
              <AnimatePresence>
                {hoverIndex === index && (
                  <motion.div 
                    className="absolute -inset-2 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-xl blur-xl"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </AnimatePresence>
              
              {/* Main FAQ item button */}
              <motion.button
                className={`text-left p-4 rounded-lg bg-transparent backdrop-blur-sm border border-dark-400 flex items-center justify-between relative z-10 w-full ${
                  activeIndex === index ? 'bg-dark-400/80' : 'hover:bg-dark-400/60'
                }`}
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                initial="initial"
                variants={animations.glowAnimation}
              >
                <motion.div 
                  className="text-base font-medium text-white flex items-center gap-2"
                  whileHover={{
                    color: "#a78bfa",
                    x: 5,
                    transition: { duration: 0.2 }
                  }}
                >
                  {/* Animated particles around the active question */}
                  {activeIndex === index && (
                    <motion.div
                      className="absolute left-0 text-purple-400"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: -20 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Sparkles size={18} />
                    </motion.div>
                  )}
                  <span>{faq.question}</span>
                </motion.div>
                
                {/* Animated icon */}
                <motion.div
                  initial={false}
                  animate={{ 
                    rotate: activeIndex === index ? 180 : 0,
                    scale: activeIndex === index ? 1.2 : 1,
                    color: activeIndex === index ? "#a78bfa" : "#7c3aed"
                  }}
                  transition={{ 
                    duration: 0.4,
                    type: "spring",
                    stiffness: 200
                  }}
                  className="ml-4 flex-shrink-0 bg-dark-400/50 p-1 rounded-full"
                >
                  {activeIndex === index ? (
                    <Minus className="h-5 w-5" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                </motion.div>
              </motion.button>

              {/* Animated answer panel */}
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ 
                      height: "auto", 
                      opacity: 1,
                      transition: {
                        height: {
                          duration: 0.4,
                          type: "spring",
                          stiffness: 100,
                          damping: 15
                        },
                        opacity: {
                          duration: 0.25,
                          delay: 0.15
                        }
                      }
                    }}
                    exit={{ 
                      height: 0, 
                      opacity: 0,
                      transition: {
                        height: {
                          duration: 0.3
                        },
                        opacity: {
                          duration: 0.25
                        }
                      }
                    }}
                    className="overflow-hidden"
                  >
                    <motion.div 
                      className="p-6 bg-dark-300/50 backdrop-blur-sm rounded-b-lg border-t border-dark-400 relative"
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        delay: 0.1
                      }}
                    >
                      {/* Animated words in the answer */}
                      <motion.p className="text-gray-300">
                        {faq.answer.split(' ').map((word, i) => (
                          <motion.span
                            key={i}
                            className="inline-block mr-1"
                            custom={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: 0.2 + (i * 0.01),
                              duration: 0.2
                            }}
                          >
                            {word}
                          </motion.span>
                        ))}
                      </motion.p>
                      
                      {/* Decorative element */}
                      <motion.div
                        className="absolute bottom-3 right-3"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ 
                          opacity: [0, 1, 0.5],
                          scale: [0, 1, 0.8],
                          rotate: [0, 45, 0]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                      >
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Interactive decorative elements */}
        <motion.div
          className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -10, 0],
            y: [0, -10, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute -top-24 -left-24 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 10, 0],
            y: [0, 10, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Floating particles */}
        {[...Array(8)].map((_, index) => (
          <motion.div
            key={index}
            className="absolute w-1 h-1 rounded-full bg-purple-400"
            style={{
              top: `${10 + Math.random() * 80}%`,
              left: `${10 + Math.random() * 80}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>
    </section>
  );
};

// Utility function for debouncing
function debounce(fn: Function, ms: number) {
  let timer: NodeJS.Timeout;
  return function(...args: any[]) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

export default FAQ;