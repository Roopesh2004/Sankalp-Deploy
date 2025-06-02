import * as THREE from 'three';

export const createOptimizedParticles = (mountElement: HTMLDivElement) => {
  const isMobile = window.innerWidth < 768;
  const isLowEndDevice = navigator.hardwareConcurrency <= 4;
  
  // Significantly reduced particle count for mobile/low-end devices
  const particlesCount = isLowEndDevice ? 800 : (isMobile ? 1500 : 3000);
  
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    isMobile ? 85 : 75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = isMobile ? 6 : 5;

  const renderer = new THREE.WebGLRenderer({ 
    alpha: true,
    antialias: false, // Disable antialiasing on mobile
    powerPreference: isLowEndDevice ? "low-power" : "high-performance",
    precision: isLowEndDevice ? "lowp" : (isMobile ? "mediump" : "highp")
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  // Limit pixel ratio for better performance
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2));

  mountElement.appendChild(renderer.domElement);

  const particlesGeometry = new THREE.BufferGeometry();
  const posArray = new Float32Array(particlesCount * 3);

  for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * (isMobile ? 10 : 15);
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

  const particlesMaterial = new THREE.PointsMaterial({
    size: isMobile ? 0.05 : 0.03,
    color: 0x7c3aed,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending
  });

  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particlesMesh);

  // Frame rate control for smooth animation
  let lastTime = 0;
  const targetFPS = isLowEndDevice ? 30 : (isMobile ? 45 : 60);
  const frameInterval = 1000 / targetFPS;

  const animate = (currentTime: number) => {
    if (currentTime - lastTime < frameInterval) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }
    lastTime = currentTime;

    // Reduced rotation speed for mobile
    particlesMesh.rotation.x += isLowEndDevice ? 0.0001 : (isMobile ? 0.0002 : 0.0003);
    particlesMesh.rotation.y += isLowEndDevice ? 0.0001 : (isMobile ? 0.0002 : 0.0003);
    
    renderer.render(scene, camera);
    animationRef.current = requestAnimationFrame(animate);
  };

  return { scene, camera, renderer, particlesMesh };
};
