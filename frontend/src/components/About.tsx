import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Code, Users, Globe } from 'lucide-react';
import {Link,useNavigate } from "react-router-dom"

const About = () => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [hovered, setHovered] = useState(null);


  const JoinTeam=()=>{

    const navigate = useNavigate();
    
      const handleApplyClick = () => {
        navigate('/getstarted');
        window.location.reload();
      };

    return(
      <motion.button
                className="relative bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium py-2.5 px-6 rounded-lg overflow-hidden group"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 20px rgba(124, 58, 237, 0.5)"
                }}
                whileTap={{ scale: 0.98 }}
                onClick={handleApplyClick}
                >
                <motion.span className="relative z-10">Join Our Team</motion.span>
                
                {/* Gradient shift on hover */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 z-0 opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Shine effect on hover */}
                <motion.div 
                  className="absolute inset-0 z-0 opacity-0 group-hover:opacity-50"
                  initial={{ x: "-100%", skew: -20 }}
                  whileHover={{ x: "100%" }}
                  transition={{ type: "tween", ease: "easeInOut", duration: 1 }}
                  style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)"
                  }}
                />
                </motion.button>
    )
  }
  
  // Handle video playback when component mounts
  useEffect(() => {
    const video = videoRef.current;
    
    if (video) {
      // Event listener for when the video is loaded
      const handleVideoLoaded = () => {
        setVideoLoaded(true);
        
        // Try to play the video once loaded
        video.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(error => {
            console.log("Autoplay prevented:", error);
            setIsPlaying(false);
          });
      };
      
      // Setup event listeners
      video.addEventListener('loadeddata', handleVideoLoaded);
      video.addEventListener('play', () => setIsPlaying(true));
      video.addEventListener('pause', () => setIsPlaying(false));
      
      // Cleanup event listeners on unmount
      return () => {
        video.removeEventListener('loadeddata', handleVideoLoaded);
        video.removeEventListener('play', () => setIsPlaying(true));
        video.removeEventListener('pause', () => setIsPlaying(false));
      };
    }
  }, []);
  
  // Handle play/pause toggle
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused) {
      video.play()
        .then(() => setIsPlaying(true))
        .catch(error => console.log("Play failed:", error));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };
  
  // Handle mute/unmute toggle
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  // Text animations
  const textAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay: delay
      }
    })
  };

  const imageAnimation = {
    hidden: { opacity: 0, scale: 0.9, rotateY: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 20
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: delay
      }
    })
  };

  const videoVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 20,
        delay: 0.8
      }
    }
  };

  const features = [
    { icon: <Zap />, text: "Industry-Aligned", delay: 0 },
    { icon: <Code />, text: "Hands-on Learning", delay: 0.15 },
    { icon: <Users />, text: "Collaborative Environment", delay: 0.3 },
    { icon: <Globe />, text: "Global Opportunities", delay: 0.45 }
  ];

  return (
    <section id="about" className="relative w-full pt-16 pb-20 bg-black min-h-screen flex flex-col justify-center">
      {/* Background gradient overlays */}
      <motion.div 
        className="fixed top-0 left-0 w-1/2 h-1/3 bg-gradient-to-br from-purple-900/20 to-transparent blur-3xl z-0"
        animate={{
          x: [0, 20, 0],
          y: [0, 10, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div 
        className="fixed bottom-0 right-0 w-1/2 h-1/3 bg-gradient-to-tl from-pink-900/20 to-transparent blur-3xl z-0"
        animate={{
          x: [0, -20, 0],
          y: [0, -10, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Main content container */}
      <div className="container mx-auto px-4 md:px-6 max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image Section */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={imageAnimation}
            className="relative"
          >
            {/* Team Image - Multiple sources for reliability */}
            <motion.div className="relative overflow-hidden rounded-2xl shadow-xl">
              {/* Try loading from public root */}
              <motion.img 
              src="/pic.jpg"
              alt="Team collaboration"
              className="w-full h-auto object-cover transition-all duration-500 ease-out"
              onError={e => {
                // fallback to local src if public fails
                const target = e.target as HTMLImageElement;
                if (target.src !== window.location.origin + "/src/public/pic.jpg") {
                target.src = "/src/public/pic.jpg";
                }
              }}
              whileHover={{ 
                scale: 1.08,
                transition: { duration: 0.4 }
              }}
              animate={{
                filter: [
                'brightness(1) contrast(1)',
                'brightness(1.1) contrast(1.05)',
                'brightness(1) contrast(1)'
                ]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              />
              {/* Fallback image (relative path) */}
              <img 
              src="./pic.jpg"
              alt="Team collaboration fallback"
              className="hidden"
              onLoad={e => {
                // If the main image fails, show this one
                const mainImg = (e.target as HTMLImageElement).parentElement?.querySelector('img:not(.hidden)');
                if (mainImg && !(mainImg as HTMLImageElement).complete) {
                mainImg.classList.add('hidden');
                (e.target as HTMLImageElement).classList.remove('hidden');
                }
              }}
              />
              {/* Animated texture overlay */}
              <motion.div 
              className="absolute inset-0 bg-gradient-to-tr from-purple-900/30 to-pink-900/10 mix-blend-multiply"
              animate={{
                background: [
                'linear-gradient(to top right, rgba(124, 58, 237, 0.3), rgba(236, 72, 153, 0.1))',
                'linear-gradient(to bottom right, rgba(124, 58, 237, 0.2), rgba(59, 130, 246, 0.15))',
                'linear-gradient(to top right, rgba(124, 58, 237, 0.3), rgba(236, 72, 153, 0.1))'
                ]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              />
            </motion.div>
            
            {/* Floating decorative elements */}
            <motion.div 
              className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
            >
              <motion.div 
                className="absolute -top-10 -left-10 w-64 h-64 bg-purple-900/20 rounded-full filter blur-3xl opacity-20"
                animate={{
                  scale: [1, 1.3, 1],
                  x: [0, 20, 0],
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div 
                className="absolute -bottom-10 -right-10 w-64 h-64 bg-pink-900/20 rounded-full filter blur-3xl opacity-20"
                animate={{
                  scale: [1, 1.2, 1],
                  x: [0, -15, 0],
                  y: [0, 15, 0],
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              />
            </motion.div>
          </motion.div>

          {/* Content Section */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              },
              hidden: { opacity: 0 }
            }}
          >
            <motion.div 
              className="inline-block bg-purple-900/30 text-purple-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm"
              variants={textAnimation}
              custom={0.1}
              whileHover={{ 
                scale: 1.05,
                backgroundColor: "rgba(124, 58, 237, 0.4)"
              }}
            >
              Who We Are
            </motion.div>
            
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-white mb-6 font-display"
              variants={textAnimation}
              custom={0.2}
              whileHover={{
                scale: 1.02,
                textShadow: "0 0 8px rgba(124, 58, 237, 0.6)"
              }}
            >
              <motion.span className="inline-block">Empowering Coders, </motion.span>
              <motion.span 
                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
                animate={{
                  backgroundPosition: ['0% center', '100% center', '0% center'],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Enabling Dreams
              </motion.span>
            </motion.h2>
            
            <motion.p 
              className="text-lg text-gray-300 mb-6"
              variants={textAnimation}
              custom={0.3}
            >
              SpectoV is dedicated to establishing an atmosphere that encourages innovation, learning, and advancement. Our training programs are aimed at closing the gap between what is learned in school and what the industry needs.
            </motion.p>
            
            <motion.p 
              className="text-lg text-gray-300 mb-8"
              variants={textAnimation}
              custom={0.4}
            >
              We provide our interns with the capabilities to take on real-world challenges and be successful in tech careers. Our focus is on practical knowledge, exposure to the industry, and career development.
            </motion.p>
            
            {/* Feature cards */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.15,
                    delayChildren: 0.5
                  }
                }
              }}
            >
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg transition-all duration-300"
                  variants={cardVariants}
                  custom={feature.delay}
                  whileHover={{ 
                    scale: 1.05,
                    backgroundColor: "rgba(124, 58, 237, 0.15)"
                  }}
                  onHoverStart={() => setHovered(index)}
                  onHoverEnd={() => setHovered(null)}
                >
                  <motion.div 
                    className="bg-purple-900/30 p-2 rounded-full backdrop-blur-sm relative"
                    animate={hovered === index ? {
                      scale: [1, 1.2, 1.1],
                      backgroundColor: "rgba(124, 58, 237, 0.5)",
                    } : {}}
                    transition={{
                      duration: 0.3
                    }}
                  >
                    <motion.div
                      className="h-5 w-5 text-purple-400"
                      animate={hovered === index ? {
                        rotate: [0, 10, -10, 0],
                        color: "#f3f4f6" // text-gray-100
                      } : {}}
                      transition={{
                        duration: 0.5,
                        ease: "easeInOut"
                      }}
                    >
                      {feature.icon}
                    </motion.div>
                  </motion.div>
                  
                  <motion.span 
                    className="font-medium text-white"
                    animate={hovered === index ? {
                      color: "#c4b5fd" // text-purple-300
                    } : {}}
                  >
                    {feature.text}
                  </motion.span>
                </motion.div>
              ))}
            </motion.div>
            
            {/* Animated CTA button */}
            <motion.div
              variants={textAnimation}
              custom={0.7}
            >
                <JoinTeam/>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Video Section - With improved reliability */}
        <motion.div 
          className="mt-24 mb-12 relative w-full"
          initial="hidden"
          animate="visible"
          variants={videoVariants}
        >
          <div className="text-center mb-8">
            <motion.h3 
              className="text-2xl md:text-3xl font-bold text-white mb-4 font-display"
              whileHover={{
                scale: 1.02,
                textShadow: "0 0 8px rgba(124, 58, 237, 0.6)"
              }}
            >
              <motion.span 
                className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
                animate={{
                  backgroundPosition: ['0% center', '100% center', '0% center'],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Our Vision in Action
              </motion.span>
            </motion.h3>
            <motion.p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Experience the innovation and collaboration that drives our team's success
            </motion.p>
          </div>
          
          {/* Video Container with Reliable Playback */}
          <motion.div 
            className="relative w-full max-w-5xl mx-auto overflow-hidden rounded-xl shadow-2xl"
            whileHover={{
              boxShadow: "0 0 30px rgba(124, 58, 237, 0.3)"
            }}
          >
            {/* Purple glow effects */}
            <motion.div 
              className="absolute -inset-1 bg-gradient-to-r from-purple-700 to-pink-700 rounded-xl blur-lg opacity-30 -z-10"
              animate={{
                opacity: [0.2, 0.4, 0.2],
                scale: [0.98, 1.01, 0.98],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Responsive Video */}
            <div className="aspect-w-16 aspect-h-9 relative overflow-hidden rounded-xl">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                loop
                muted={isMuted}
                preload="auto"
                poster="/api/placeholder/800/450"
              >
                {/* Multiple source paths for better compatibility */}
                <source src="/vidsank.mp4" type="video/mp4" />
                <source src="/src/public/vidsank.mp4" type="video/mp4" />
                <source src="./vidsank.mp4" type="video/mp4" />
                <source src="../public/vidsank.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* Loading state */}
              {!videoLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-lg font-medium">Loading video...</p>
                </div>
              )}
              
              {/* Gradient overlay on the video */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"
                animate={{
                  opacity: [0.3, 0.4, 0.3],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            
            {/* Video controls - simplified for reliability */}
            <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-t from-black/80 to-transparent">
              <motion.button
                className="bg-purple-500/80 hover:bg-purple-500 text-white p-2 rounded-full backdrop-blur-sm"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlayPause}
              >
                {isPlaying ? (
                  // Pause icon
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  // Play icon
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </motion.button>
              
              <motion.button
                className="bg-purple-500/80 hover:bg-purple-500 text-white p-2 rounded-full backdrop-blur-sm"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleMute}
              >
                {isMuted ? (
                  // Muted icon
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                ) : (
                  // Unmuted icon
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </motion.button>
            </div>
          </motion.div>
          
          {/* Caption or description */}
          <motion.p 
            className="text-center text-gray-400 mt-4 text-sm italic max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            {videoLoaded ? 
              "Our team working on innovative tech solutions that make a difference" : 
              "Video loading... If issues persist, check file paths in your project structure"
            }
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default About;