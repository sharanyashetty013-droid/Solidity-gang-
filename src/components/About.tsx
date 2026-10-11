import React from 'react';
import { motion } from 'motion/react';
import { InspectionEvidenceVisual } from './InspectionEvidenceVisual';

export const About: React.FC = () => {
  return (
    <section
      id="about"
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
              <span className="w-4 h-0.5 bg-[#111111] rounded-full inline-block"></span>
              <span className="text-[#111111] text-xs font-bold tracking-wider uppercase">
                Tamper-Evident Evidence &amp; Escrow
              </span>
            </div>
          </div>

          {/* 3-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-12 items-center">
            {/* Left: Headline */}
            <div className="text-left">
              <motion.h2
                initial={{ opacity: 0, x: -25 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="font-display font-bold text-3xl sm:text-4xl lg:text-4xl xl:text-5xl text-[#111111] tracking-tight leading-[1.1]"
              >
                Walls Don't Lie is a deposit escrow protocol.
              </motion.h2>
              <p className="mt-4 text-sm text-[#737373] leading-relaxed">
                Trust-minimized smart contracts on Ethereum replace unbacked security deposit promises with cryptographically verified photo attestations.
              </p>
            </div>

            {/* Center: Real Evidence & Inspection Case Study Visual */}
            <div className="flex justify-center py-2 lg:py-0">
              <InspectionEvidenceVisual />
            </div>

            {/* Right: Subtitle & Description */}
            <div className="text-left space-y-4">
              <motion.h3
                initial={{ opacity: 0, x: 25 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="font-display font-bold text-xl sm:text-2xl text-[#111111] leading-snug"
              >
                Direct. Tamper-evident. Settled by cryptographic proof.
              </motion.h3>
              <p className="text-sm sm:text-base text-[#525252] leading-relaxed max-w-[65ch]">
                By anchoring cryptographic hashes of move-in condition photos directly into the Sepolia contract, funds remain locked until agreed verification conditions are satisfied. No landlord ghosting, no phone calls, no arbitrary deductions.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-[#F4F4F5] border border-black/5 text-[11px] font-semibold text-[#18181B]">
                  ERC-20 & ETH Vaults
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#F4F4F5] border border-black/5 text-[11px] font-semibold text-[#18181B]">
                  AI Condition Baseline
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#F4F4F5] border border-black/5 text-[11px] font-semibold text-[#18181B]">
                  Instant Payout
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
