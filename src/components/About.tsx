import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

const ThreeLogo = React.lazy(() => import('./ThreeLogo'));

export const About: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const el = sectionRef.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          const windowHeight = window.innerHeight;

          // Calculate progress across this section
          const totalDist = rect.height + windowHeight;
          const current = windowHeight - rect.top;
          const progress = Math.max(0, Math.min(1, current / totalDist));
          setScrollProgress(progress);
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 360-degree rotation based on scroll
  const scrollRotation = scrollProgress * Math.PI * 2;
  const isUnlocked = scrollProgress >= 0.72;

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-20 md:py-28 px-4 sm:px-6 relative scroll-mt-12"
    >
      <div className="max-w-6xl mx-auto">
        {/* Container panel with 24-32px rounded corners and subtle dotted grid */}
        <div className="relative bg-white rounded-[28px] md:rounded-[40px] p-8 md:p-14 lg:p-16 border border-black/5 shadow-[0_4px_30px_rgba(0,0,0,0.02)] overflow-hidden">
          {/* Subtle dotted grid overlay */}
          <div className="absolute inset-0 bg-dotted-grid opacity-35 pointer-events-none" />

          {/* Section Label Tag */}
          <div className="text-left mb-8 md:mb-10">
            <div className="inline-flex items-center gap-2">
              <span className="w-4 h-0.5 bg-[#E0218A] rounded-full inline-block"></span>
              <span className="text-[#E0218A] text-xs font-bold">
                About
              </span>
            </div>
          </div>

          {/* 3-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-10 items-center">
            {/* Left: Headline */}
            <div className="text-left">
              <motion.h2
                initial={{ opacity: 0, x: -25 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="font-display font-bold text-3xl sm:text-4xl lg:text-4xl xl:text-5xl text-[#111111] tracking-tight leading-[1.1]"
              >
                Walls Don't Lie is a deposit escrow.
              </motion.h2>
            </div>

            {/* Center: Pinned 3D House Model that rotates 360 degrees & unlocks */}
            <div className="flex justify-center py-4 lg:py-0">
              <div className="relative p-2 sm:p-4 rounded-3xl bg-[#F7F7F7]/90 border border-black/5 shadow-inner">
                <React.Suspense
                  fallback={
                    <div className="w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] lg:w-[300px] lg:h-[300px] xl:w-[380px] xl:h-[380px] flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full border-2 border-[#E0218A] border-t-transparent animate-spin" />
                    </div>
                  }
                >
                  <ThreeLogo
                    scrollRotation={scrollRotation}
                    isUnlocked={isUnlocked}
                  />
                </React.Suspense>
              </div>
            </div>

            {/* Right: Subtitle & Description */}
            <div className="text-left space-y-3">
              <motion.h3
                initial={{ opacity: 0, x: 25 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="font-display font-bold text-xl sm:text-2xl text-[#111111] leading-snug"
              >
                Direct. Tamper-evident. Settled by evidence.
              </motion.h3>
              <p className="text-sm sm:text-base text-[#525252] leading-relaxed max-w-[65ch]">
                By connecting verified smartphone photography directly with a smart contract escrow on Sepolia, rental security deposits are shielded from landlord ghosting and unfair deduction claims.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
