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
    <div className="min-h-screen bg-[#FAD0EA] p-2 sm:p-4 md:p-6 lg:p-8 font-body text-[#111111] antialiased selection:bg-[#E0218A] selection:text-white flex flex-col items-center relative">
      {/* Page Load Intro: Self-drawing logo before revealing hero */}
      {!isLoaded && <PageLoader onComplete={handlePageLoadComplete} />}

      {/* Outer Floating Framed Container */}
      <div className="w-full max-w-[1440px] bg-[#F7F7F7] rounded-[28px] sm:rounded-[36px] md:rounded-[44px] shadow-[0_16px_60px_rgba(0,0,0,0.06)] border border-black/5 overflow-clip flex flex-col relative">
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
