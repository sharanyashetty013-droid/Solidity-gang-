import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Features } from './components/Features';
import { HowItWorks } from './components/HowItWorks';
import { Faq } from './components/Faq';
import { Footer } from './components/Footer';
import { PageLoader } from './components/PageLoader';

export default function App() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('wdl_loaded') === 'true';
    }
    return false;
  });

  const handlePageLoadComplete = () => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('wdl_loaded', 'true');
      } catch {
        // ignore sessionStorage errors in restricted iframe
      }
    }
    setIsLoaded(true);
  };

  const handleLaunchApp = () => {
    setToastMessage('Coming soon on Sepolia');
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] p-2 sm:p-4 md:p-6 lg:p-8 font-body text-[#0F172A] antialiased selection:bg-[#10B981] selection:text-white flex flex-col items-center relative overflow-x-hidden">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-emerald-500/10 via-slate-800/10 to-transparent blur-3xl opacity-70" />
      </div>

      {/* Page Load Intro: Self-drawing logo before revealing hero */}
      {!isLoaded && <PageLoader onComplete={handlePageLoadComplete} />}

      {/* Outer Floating Framed Container */}
      <div className="w-full max-w-[1440px] bg-[#FAFAFC] rounded-[28px] sm:rounded-[36px] md:rounded-[44px] shadow-[0_24px_80px_rgba(0,0,0,0.35)] border border-white/10 overflow-clip flex flex-col relative">
        {/* Subtle background dotted grid spanning canvas */}
        <div className="absolute inset-0 bg-dotted-grid opacity-25 pointer-events-none" />

        {/* 1. Floating Navbar */}
        <Navbar onLaunchClick={handleLaunchApp} isToastVisible={Boolean(toastMessage)} />

        {/* Main Content Sections */}
        <main className="flex-1 flex flex-col relative z-10">
          {/* 2. Hero Section (3D) */}
          <Hero onLaunchApp={handleLaunchApp} />

          {/* 3. About Section (Pinned 3D 360-degree rotation & unlocking keyhole) */}
          <About />

          {/* 4. Key Features (3D Tilt & live automated scenes) */}
          <Features />

          {/* 5. How It Works Timeline (Autoplay & mini animations) */}
          <HowItWorks />

          {/* 6. FAQ Accordion */}
          <Faq />
        </main>

        {/* 7. Footer (Scrolling marquee) */}
        <Footer />
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full bg-[#111111] text-white text-xs sm:text-sm font-medium shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-[#FFE45C]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
