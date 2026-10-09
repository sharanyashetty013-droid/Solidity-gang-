import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Hero3DSceneProps {
  className?: string;
}

export const Hero3DScene: React.FC<Hero3DSceneProps> = React.memo(({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    // Respect reduced motion
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setIsMobile(true);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      if (!window.WebGLRenderingContext || (!testCanvas.getContext('webgl') && !testCanvas.getContext('experimental-webgl'))) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    // Three.js Scene Setup
    container.innerHTML = '';
    const scene = new THREE.Scene();
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 460;
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);

    // Frame the pink house, yellow sphere and purple ring nicely in center
    const initialZ = width < 640 ? 10.6 : width < 1024 ? 9.4 : 8.6;
    camera.position.set(0, 0, initialZ);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // Root Group for 3D elements (scaled up for bigger presence)
    const sceneGroup = new THREE.Group();
    sceneGroup.scale.set(1.42, 1.42, 1.42);
    scene.add(sceneGroup);

    // 1. Sleek Architectural Obsidian & Emerald Cryptographic House
    const houseShape = new THREE.Shape();
    const roofY = 2.4;
    const wallTopY = 0.6;
    const wallBottomY = -1.8;
    const halfW = 1.9;

    houseShape.moveTo(0, roofY);
    houseShape.lineTo(-halfW, wallTopY);
    houseShape.lineTo(-halfW, wallBottomY);
    houseShape.lineTo(halfW, wallBottomY);
    houseShape.lineTo(halfW, wallTopY);
    houseShape.closePath();

    // Keyhole cutout
    const keyholeHole = new THREE.Path();
    const holeCenterY = -0.15;
    const circleRadius = 0.55;
    keyholeHole.absarc(0, holeCenterY + 0.35, circleRadius, 0, Math.PI * 2, true);
    houseShape.holes.push(keyholeHole);

    const slotHole = new THREE.Path();
    slotHole.moveTo(-0.25, holeCenterY + 0.3);
    slotHole.lineTo(0.25, holeCenterY + 0.3);
    slotHole.lineTo(0.42, holeCenterY - 0.9);
    slotHole.lineTo(-0.42, holeCenterY - 0.9);
    slotHole.closePath();
    houseShape.holes.push(slotHole);

    const extrudeSettings = {
      steps: 2,
      depth: 0.95,
      bevelEnabled: true,
      bevelThickness: 0.24,
      bevelSize: 0.2,
      bevelOffset: 0,
      bevelSegments: 5,
    };

    const houseGeometry = new THREE.ExtrudeGeometry(houseShape, extrudeSettings);
    houseGeometry.center();

    // High-tech dark obsidian crystal material with deep emerald inner luminescence
    const houseMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0F172A,
      emissive: 0x064E3B,
      emissiveIntensity: 0.5,
      metalness: 0.2,
      roughness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      transmission: 0.32,
      thickness: 1.3,
      ior: 1.54,
      reflectivity: 0.95,
    });

    const houseMesh = new THREE.Mesh(houseGeometry, houseMaterial);
    houseMesh.castShadow = true;
    houseMesh.receiveShadow = true;

    const houseGroup = new THREE.Group();
    houseGroup.add(houseMesh);
    sceneGroup.add(houseGroup);

    // 2. High-Tech Floating Spheres & Titanium Cryptographic Ring
    const orbGroup = new THREE.Group();
    sceneGroup.add(orbGroup);

    const orbs: Array<{ mesh: THREE.Mesh; speedX: number; speedY: number; baseX: number; baseY: number; baseZ: number }> = [];

    // Precision Emerald Glass Orb (#10B981)
    const emeraldMat = new THREE.MeshPhysicalMaterial({
      color: 0x10B981,
      roughness: 0.12,
      clearcoat: 1.0,
      transmission: 0.65,
      ior: 1.38,
      emissive: 0x065F46,
      emissiveIntensity: 0.25,
    });
    const emeraldOrb = new THREE.Mesh(new THREE.SphereGeometry(0.85, 32, 32), emeraldMat);
    emeraldOrb.position.set(-3.8, 2.2, -2.5);
    orbGroup.add(emeraldOrb);
    orbs.push({ mesh: emeraldOrb, speedX: 0.7, speedY: 0.9, baseX: -3.8, baseY: 2.2, baseZ: -2.5 });

    // Frosted Smoked Titanium Glass Orb
    const smokedMat = new THREE.MeshPhysicalMaterial({
      color: 0x334155,
      roughness: 0.18,
      clearcoat: 1.0,
      transmission: 0.55,
      ior: 1.45,
    });
    const smokedOrb = new THREE.Mesh(new THREE.SphereGeometry(1.2, 32, 32), smokedMat);
    smokedOrb.position.set(4.2, -1.8, -3.2);
    orbGroup.add(smokedOrb);
    orbs.push({ mesh: smokedOrb, speedX: 0.5, speedY: 0.6, baseX: 4.2, baseY: -1.8, baseZ: -3.2 });

    // Glowing Mint Satellite Orb (#34D399)
    const mintOrb = new THREE.Mesh(new THREE.SphereGeometry(0.48, 32, 32), emeraldMat);
    mintOrb.position.set(-2.6, -2.2, -1.0);
    orbGroup.add(mintOrb);
    orbs.push({ mesh: mintOrb, speedX: 1.1, speedY: 0.8, baseX: -2.6, baseY: -2.2, baseZ: -1.0 });

    // Translucent Titanium Cryptographic Ring
    const ringMat = new THREE.MeshPhysicalMaterial({
      color: 0x94A3B8,
      metalness: 0.65,
      roughness: 0.2,
      clearcoat: 0.9,
      transmission: 0.35,
      transparent: true,
      opacity: 0.85,
    });
    const ringMesh = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.12, 16, 64), ringMat);
    ringMesh.position.set(3.4, 2.0, -2.0);
    ringMesh.rotation.x = Math.PI / 3;
    orbGroup.add(ringMesh);

    // Studio Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(5, 7, 7);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x10B981, 2.4);
    rimLight.position.set(-6, -3, -4);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0x94A3B8, 1.2);
    fillLight.position.set(0, -6, 5);
    scene.add(fillLight);

    // Mouse Tracking for subtle parallax tilt
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0.1;
    let targetRotY = -0.25;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      targetRotY = mouseX * 0.75;
      targetRotX = -mouseY * 0.5 + 0.1;
    };
    window.addEventListener('mousemove', onMouseMove);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 460;
      camera.aspect = w / h;
      camera.position.z = w < 640 ? 10.6 : w < 1024 ? 9.4 : 8.6;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Intersection Observer to pause Three.js render loop when off-screen
    let isVisible = true;
    const observer = new IntersectionObserver(([entry]) => {
      const wasVisible = isVisible;
      isVisible = entry.isIntersecting;
      if (!wasVisible && isVisible) {
        animate();
      }
    });
    observer.observe(container);

    // 60FPS Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      if (!isVisible) return;
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // House gentle floating & rotating
      const floatY = Math.sin(elapsedTime * 1.4) * 0.18;
      const slowSpin = Math.sin(elapsedTime * 0.6) * 0.12;

      // Smooth lerp to mouse tilt
      houseGroup.rotation.x += (targetRotX - houseGroup.rotation.x) * 0.05;
      houseGroup.rotation.y += (targetRotY + slowSpin - houseGroup.rotation.y) * 0.05;
      houseGroup.position.y = floatY;

      // Animate drifting orbs in parallax
      orbs.forEach((orb) => {
        orb.mesh.position.x = orb.baseX + Math.sin(elapsedTime * orb.speedX) * 0.35 + mouseX * 0.2;
        orb.mesh.position.y = orb.baseY + Math.cos(elapsedTime * orb.speedY) * 0.35 + mouseY * 0.2;
      });

      // Rotate torus ring slowly
      ringMesh.rotation.y += 0.008;
      ringMesh.rotation.z += 0.005;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      renderer.dispose();
      houseGeometry.dispose();
      houseMaterial.dispose();
      emeraldMat.dispose();
      smokedMat.dispose();
      ringMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isMobile]);

  // Mobile / Reduced Motion Lightweight Fallback
  if (isMobile || !hasWebGL) {
    return (
      <div className={`relative w-full h-full flex items-center justify-center pointer-events-none overflow-hidden ${className}`}>
        {/* Soft morphing gradient orbs with CSS parallax */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-emerald-500/20 via-slate-700/20 to-teal-500/20 blur-3xl opacity-75 animate-float-orb" />
        {/* Central Stylized Vector House Logo Silhouette */}
        <div className="absolute w-32 h-32 opacity-35 text-[#0F172A] animate-float-gentle">
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <path
              d="M24 6L7 19.5C6.37 20 6 20.76 6 21.57V39C6 40.66 7.34 42 9 42H39C40.66 42 42 40.66 42 39V21.57C42 20.76 41.63 20 41 19.5L24 6Z"
              stroke="currentColor"
              strokeWidth="2.5"
            />
            <circle cx="24" cy="23.5" r="3.5" fill="#10B981" />
            <path d="M22.5 25.5L21.5 32H26.5L25.5 25.5" fill="#10B981" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    />
  );
});

export default Hero3DScene;
