import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Camera, FileSignature, Clock, CheckCircle2, Lock, Key, Sparkles, Send } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [stepProgress, setStepProgress] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timelineRef = useRef<HTMLElement>(null);

  // Auto-play timeline every 3 seconds, pausing on hover
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setStepProgress((prev) => {
        if (prev >= 100) {
          setActiveStep((s) => (s + 1) % 5);
          return 0;
        }
        return prev + 3.33; // 100% over ~3000ms
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPaused, activeStep]);

  const handleStepClick = (idx: number) => {
    setActiveStep(idx);
    setStepProgress(0);
  };

  const steps = [
    {
      num: '01',
      title: 'Fund deposit',
      desc: 'Tenant locks test ETH deposit into an autonomous smart contract escrow before key handover.',
      detail: 'Smart contract securely locks funds on Sepolia. Neither party can withdraw unilaterally.',
      icon: ShieldCheck,
      // Mini animation: Vault locking with ETH token
      renderMini: () => (
        <div className="relative w-full h-28 bg-[#F7F7F7] rounded-xl flex items-center justify-center overflow-hidden border border-black/5">
          <div className="w-14 h-14 rounded-2xl bg-white border border-black/10 shadow-sm flex items-center justify-center relative">
            <Lock className="w-6 h-6 text-[#10B981]" />
            <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-emerald-100 text-xs font-mono font-bold text-emerald-800 shadow-xs border border-emerald-200">
              ETH
            </span>
          </div>
        </div>
      ),
    },
    {
      num: '02',
      title: 'Move-in photos + dual sign',
      desc: 'In-app room condition capture. Landlord and tenant both counter-sign with wallet signatures.',
      detail: 'Timestamp, GPS, and camera verification create a permanent move-in baseline.',
      icon: FileSignature,
      // Mini animation: Camera flash with dual keys
      renderMini: () => (
        <div className="relative w-full h-28 bg-[#F7F7F7] rounded-xl flex items-center justify-center overflow-hidden border border-black/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white border border-black/10 flex items-center justify-center shadow-sm">
              <Camera className="w-5 h-5 text-[#10B981]" />
            </div>
            <span className="text-black/30 font-bold">+</span>
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-black/10 flex items-center justify-center shadow-sm">
              <Key className="w-5 h-5 text-[#0F172A]" />
            </div>
          </div>
        </div>
      ),
    },
    {
      num: '03',
      title: 'Move-out photos',
      desc: 'At tenancy conclusion, identical angles are snapped to generate computer vision diffs.',
      detail: 'Vision comparison highlights changes and differentiates natural wear from damages.',
      icon: Camera,
      // Mini animation: Laser scanner sweep
      renderMini: () => (
        <div className="relative w-full h-28 bg-[#F7F7F7] rounded-xl flex items-center justify-center overflow-hidden border border-black/5">
          <div className="w-36 h-14 bg-white rounded-lg border border-black/10 relative overflow-hidden flex items-center justify-center shadow-xs">
            <Camera className="w-5 h-5 text-[#10B981]/40" />
            <div className="absolute inset-y-0 w-1 bg-[#10B981] shadow-[0_0_8px_#10B981] animate-marquee" />
          </div>
        </div>
      ),
    },
    {
      num: '04',
      title: 'Claim window',
      desc: 'A strict 14-day on-chain countdown starts. Landlord must substantiate itemized claims.',
      detail: 'Any claim requires proof photos and exact quote estimates linked to detected diffs.',
      icon: Clock,
      // Mini animation: Ticking countdown ring
      renderMini: () => (
        <div className="relative w-full h-28 bg-[#F7F7F7] rounded-xl flex items-center justify-center overflow-hidden border border-black/5">
          <div className="relative flex items-center justify-center">
            <svg className="w-14 h-14 -rotate-90">
              <circle cx="28" cy="28" r="22" stroke="#E5E5E5" strokeWidth="3" fill="none" />
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke="#10B981"
                strokeWidth="3"
                strokeDasharray="138"
                strokeDashoffset="35"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <Clock className="w-5 h-5 text-[#10B981] absolute" />
          </div>
        </div>
      ),
    },
    {
      num: '05',
      title: 'Auto-return or dispute',
      desc: 'Zero claim triggers 100% instant refund. Disputed claims route to staked community arbitrators.',
      detail: 'If landlord does not claim within 14 days, smart contract auto-returns full deposit.',
      icon: CheckCircle2,
      // Mini animation: Funds flying to tenant wallet
      renderMini: () => (
        <div className="relative w-full h-28 bg-[#F7F7F7] rounded-xl flex items-center justify-center overflow-hidden border border-black/5">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <Send className="w-5 h-5 text-emerald-600" />
            </div>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
      ),
    },
  ];

  return (
    <section
      id="how-it-works"
      ref={timelineRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="py-20 md:py-28 px-4 sm:px-6 relative scroll-mt-24"
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-[28px] md:rounded-[40px] p-8 md:p-14 lg:p-16 border border-black/5 shadow-[0_4px_30px_rgba(0,0,0,0.02)] relative overflow-hidden">
          <div className="absolute inset-0 bg-dotted-grid opacity-35 pointer-events-none" />

          {/* Section Header */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-4 h-0.5 bg-[#10B981] rounded-full inline-block" />
              <span className="text-[#10B981] text-xs font-bold">
                How it works
              </span>
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-[#111111] tracking-tight text-balance">
              From security deposit to full return.
            </h2>
          </div>

          {/* Horizontal Timeline Track */}
          <div className="relative mb-8">
            {/* Step Progress Line */}
            <div className="hidden lg:block absolute top-7 left-12 right-12 h-1 bg-[#F0F0F0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#10B981] transition-all duration-300"
                style={{
                  width: `${(activeStep / (steps.length - 1)) * 100}%`,
                }}
              />
            </div>

            {/* 5 Timeline Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 relative z-10">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isCurrent = activeStep === idx;
                const isPassed = activeStep > idx;

                return (
                  <button
                    key={step.num}
                    onClick={() => handleStepClick(idx)}
                    className={`text-left p-4.5 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between h-full border ${
                      isCurrent
                        ? 'bg-[#F7F7F7] border-[#10B981] shadow-md ring-2 ring-[#10B981]/15 scale-[1.02]'
                        : isPassed
                        ? 'bg-white border-black/10 hover:border-black/20'
                        : 'bg-white/80 border-black/5 hover:border-black/15 opacity-75'
                    }`}
                  >
                    <div className="flex flex-col h-full w-full">
                      {/* Top Node & Number */}
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-colors ${
                            isCurrent
                              ? 'bg-[#10B981] text-white shadow-sm'
                              : isPassed
                              ? 'bg-[#111111] text-white'
                              : 'bg-[#F0F0F0] text-[#525252]'
                          }`}
                        >
                          {step.num}
                        </div>
                        <Icon
                          className={`w-4 h-4 ${
                            isCurrent
                              ? 'text-[#10B981]'
                              : isPassed
                              ? 'text-neutral-700'
                              : 'text-neutral-400'
                          }`}
                        />
                      </div>

                      {/* Active Progress Micro-Bar (with placeholder height so titles stay aligned) */}
                      {isCurrent ? (
                        <div className="w-full bg-black/5 h-1 rounded-full mb-3 overflow-hidden">
                          <div
                            className="bg-[#10B981] h-full transition-all duration-100"
                            style={{ width: `${stepProgress}%` }}
                          />
                        </div>
                      ) : (
                        <div className="w-full h-1 mb-3" />
                      )}

                      <h3 className="font-display font-bold text-sm text-[#111111] mb-1.5 leading-snug">
                        {step.title}
                      </h3>
                      <p className="text-xs text-[#525252] leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Step Dedicated Mini-Scene Showcase */}
          <div className="p-6 bg-[#F7F7F7] rounded-2xl border border-black/5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center mb-8">
            <div className="md:col-span-8 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#10B981]">
                  Step {steps[activeStep].num}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                <span className="text-sm font-semibold text-[#111111]">
                  {steps[activeStep].title}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#525252] leading-relaxed">
                {steps[activeStep].detail}
              </p>
            </div>
            <div className="md:col-span-4">
              {steps[activeStep].renderMini()}
            </div>
          </div>

          {/* Crucial mandatory copy banner */}
          <div className="relative p-6 sm:p-8 rounded-2xl bg-white border border-[#10B981]/30 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="font-display font-bold text-base sm:text-lg md:text-xl text-[#111111] leading-snug">
                If the landlord doesn't claim in time, the deposit returns to the tenant automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
