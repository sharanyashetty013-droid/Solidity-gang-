import React, { useState } from 'react';
import { Logo } from './Logo';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { MagneticButton } from './MagneticButton';

interface NavbarProps {
  onLaunchClick: () => void;
  isToastVisible?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onLaunchClick, isToastVisible = false }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLaunchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowTooltip(false);
    onLaunchClick();
  };

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How it works', href: '#how-it-works' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <header className="sticky top-4 md:top-6 z-40 w-full px-4 sm:px-6 pointer-events-none">
      <div className="max-w-5xl mx-auto">
        <nav className="pointer-events-auto bg-white/95 backdrop-blur-md px-4 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-black/5 flex items-center justify-between transition-all">
          {/* Logo Left */}
          <a
            href="#"
            className="flex items-center hover:opacity-90 transition-opacity"
            aria-label="Walls Don't Lie Home"
          >
            <Logo size="sm" />
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-[#111111]">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="hover:text-[#E0218A] transition-colors relative py-1"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Right Action Area */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Launch App Magnetic Pill Button */}
            <div className="relative">
              <MagneticButton
                onClick={handleLaunchClick}
                onMouseEnter={() => {
                  if (!isToastVisible) setShowTooltip(true);
                }}
                onMouseLeave={() => setShowTooltip(false)}
                className="px-4 sm:px-5 py-2 rounded-full bg-[#E0218A] hover:bg-[#c51474] text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all duration-200 cursor-pointer whitespace-nowrap"
              >
                <span>Launch App</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
              </MagneticButton>

              {/* Tooltip */}
              {showTooltip && !isToastVisible && (
                <div className="absolute top-full right-0 mt-2 z-50 px-3 py-1.5 rounded-full bg-[#111111] text-white text-xs font-medium shadow-lg animate-in fade-in slide-in-from-top-1 duration-150 whitespace-nowrap flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFE45C]" />
                  Coming soon on Sepolia
                </div>
              )}
            </div>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-[#111111] hover:bg-black/5 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="pointer-events-auto md:hidden mt-2 p-4 bg-white rounded-3xl shadow-xl border border-black/5 flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-[#111111] hover:bg-[#F7F7F7] hover:text-[#E0218A] transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
