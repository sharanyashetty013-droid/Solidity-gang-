import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { MagneticButton } from './MagneticButton';

// Lazy-load the Three.js 3D scene to cut initial bundle
const Hero3DScene = React.lazy(() => import('./Hero3DScene'));

interface HeroProps {
  onLaunchApp: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onLaunchApp }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  // Direct DOM ref to avoid re-rendering Hero / Hero3DScene on mousemove
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const handleMouseMove = (e: MouseEvent) => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const normX = (e.clientX - centerX) / centerX;
        const normY = (e.clientY - centerY) / centerY;
        // Direct DOM update on background orb
        if (orbRef.current) {
          orbRef.current.style.transform = `translate(calc(-50% + ${normX * 35}px), calc(-50% + ${normY * 25}px))`;
        }
        ticking = false;
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleLaunch = () => {
    setShowTooltip(false);
    onLaunchApp();
  };

  const scrollToAbout = () => {
    const aboutElem = document.getElementById('about');
    if (aboutElem) {
      aboutElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] pt-28 sm:pt-36 md:pt-44 pb-16 sm:pb-20 md:pb-28 px-4 sm:px-6 overflow-hidden flex flex-col justify-center items-center">
      {/* 1. Full-Screen 3D Scene Behind the Headline (Lazy-Loaded) */}
      <React.Suspense fallback={<div className="absolute inset-0 pointer-events-none -z-0" />}>
        <Hero3DScene />
      </React.Suspense>

      {/* Background morphing gradient orb that tracks mouse via direct ref */}
      <div
        ref={orbRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[560px] md:w-[720px] h-[340px] sm:h-[500px] md:h-[600px] -z-10 pointer-events-none transition-transform duration-500 ease-out"
      >
        <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#FFE45C]/40 via-[#FAD0EA]/90 to-[#E0218A]/25 blur-3xl opacity-80 animate-float-orb" />
      </div>

      {/* Dotted grid lines */}
      <div className="absolute inset-0 bg-dotted-grid opacity-35 pointer-events-none -z-10" />

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">
        {/* Animated Section Label */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-black/5 text-[#E0218A] text-xs font-bold mb-6 sm:mb-8 shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-[#E0218A] animate-ping" />
          <span>The deposit protocol that keeps receipts</span>
        </motion.div>

        {/* Headline Unit: Unified, elegant editorial typography with a single focal centerpiece pill */}
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8 w-full max-w-4xl select-none">
          {/* Question lines: Clean, natural typography without separate bulky rectangle boxes */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-1 sm:space-y-1.5 mb-3 sm:mb-4 px-2"
          >
            <p className="font-display font-medium text-lg sm:text-2xl md:text-3xl text-[#111111]/75 tracking-tight leading-snug drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
              Landlord keeping your deposit?
            </p>
            <p className="font-display font-medium text-lg sm:text-2xl md:text-3xl text-[#111111]/75 tracking-tight leading-snug drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
              Tenant dodging repairs?
            </p>
          </motion.div>

          {/* Single Centerpiece: Walls don't lie */}
          <motion.h1
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 22,
              delay: 0.4,
            }}
            className="inline-flex items-center justify-center gap-2.5 sm:gap-3.5 bg-white px-8 sm:px-12 md:px-14 py-3 sm:py-4 rounded-full shadow-[0_10px_35px_rgba(224,33,138,0.18)] border-2 border-[#E0218A]/50 hover:border-[#E0218A] transition-all duration-300 group cursor-default"
          >
            <span className="font-display font-bold text-2xl sm:text-4xl md:text-5xl lg:text-[54px] tracking-tight leading-tight">
              <span className="shimmer-text">Walls don't lie.</span>
            </span>
            <span className="relative flex h-3 w-3 sm:h-3.5 sm:w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E0218A] opacity-75" />
              <span className="relative inline-flex rounded-full h-full w-full bg-[#E0218A] shadow-[0_0_8px_#E0218A]" />
            </span>
          </motion.h1>
        </div>

        {/* Subtitle: Completely transparent without solid white block, letting 3D house show through */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="max-w-[62ch] text-sm sm:text-base md:text-lg text-[#111111]/85 font-body font-medium leading-relaxed mb-8 sm:mb-10 text-balance px-4 text-center drop-shadow-[0_1px_3px_rgba(255,255,255,0.7)]"
        >
          Deposits held in a smart contract. Settled by photo proof, not phone calls.
        </motion.p>

        {/* Single Hero Action Button: Launch App styled solid black with white text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75 }}
          className="flex flex-col sm:flex-row items-center justify-center relative mb-12 sm:mb-14 w-full sm:w-auto px-4 sm:px-0"
        >
          <div className="relative w-full sm:w-auto">
            <MagneticButton
              onClick={handleLaunch}
              className="w-full sm:w-auto px-9 py-4 rounded-full bg-[#111111] hover:bg-black text-white text-sm sm:text-base font-semibold shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:shadow-[0_14px_40px_rgba(0,0,0,0.35)] cursor-pointer justify-center border border-black transition-all"
            >
              <span>Launch App</span>
              <ArrowUpRight className="w-4 h-4 text-white/90" />
            </MagneticButton>
            {/* Tooltip */}
            {showTooltip && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 z-50 px-4 py-2 rounded-full bg-[#111111] text-white text-xs font-medium shadow-2xl whitespace-nowrap animate-in fade-in duration-150 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FFE45C]"></span>
                <span>Coming soon on Sepolia</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Scroll Indicator crosshairs */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={scrollToAbout}
          className="group flex flex-col items-center text-black/35 hover:text-[#E0218A] transition-colors cursor-pointer"
          aria-label="Scroll down to About"
        >
          <div className="w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-md border border-black/10 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:border-[#E0218A]/40 transition-all">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-current"
            >
              <path d="M5 8V5H8M19 8V5H16M5 16V19H8M19 16V19H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 9V15M9 12H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
        </motion.button>
      </div>
    </section>
  );
};
