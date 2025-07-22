import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Quote, Code, Zap, ChevronRight } from 'lucide-react';
import * as THREE from 'three';

const Founder = () => {
  const [ref, inView] = useInView({ triggerOnce: false, threshold: 0.1 });
  const mountRef = useRef(null);
  const animationRef = useRef();

  // 3D animated background
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    if (mountRef.current) mountRef.current.appendChild(renderer.domElement);

    // Particle systems for depth
    const makeParticles = (count, spread, size, color, opacity) => {
      const geometry = new THREE.BufferGeometry();
      const posArray = new Float32Array(count * 3);
      for (let i = 0; i < count * 3; i++) posArray[i] = (Math.random() - 0.5) * spread;
      geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      const material = new THREE.PointsMaterial({ size, color, transparent: true, opacity, blending: THREE.AdditiveBlending });
      return new THREE.Points(geometry, material);
    };
    const particles1 = makeParticles(2000, 20, 0.02, 0x7c3aed, 0.6);
    const particles2 = makeParticles(1000, 10, 0.04, 0x4f46e5, 0.8);
    scene.add(particles1, particles2);

    scene.add(new THREE.AmbientLight(0x6d28d9, 0.5));
    const pointLight = new THREE.PointLight(0x8b5cf6, 1);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();
      particles1.rotation.x += 0.0002; particles1.rotation.y += 0.0003;
      particles2.rotation.x += 0.0004; particles2.rotation.y += 0.0005;
      particles1.position.x = Math.sin(t * 0.2) * 0.5;
      particles1.position.y = Math.cos(t * 0.1) * 0.5;
      particles2.position.x = Math.sin(t * 0.3) * 0.3;
      particles2.position.y = Math.cos(t * 0.2) * 0.3;
      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) mountRef.current.removeChild(renderer.domElement);
      scene.remove(particles1, particles2);
      particles1.geometry.dispose(); particles2.geometry.dispose();
      particles1.material.dispose(); particles2.material.dispose();
    };
  }, []);

  // Animations
  const containerAnimation = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { delayChildren: 0.3, staggerChildren: 0.15 } }
  };
  const itemAnimation = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 12 } }
  };
  const glowAnimation = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: [0.5, 0.8, 0.5],
      scale: 1,
      transition: { opacity: { repeat: Infinity, duration: 3, repeatType: "reverse" }, scale: { duration: 0.8, type: "spring", stiffness: 200 } }
    }
  };
  const iconAnimation = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 260, damping: 20 } }
  };
  const imageContainerAnimation = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8, delay: 0.4 } }
  };

  const techIconsData = [
    { icon: <Code size={16} />, delay: 0 },
    { icon: <Zap size={16} />, delay: 0.1 }
  ];

  return (
    <section className="py-20 bg-black relative overflow-hidden" aria-label="Founder's Message">
      {/* 3D Background */}
      <div ref={mountRef} className="absolute inset-0 z-0" style={{ pointerEvents: 'none' }} />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerAnimation}
          className="bg-dark-300/60 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-dark-400"
        >
          {/* Decorative glowing elements */}
          <motion.div className="absolute -top-10 -left-10 w-48 h-48 bg-primary-500/20 rounded-full blur-3xl" variants={glowAnimation} />
          <motion.div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl" variants={glowAnimation} />
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <motion.div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center relative z-10">
              {/* Tech icons */}
              <div className="absolute top-12 right-12 flex space-x-2">
                {techIconsData.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 1 + item.delay, duration: 0.5 } }}
                    className="bg-dark-400/80 backdrop-blur-md h-8 w-8 rounded-full flex items-center justify-center text-primary-400"
                  >
                    {item.icon}
                  </motion.div>
                ))}
              </div>
              <motion.div className="mb-6 relative" variants={iconAnimation}>
                <motion.div className="absolute -inset-3 bg-primary-500/20 rounded-full blur-md"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                />
                <Quote className="h-12 w-12 text-primary-400 relative z-10" />
              </motion.div>
              <motion.h2 className="text-2xl md:text-3xl font-bold text-white mb-6 font-display" variants={itemAnimation}>
                <motion.span
                  initial={{ display: "inline-block" }}
                  animate={{ color: ["#ffffff", "#a78bfa", "#ffffff"] }}
                  transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
                >
                  Founder's Note
                </motion.span>
              </motion.h2>
              <motion.p className="text-gray-300 mb-6" variants={itemAnimation}>
                Sankalp Training Program provides you with industry-relevant skills and real-world experience. With focused curriculum, experienced mentors, and real-life projects, you'll be ready for the best roles at the world's top companies.
              </motion.p>
              <motion.p className="text-gray-300 mb-6" variants={itemAnimation}>             
                Personalized guidance, hands-on training, and placement support is guaranteed. Join Sankalp today, and transform your tech career to achieve professional aspirations. 
              </motion.p>
              <motion.div className="flex items-center relative" variants={itemAnimation} whileHover={{ scale: 1.03 }}>
                <motion.a target="_"   className="flex items-center" whileHover={{ scale: 1.02 }}>
                  <motion.div className="relative mr-4">
                  <motion.div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full blur opacity-70"
                    animate={{ rotate: [0, 360], scale: [0.9, 1.1, 0.9] }}
                    transition={{ rotate: { duration: 10, repeat: Infinity, ease: "linear" }, scale: { duration: 4, repeat: Infinity, repeatType: "reverse" } }}
                  />
                  <img
                    src="/imgf.jpg"
                    alt="Prakash Chand Jha"
                    className="h-14 w-14 rounded-full object-cover relative z-10 border-2 border-primary-500"
                  />
                  </motion.div>
                  <div>
                  <motion.p className="font-bold text-white" whileHover={{ color: "#a78bfa" }}>
                    Prakash Chand Jha
                  </motion.p>
                  <div className="flex items-center gap-1">
                    <p className="text-gray-400 text-sm">Founder & CEO, SpectoV</p>
                    <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}>
                    <ChevronRight size={14} className="text-primary-400" />
                    </motion.span>
                  </div>
                  </div>
                </motion.a>
              </motion.div>
            </motion.div>
            <motion.div className="relative h-64 lg:h-auto overflow-hidden" variants={imageContainerAnimation}>
              <motion.div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 via-transparent to-primary-800/80 z-10"
                animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
                transition={{ duration: 15, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
              />
              <motion.img
                src="/img2.jpg"
                alt="Sankalp Training Program Collaboration"
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.05, 1], filter: ["brightness(0.8)", "brightness(1)", "brightness(0.8)"] }}
                transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
              />
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <motion.div
                  className="text-center text-white p-6 backdrop-blur-md bg-dark-800/30 rounded-xl border border-dark-400/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(124, 58, 237, 0.4)" }}
                >
                  <motion.h3 className="text-2xl font-bold mb-2 font-display"
                    animate={{ textShadow: ["0px 0px 0px rgba(124, 58, 237, 0)", "0px 0px 10px rgba(124, 58, 237, 0.8)", "0px 0px 0px rgba(124, 58, 237, 0)"] }}
                    transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                  >
                    Join Sankalp
                  </motion.h3>
                  <p className="mb-6 max-w-md">Advance your career with proven training and placement support.</p>
                  <motion.button
                    className="bg-white text-primary-600 px-6 py-3 rounded-full font-medium transition-colors relative overflow-hidden group"
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(124, 58, 237, 0.6)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.span className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/30 to-indigo-500/0"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.5 }}
                    />
                    Apply Now
                    <motion.span className="inline-block ml-1" animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}>
                      <ChevronRight size={16} />
                    </motion.span>
                  </motion.button>
                </motion.div>
              </div>
              <motion.div className="absolute top-4 right-4 bg-dark-500/70 backdrop-blur-md px-3 py-1 rounded-full text-xs text-primary-300 border border-primary-500/30"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}>
                  <Zap size={12} className="inline mr-1" />
                </motion.span>
                100% Placement Rate
              </motion.div>
              <motion.div className="absolute bottom-4 left-4 bg-dark-500/70 backdrop-blur-md px-3 py-1 rounded-full text-xs text-primary-300 border border-primary-500/30"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
              >
                <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}>
                  <Code size={12} className="inline mr-1" />
                </motion.span>
                Industry-Focused Curriculum
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Founder;
