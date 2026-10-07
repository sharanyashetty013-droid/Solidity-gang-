import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeLogoProps {
  className?: string;
  scrollRotation?: number; // 0 to 360 deg in radians
  isUnlocked?: boolean;
}

export const ThreeLogo: React.FC<ThreeLogoProps> = ({
  className = '',
  scrollRotation = 0,
  isUnlocked = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const unlockLightRef = useRef<THREE.PointLight | null>(null);
  const scrollRotRef = useRef(scrollRotation);
  const isUnlockedRef = useRef(isUnlocked);

  useEffect(() => {
    scrollRotRef.current = scrollRotation;
  }, [scrollRotation]);

  useEffect(() => {
    isUnlockedRef.current = isUnlocked;
  }, [isUnlocked]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clean any prior canvas
    container.innerHTML = '';
    const scene = new THREE.Scene();
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    // Create 3D House shape
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
      depth: 0.9,
      bevelEnabled: true,
      bevelThickness: 0.22,
      bevelSize: 0.18,
      bevelOffset: 0,
      bevelSegments: 5,
    };

    const geometry = new THREE.ExtrudeGeometry(houseShape, extrudeSettings);
    geometry.center();

    const material = new THREE.MeshPhysicalMaterial({
      color: 0xE0218A,
      emissive: 0x5a0b38,
      emissiveIntensity: 0.25,
      metalness: 0.2,
      roughness: 0.22,
      clearcoat: 0.7,
      clearcoatRoughness: 0.15,
      reflectivity: 0.85,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Glowing Keyhole Core Light (Unlocks when triggered)
    const unlockLight = new THREE.PointLight(0xFFE45C, 0, 6);
    unlockLight.position.set(0, 0, 0.2);
    group.add(unlockLight);
    unlockLightRef.current = unlockLight;

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.4);
    dirLight1.position.set(5, 8, 6);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const rimLight = new THREE.DirectionalLight(0x9d71ff, 2.0);
    rimLight.position.set(-6, -2, -4);
    scene.add(rimLight);

    const bounceLight = new THREE.DirectionalLight(0xffe570, 1.2);
    bounceLight.position.set(0, -6, 4);
    scene.add(bounceLight);

    // Mouse Tracking with smooth Lerp inertia
    let targetRotX = 0.15;
    let targetRotY = -0.3;
    let currentRotX = 0.15;
    let currentRotY = -0.3;
    let isHovering = false;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = x * 1.0;
      targetRotX = -y * 0.7 + 0.15;
      isHovering = true;
    };

    const handleMouseLeave = () => {
      targetRotX = 0.15;
      targetRotY = -0.3;
      isHovering = false;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

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

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      if (!isVisible) return;
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const idleSway = Math.sin(elapsedTime * 1.5) * 0.08;
      const idleBob = Math.sin(elapsedTime * 2.0) * 0.08;
      const lerpSpeed = isHovering ? 0.08 : 0.04;

      currentRotX += (targetRotX - currentRotX) * lerpSpeed;
      currentRotY += (targetRotY - currentRotY) * lerpSpeed;

      // Combine mouse rotation with scroll rotation from ref
      group.rotation.x = currentRotX;
      group.rotation.y = currentRotY + scrollRotRef.current + (isHovering ? 0 : idleSway);
      group.position.y = idleBob;

      // Keyhole unlock effect
      if (unlockLightRef.current) {
        unlockLightRef.current.intensity = isUnlockedRef.current ? 4.5 + Math.sin(elapsedTime * 6) * 1.2 : 0;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Unlocked Radiant Keyhole Glow */}
      {isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-32 h-32 rounded-full bg-[#FFE45C] opacity-40 blur-2xl" />
        </div>
      )}

      {/* WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] lg:w-[300px] lg:h-[300px] xl:w-[380px] xl:h-[380px] cursor-grab active:cursor-grabbing flex items-center justify-center"
      />
    </div>
  );
};

export default ThreeLogo;
