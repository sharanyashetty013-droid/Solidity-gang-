import React, { useState } from 'react';
import { Logo } from './Logo';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onLaunchClick?: () => void;
  isToastVisible?: boolean;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How it works', href: '#how-it-works' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <header className="sticky top-4 md:top-6 z-40 w-full px-4 sm:px-6 pointer-events-none">
      <div className="max-w-5xl mx-auto">
        <nav className="pointer-events-auto bg-white/95 backdrop-blur-md px-5 sm:px-7 py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-black/5 flex items-center justify-between transition-all">
          {/* Logo Left */}
          <a
            href="#"
            className="flex items-center hover:opacity-90 transition-opacity"
            aria-label="Walls Don't Lie Home"
          >
            <Logo size="sm" />
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#111111]">
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

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-[#111111] hover:bg-black/5 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
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
