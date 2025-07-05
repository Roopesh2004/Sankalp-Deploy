import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Mail, Phone, MapPin } from "lucide-react";
import * as THREE from "three";

const Contact = () => {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  // Add these state variables at the component level
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const mountRef = useRef(null);
  const animationRef = useRef();
  const particlesMeshRef = useRef();

  // Background animation setup - similar to Hero section
  useEffect(() => {
    // Set up scene
    const scene = new THREE.Scene();

    // Set up camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Set up renderer with optimization options
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for better performance

    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    // Create particles with optimized count
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = window.innerWidth < 768 ? 2500 : 5000; // Reduce count on mobile

    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3)
    );

    // Create material for particles
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.03,
      color: 0x7c3aed,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });

    // Create particle system
    const particlesMesh = new THREE.Points(
      particlesGeometry,
      particlesMaterial
    );
    scene.add(particlesMesh);
    particlesMeshRef.current = particlesMesh;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x7c3aed, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x7c3aed, 0.8);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);

    // Handle resize with throttling
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }, 200);
    };

    window.addEventListener("resize", handleResize);

    // Mouse movement effect
    let mouseX = 0;
    let mouseY = 0;
    const mouseMoveHandler = (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", mouseMoveHandler);

    // Animation loop with performance optimization
    let lastTime = 0;
    const FPS = 60;
    const frameTime = 1000 / FPS;

    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTime;

      if (deltaTime > frameTime) {
        lastTime = currentTime;

        if (particlesMeshRef.current) {
          particlesMeshRef.current.rotation.x += 0.0005;
          particlesMeshRef.current.rotation.y += 0.0005;
          particlesMeshRef.current.position.x +=
            (mouseX * 0.3 - particlesMeshRef.current.position.x) * 0.05;
          particlesMeshRef.current.position.y +=
            (mouseY * 0.3 - particlesMeshRef.current.position.y) * 0.05;
        }

        renderer.render(scene, camera);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate(0);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", mouseMoveHandler);

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }

      scene.remove(particlesMesh);
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  // Form handlers
  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const response = await fetch(
        "https://sankalp-deploy-1.onrender.com/api/contact",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formState),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send message");
      }

      setSubmitSuccess(
        "Message sent successfully! We will get back to you soon."
      );

      // Reset form
      setFormState({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to send message"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  // Animation variants
  const containerVariant = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariant = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 20 },
    },
  };

  const pulseAnimation = {
    animate: {
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const floatAnimation = {
    animate: {
      y: [0, -10, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <section id="contact" className="py-20 bg-black relative overflow-hidden">
      {/* 3D Background container */}
      <div
        ref={mountRef}
        className="absolute inset-0 z-0"
        style={{ pointerEvents: "none" }}
      />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-block bg-primary-900/30 text-primary-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 20px rgba(124, 58, 237, 0.3)",
            }}
            {...pulseAnimation}
          >
            Connect With Us
          </motion.div>
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-white mb-4 font-display"
            {...floatAnimation}
          >
            Get in Touch
          </motion.h2>
          <motion.div
            className="h-1 w-20 bg-primary-400 mx-auto rounded-full mb-6"
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            variants={containerVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.p
              className="text-lg text-gray-300 mb-8"
              variants={itemVariant}
            >
              Have questions about our training program? We're here to help you
              take the next step in your career journey.
            </motion.p>

            <div className="space-y-6">
              <motion.div
                className="flex items-start space-x-4 bg-dark-300/50 p-4 rounded-lg border border-dark-400 hover:border-primary-400 transition-colors"
                variants={itemVariant}
                whileHover={{
                  x: 10,
                  boxShadow: "0 0 20px rgba(124, 58, 237, 0.2)",
                  scale: 1.02,
                }}
              >
                <motion.div
                  className="bg-primary-900/30 p-3 rounded-lg"
                  whileHover={{ rotate: 10 }}
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Mail className="h-6 w-6 text-primary-400" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Email Us</h3>
                  <motion.p
                    className="text-gray-300"
                    whileHover={{ color: "#a78bfa" }}
                  >
                    spectov.pvt.ltd@gmail.com
                  </motion.p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start space-x-4 bg-dark-300/50 p-4 rounded-lg border border-dark-400 hover:border-primary-400 transition-colors"
                variants={itemVariant}
                whileHover={{
                  x: 10,
                  boxShadow: "0 0 20px rgba(124, 58, 237, 0.2)",
                  scale: 1.02,
                }}
              >
                <motion.div
                  className="bg-primary-900/30 p-3 rounded-lg"
                  whileHover={{ rotate: -10 }}
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, -5, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                >
                  <Phone className="h-6 w-6 text-primary-400" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Call Us</h3>
                  <motion.p
                    className="text-gray-300"
                    whileHover={{ color: "#a78bfa" }}
                  >
                    +91 70428 60263
                  </motion.p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start space-x-4 bg-dark-300/50 p-4 rounded-lg border border-dark-400 hover:border-primary-400 transition-colors"
                variants={itemVariant}
                whileHover={{
                  x: 10,
                  boxShadow: "0 0 20px rgba(124, 58, 237, 0.2)",
                  scale: 1.02,
                }}
              >
                <motion.div
                  className="bg-primary-900/30 p-3 rounded-lg"
                  whileHover={{ rotate: 10 }}
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                >
                  <MapPin className="h-6 w-6 text-primary-400" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Visit Us</h3>
                  <motion.p
                    className="text-gray-300"
                    whileHover={{ color: "#a78bfa" }}
                  >
                    SpectoV Headquarters, Ghaziabad Loni UP, India
                  </motion.p>
                </div>
              </motion.div>
            </div>

            <motion.div
              className="mt-8 p-6 bg-dark-300/50 border border-dark-400 rounded-xl"
              variants={itemVariant}
              whileHover={{
                boxShadow: "0 0 30px rgba(124, 58, 237, 0.2)",
              }}
            >
              <motion.h3
                className="text-xl font-bold text-white mb-3"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                Why Connect With Us?
              </motion.h3>
              <motion.ul className="space-y-2 text-gray-300">
                {[
                  "Get detailed program information",
                  "Schedule a free consultation",
                  "Learn about payment options",
                  "Discuss career opportunities",
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <motion.span
                      className="h-2 w-2 bg-primary-400 rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.2,
                      }}
                    />
                    {item}
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.form
              onSubmit={handleSubmit}
              className="bg-dark-300/80 p-8 rounded-xl border border-dark-400 backdrop-blur-sm relative overflow-hidden"
              whileHover={{ boxShadow: "0 0 40px rgba(124, 58, 237, 0.15)" }}
            >
              {/* Animated gradients */}
              <motion.div
                className="absolute -top-40 -right-40 w-80 h-80 bg-primary-600/10 rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-400/10 rounded-full blur-3xl"
                animate={{
                  scale: [1.2, 1, 1.2],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 4,
                }}
              />

              <div className="space-y-6 relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-dark-400 border border-dark-500 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white transition-all"
                    required
                  />
                  <motion.div
                    className="h-0.5 w-0 bg-primary-400"
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formState.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-dark-400 border border-dark-500 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white transition-all"
                    required
                  />
                  <motion.div
                    className="h-0.5 w-0 bg-primary-400"
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formState.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-dark-400 border border-dark-500 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white transition-all"
                    required
                  />
                  <motion.div
                    className="h-0.5 w-0 bg-primary-400"
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formState.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-dark-400 border border-dark-500 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white transition-all"
                    required
                  ></textarea>
                  <motion.div
                    className="h-0.5 w-0 bg-primary-400"
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>

                {submitSuccess && (
                  <motion.div
                    className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg mb-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {submitSuccess}
                  </motion.div>
                )}

                {submitError && (
                  <motion.div
                    className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {submitError}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors relative overflow-hidden group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0 0 30px rgba(124, 58, 237, 0.5)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  disabled={isSubmitting}
                >
                  <motion.span
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.5 }}
                  />
                  {isSubmitting ? "Sending..." : "Send Message"}
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Send className="h-5 w-5" />
                  </motion.div>
                </motion.button>
              </div>
            </motion.form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
