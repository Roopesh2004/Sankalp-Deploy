import React, { useState, useEffect, useRef } from "react";
import { CheckCircle, XCircle, Loader2, Shield } from "lucide-react";
import { motion } from 'framer-motion';
import * as THREE from 'three';

export default function CertificateVerifier() {
  const [formData, setFormData] = useState({
    holderName: "",
    domainName: "",
    issueDate: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState("");
  
  // Three.js setup (same as Hero component)
  const mountRef = useRef(null);
  const animationRef = useRef();
  const sceneRef = useRef();
  const rendererRef = useRef();
  const particlesRef = useRef();
  const [isMobile, setIsMobile] = useState(false);
  const [isLowPerfDevice, setIsLowPerfDevice] = useState(false);
  const [animationInitialized, setAnimationInitialized] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const verifyCertificate = async () => {
    setError("");
    setVerificationResult(null);
    if (
      !formData.holderName.trim() ||
      !formData.domainName.trim() ||
      !formData.issueDate.trim()
    ) {
      setError("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://sankalp-deploy-1.onrender.com/api/verify-certificate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();
      setVerificationResult(result.value === 1);
    } catch (err) {
      setError("Failed to verify certificate. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      holderName: "",
      domainName: "",
      issueDate: "",
    });
    setVerificationResult(null);
    setError("");
  };

  // Three.js scene initialization (same as Hero component)
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

  // Animation variants (same as Hero component)
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
    <div className="h-[100vh] flex justify-center items-center overflow-hidden relative bg-black">
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

      <div className="container mx-auto px-4 md:px-6 relative z-10 w-full max-w-md">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardAnimation}
          className="bg-black/80 backdrop-blur-lg border border-gray-800 p-8 rounded-2xl shadow-xl"
        >
          <motion.div 
            className="flex items-center justify-center mb-8"
            variants={titleAnimation}
          >
            <motion.div 
              className="bg-primary-900/30 p-3 rounded-full"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 20px rgba(124, 58, 237, 0.3)"
              }}
            >
              <Shield className="w-6 h-6 text-primary-300" />
            </motion.div>
            <motion.h2 
              className="ml-3 text-2xl font-bold text-white"
              whileHover={{
                scale: 1.02,
                textShadow: "0 0 8px rgba(124, 58, 237, 0.6)"
              }}
            >
              <span className="text-primary-400">Certificate <span className="text-white">Verification</span></span>
            </motion.h2>
          </motion.div>

          <motion.form
            onSubmit={e => { e.preventDefault(); verifyCertificate(); }}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {error && (
              <motion.div 
                className="mb-6 bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg"
                variants={subtitleAnimation}
              >
                {error}
              </motion.div>
            )}

            {verificationResult !== null && (
              <motion.div
                className={`mb-6 px-4 py-3 rounded-lg flex items-center gap-2 ${
                  verificationResult
                    ? "bg-green-900/20 border border-green-800 text-green-400"
                    : "bg-yellow-900/20 border border-yellow-800 text-yellow-400"
                }`}
                variants={subtitleAnimation}
              >
                {verificationResult ? (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    This certificate is genuine and valid.
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6" />
                    This certificate could not be verified or is invalid.
                  </>
                )}
                <motion.button
                  type="button"
                  onClick={resetForm}
                  className="ml-auto text-primary-400 hover:text-primary-300 transition-colors underline"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Verify Another
                </motion.button>
              </motion.div>
            )}

            <motion.div className="mb-5" variants={subtitleAnimation}>
              <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="holderName">
                Certificate Holder Name
              </label>
              <input
                className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 py-3 px-4 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                id="holderName"
                name="holderName"
                type="text"
                placeholder="Enter holder's name"
                value={formData.holderName}
                onChange={handleInputChange}
                required
              />
            </motion.div>

            <motion.div className="mb-5" variants={subtitleAnimation}>
              <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="domainName">
                Domain Name
              </label>
              <input
                className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 py-3 px-4 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                id="domainName"
                name="domainName"
                type="text"
                placeholder="Enter domain name"
                value={formData.domainName}
                onChange={handleInputChange}
                required
              />
            </motion.div>

            <motion.div className="mb-6" variants={subtitleAnimation}>
              <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="issueDate">
                Issue Date
              </label>
              <input
                className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 py-3 px-4 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                id="issueDate"
                name="issueDate"
                type="date"
                value={formData.issueDate}
                onChange={handleInputChange}
                required
              />
            </motion.div>

            <motion.div 
              className="flex items-center justify-center mt-8"
              variants={subtitleAnimation}
            >
              <motion.button
                className="bg-primary-600 text-white px-6 py-3 rounded-full font-medium flex items-center justify-center gap-2 relative overflow-hidden group"
                type="submit"
                disabled={isLoading}
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
                <span className="relative z-10">
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5 mr-2" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Certificate"
                  )}
                </span>
              </motion.button>
            </motion.div>
          </motion.form>
        </motion.div>
      </div>

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
}