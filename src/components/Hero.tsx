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
    <section className="relative pt-20 sm:pt-24 md:pt-28 pb-14 sm:pb-16 md:pb-20 px-4 sm:px-6 overflow-hidden flex flex-col items-center justify-center">
      {/* Background morphing gradient orb that tracks mouse via direct ref */}
      <div
        ref={orbRef}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[560px] md:w-[720px] h-[340px] sm:h-[500px] md:h-[600px] -z-10 pointer-events-none transition-transform duration-500 ease-out"
      >
        <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#FFE45C]/40 via-[#FAD0EA]/90 to-[#E0218A]/25 blur-3xl opacity-80 animate-float-orb" />
      </div>

      {/* Dotted grid lines */}
      <div className="absolute inset-0 bg-dotted-grid opacity-35 pointer-events-none -z-10" />

      {/* Combined Parent Container: Single overlapping scene with text ON TOP OF the 3D house */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
        {/* Layer 1: Background 3D Home Scene - Anchored directly in the center */}
        <div className="relative w-full flex items-center justify-center">
          {/* The 3D House Icon Canvas */}
          <div className="w-full h-[58vh] sm:h-[64vh] min-h-[420px] max-h-[600px] pointer-events-none">
            <React.Suspense fallback={<div className="w-full h-full" />}>
              <Hero3DScene />
            </React.Suspense>
          </div>

          {/* Layer 2: All Text & Actions - Placed directly with soft backdrop so text is crystal clear */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 pointer-events-none select-none">
            {/* Soft luminous radial backdrop to ensure clean readability over the 3D shapes */}
            <div className="absolute w-[90%] max-w-[620px] h-[340px] rounded-full bg-white/70 backdrop-blur-md -z-10 shadow-[0_0_60px_rgba(255,255,255,0.85)] pointer-events-none" />

            {/* Animated Section Label */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-black/10 text-[#E0218A] text-xs font-bold mb-3 sm:mb-4 shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
            >
              <span className="w-2 h-2 rounded-full bg-[#E0218A] animate-ping" />
              <span>The deposit protocol that keeps receipts</span>
            </motion.div>

            {/* Questions: Landlord keeping deposit? Tenant dodging repairs? */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="space-y-0.5 sm:space-y-1 mb-2.5 sm:mb-3 pointer-events-auto"
            >
              <div className="inline-block px-4 py-1 rounded-2xl bg-white/75 backdrop-blur-sm border border-black/5 shadow-xs">
                <p className="font-display font-semibold text-lg sm:text-2xl md:text-3xl text-[#111111] tracking-tight leading-snug">
                  Landlord keeping your deposit?
                </p>
                <p className="font-display font-semibold text-lg sm:text-2xl md:text-3xl text-[#111111] tracking-tight leading-snug">
                  Tenant dodging repairs?
                </p>
              </div>
            </motion.div>

            {/* Walls don't lie pill right on top of the house */}
            <motion.h1
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 22,
                delay: 0.3,
              }}
              className="pointer-events-auto inline-flex items-center justify-center gap-2.5 sm:gap-3 bg-white/95 backdrop-blur-md px-7 sm:px-11 py-2 sm:py-3 rounded-full shadow-[0_12px_36px_rgba(224,33,138,0.22)] border-2 border-[#E0218A] hover:border-[#E0218A] transition-all duration-300 group cursor-default mb-3 sm:mb-4"
            >
              <span className="font-display font-bold text-2xl sm:text-3xl md:text-4xl lg:text-[42px] tracking-tight leading-tight">
                <span className="shimmer-text">Walls don't lie.</span>
              </span>
              <span className="relative flex h-3 w-3 sm:h-3.5 sm:w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E0218A] opacity-75" />
                <span className="relative inline-flex rounded-full h-full w-full bg-[#E0218A] shadow-[0_0_8px_#E0218A]" />
              </span>
            </motion.h1>

            {/* Subtitle inside transparent frosted glass pill over the house */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="pointer-events-auto inline-block bg-white/50 backdrop-blur-md px-5 sm:px-7 py-2 rounded-full border border-black/10 shadow-[0_4px_16px_rgba(0,0,0,0.04)] mb-4 sm:mb-5 max-w-[92%]"
            >
              <p className="text-xs sm:text-sm md:text-base text-[#111111] font-body font-medium leading-relaxed">
                Deposits held in a smart contract. Settled by photo proof, not phone calls.
              </p>
            </motion.div>

            {/* Launch App button */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="pointer-events-auto flex flex-col sm:flex-row items-center justify-center relative w-full sm:w-auto"
            >
              <div className="relative w-full sm:w-auto">
                <MagneticButton
                  onClick={handleLaunch}
                  className="w-full sm:w-auto px-9 py-3.5 sm:py-4 rounded-full bg-[#111111] hover:bg-black text-white text-sm sm:text-base font-semibold shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:shadow-[0_14px_40px_rgba(0,0,0,0.45)] cursor-pointer justify-center border border-black transition-all"
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
          </div>
        </div>

        {/* Scroll Indicator crosshairs */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={scrollToAbout}
          className="group flex flex-col items-center text-black/35 hover:text-[#E0218A] transition-colors cursor-pointer mt-1 sm:mt-2 relative z-20"
          aria-label="Scroll down to About"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/90 backdrop-blur-md border border-black/10 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:border-[#E0218A]/40 transition-all">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 sm:w-5 sm:h-5 text-current"
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
