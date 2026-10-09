import React from 'react';
import { Logo } from './Logo';
import { ArrowUpRight } from 'lucide-react';

interface FooterProps {
  // simplified footer
}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="pt-2 pb-12 px-4 sm:px-6 relative">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Seamless Marquee: width: max-content, duplicated once, translate3d(-50%, 0, 0) */}
        <div className="w-full overflow-hidden bg-white/70 py-4 sm:py-6 rounded-2xl sm:rounded-3xl border border-black/5 select-none">
          <div className="animate-marquee-track text-3xl sm:text-5xl md:text-6xl font-display font-bold text-[#111111]/85 tracking-tighter">
            {/* Block 1 */}
            <div className="flex items-center gap-8 px-4 shrink-0">
              <span className="flex items-center gap-4">
                <span>Walls don't lie.</span>
                <span className="w-3 h-3 rounded-full bg-[#E0218A] inline-block" />
              </span>
              <span className="flex items-center gap-4 text-[#E0218A]">
                <span>Proof on every wall. Deposit back in your hands.</span>
                <span className="w-3 h-3 rounded-full bg-[#111111] inline-block" />
              </span>
            </div>
            {/* Block 2 (Exact duplicate for seamless loop) */}
            <div className="flex items-center gap-8 px-4 shrink-0" aria-hidden="true">
              <span className="flex items-center gap-4">
                <span>Walls don't lie.</span>
                <span className="w-3 h-3 rounded-full bg-[#E0218A] inline-block" />
              </span>
              <span className="flex items-center gap-4 text-[#E0218A]">
                <span>Proof on every wall. Deposit back in your hands.</span>
                <span className="w-3 h-3 rounded-full bg-[#111111] inline-block" />
              </span>
            </div>
          </div>
        </div>

        {/* Footer Main Card */}
        <div className="bg-white rounded-[28px] md:rounded-[40px] p-8 sm:p-12 md:p-16 border border-black/5 shadow-[0_4px_30px_rgba(0,0,0,0.02)] relative overflow-hidden">
          <div className="absolute inset-0 bg-dotted-grid opacity-30 pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-black/5">
            {/* Left brand col */}
            <div className="lg:col-span-6 space-y-4">
              <a href="#" className="inline-block hover:opacity-90 transition-opacity">
                <Logo size="md" />
              </a>
              <p className="font-display font-bold text-2xl sm:text-3xl text-[#111111] tracking-tight">
                Walls don't lie.
              </p>
              <p className="text-sm text-[#525252] max-w-sm leading-relaxed">
                Proof on every wall. Deposit back in your hands. A rental deposit escrow protocol settled by photo evidence, not phone calls.
              </p>
              {/* Sepolia testnet badge */}
              <div className="pt-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F7F7F7] border border-black/10 text-xs font-medium text-[#111111]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Built on Sepolia testnet</span>
                </div>
              </div>
            </div>

            {/* Links Columns */}
            <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-8">
              {/* Col 1: Protocol */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-[#E0218A] block">
                  Overview
                </span>
                <ul className="space-y-2 text-sm text-[#525252]">
                  <li>
                    <a href="#features" className="hover:text-[#111111] transition-colors">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#how-it-works" className="hover:text-[#111111] transition-colors">
                      How It Works
                    </a>
                  </li>
                  <li>
                    <a href="#faq" className="hover:text-[#111111] transition-colors">
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>

              {/* Col 2: Features */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-[#E0218A] block">
                  Features
                </span>
                <ul className="space-y-2 text-sm text-[#525252]">
                  <li>
                    <a href="#feature-escrow" className="hover:text-[#111111] transition-colors">
                      Escrow Lock
                    </a>
                  </li>
                  <li>
                    <a href="#feature-capture" className="hover:text-[#111111] transition-colors">
                      Tamper-Evident Capture
                    </a>
                  </li>
                  <li>
                    <a href="#feature-itemized" className="hover:text-[#111111] transition-colors">
                      Itemized Claims
                    </a>
                  </li>
                  <li>
                    <a href="#feature-auto-return" className="hover:text-[#111111] transition-colors">
                      Auto-Return
                    </a>
                  </li>
                </ul>
              </div>

              {/* Col 3: Network */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-[#E0218A] block">
                  Network
                </span>
                <ul className="space-y-2 text-sm text-[#525252]">
                  <li>
                    <a
                      href="https://sepolia.etherscan.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#111111] transition-colors flex items-center gap-1"
                    >
                      <span>Sepolia Explorer</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom quiet row */}
          <div className="relative z-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#525252]">
            <div>
              © {new Date().getFullYear()} Walls Don't Lie. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <span className="text-[#111111] font-medium">
                Proof on every wall. Deposit back in your hands.
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
