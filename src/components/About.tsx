import React from 'react';
import { motion } from 'motion/react';
import { InspectionAuditCard } from './InspectionAuditCard';

export const About: React.FC = () => {
  return (
    <section
      id="about"
      className="py-16 md:py-24 px-4 sm:px-6 relative scroll-mt-12"
    >
      <div className="max-w-6xl mx-auto">
        {/* Container panel with rounded corners and subtle dotted grid */}
        <div className="relative bg-white rounded-[28px] md:rounded-[40px] p-6 sm:p-10 md:p-12 lg:p-16 border border-black/5 shadow-[0_4px_30px_rgba(0,0,0,0.02)] overflow-hidden">
          {/* Subtle dotted grid overlay */}
          <div className="absolute inset-0 bg-dotted-grid opacity-35 pointer-events-none" />

          {/* Section Label: THE REAL SOLUTION */}
          <div className="text-left mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2">
              <span className="w-4 h-0.5 bg-[#E0218A] rounded-full inline-block"></span>
              <span className="text-[#111111] text-xs font-bold uppercase tracking-wider">
                The Real Solution
              </span>
            </div>
          </div>

          {/* 2-Column Grid: Headline & 3 key proof points on left, Real Proof Inspection Audit on right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headline & Value Prop */}
            <div className="lg:col-span-5 text-left space-y-6">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="font-display font-bold text-3xl sm:text-4xl lg:text-4xl xl:text-5xl text-[#111111] tracking-tight leading-[1.08]"
              >
                Why this matters in the real world.
              </motion.h2>

              <p className="text-base sm:text-lg text-[#333333] font-normal leading-relaxed">
                Every year, billions in security deposits are withheld over baseless scuffs, delayed replies, and unfair painting deductions.
              </p>

              {/* 3 Numbered Steps matching the screenshot */}
              <div className="space-y-4 pt-2">
                {/* Step 1 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-[#111111] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-[#111111]">
                      Unbiased move-in photographic baseline:
                      <span className="font-normal text-[#444444] ml-1">
                        Both parties cryptographically sign the room condition on day one.
                      </span>
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-[#111111] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-[#111111]">
                      Zero arbitrary deductions:
                      <span className="font-normal text-[#444444] ml-1">
                        Landlords cannot withhold $1,200 for normal wear. Only verified diffs with licensed repair quotes are allowed.
                      </span>
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-[#111111] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-[#111111]">
                      Guaranteed escrow payout:
                      <span className="font-normal text-[#444444] ml-1">
                        When photo evidence matches, the smart contract automatically refunds the deposit to the tenant's wallet.
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Tags */}
              <div className="pt-3 flex flex-wrap items-center gap-2.5">
                <span className="px-3.5 py-1.5 rounded-lg bg-[#F4F4F5] border border-black/5 text-xs font-semibold text-[#18181B]">
                  Legally Defensible Proof
                </span>
                <span className="px-3.5 py-1.5 rounded-lg bg-[#F4F4F5] border border-black/5 text-xs font-semibold text-[#18181B]">
                  No Small Claims Court
                </span>
              </div>
            </div>

            {/* Right Column: Interactive Real Proof Inspection Audit Card */}
            <div className="lg:col-span-7 flex justify-center w-full">
              <InspectionAuditCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
