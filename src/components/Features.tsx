import React, { useState, useEffect, useRef } from 'react';
import { Check, Camera } from 'lucide-react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const TiltCard: React.FC<TiltCardProps> = ({ children, className = '', style }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -10;
    const rotY = ((x - centerX) / centerX) * 10;

    setRotate({ x: rotX, y: rotY });
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.15,
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '1000px',
        ...style,
      }}
      className="w-full"
    >
      <div
        className={`relative transition-transform duration-200 ease-out ${className}`}
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        }}
      >
        {/* Dynamic Glare Specular Highlight */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[28px] md:rounded-[32px] transition-opacity duration-300 z-20"
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 65%)`,
            opacity: glare.opacity,
          }}
        />
        {children}
      </div>
    </div>
  );
};

export const Features: React.FC = () => {
  // 1.0 Camera Viewfinder Live State
  const [cameraPhase, setCameraPhase] = useState<'seeking' | 'locked' | 'stamped'>('seeking');

  useEffect(() => {
    const cycle = setInterval(() => {
      setCameraPhase('seeking');
      setTimeout(() => {
        setCameraPhase('locked');
        setTimeout(() => {
          setCameraPhase('stamped');
        }, 1200);
      }, 1600);
    }, 4500);
    return () => clearInterval(cycle);
  }, []);

  // 2.0 Dual Signature Merging Animation State
  const [sigMerged, setSigMerged] = useState(false);

  useEffect(() => {
    const sigCycle = setInterval(() => {
      setSigMerged(false);
      setTimeout(() => setSigMerged(true), 2000);
    }, 4800);
    return () => clearInterval(sigCycle);
  }, []);

  // 3.0 Draggable AI Diff State
  const [sliderPos, setSliderPos] = useState(50);
  const [isAutoScanning, setIsAutoScanning] = useState(true);

  useEffect(() => {
    if (!isAutoScanning) return;
    const scanInterval = setInterval(() => {
      setSliderPos((prev) => {
        if (prev >= 80) return 20;
        return prev + 15;
      });
    }, 1800);
    return () => clearInterval(scanInterval);
  }, [isAutoScanning]);

  // 4.0 Staked Arbitrators Balance Scale State
  const [scaleAngle, setScaleAngle] = useState(0);

  useEffect(() => {
    const scaleInterval = setInterval(() => {
      // Realistic damping oscillation tilt
      setScaleAngle((prev) => (prev === 8 ? -6 : 8));
      setTimeout(() => {
        setScaleAngle((prev) => (prev > 0 ? 3 : -2));
      }, 900);
    }, 3600);
    return () => clearInterval(scaleInterval);
  }, []);

  const features = [
    {
      id: 'feature-escrow',
      num: '1.0',
      title: 'Escrow lock',
      desc: 'Deposits in test ETH are locked inside an autonomous smart contract on Sepolia. Neither party can withdraw unilaterally.',
      renderScene: () => (
        <div className="relative w-full h-48 bg-[#F7F7F7] rounded-2xl overflow-hidden border border-black/5 flex items-center justify-center p-4 select-none">
          {/* Connecting Track Line */}
          <div className="absolute w-44 h-0.5 bg-black/10" />

          {/* Tenant Signature Ring (Magenta #E0218A) */}
          <div
            className="absolute transition-all duration-700 ease-out flex flex-col items-center"
            style={{
              transform: sigMerged ? 'translateX(0px)' : 'translateX(-52px)',
            }}
          >
            <div className="w-16 h-16 rounded-full border-2 border-[#E0218A] bg-white shadow-md flex items-center justify-center">
              <span className="text-xs font-bold text-[#E0218A]">
                Tenant
              </span>
            </div>
          </div>

          {/* Landlord Signature Ring (Purple #6B3FE0) */}
          <div
            className="absolute transition-all duration-700 ease-out flex flex-col items-center"
            style={{
              transform: sigMerged ? 'translateX(0px)' : 'translateX(52px)',
            }}
          >
            <div className="w-16 h-16 rounded-full border-2 border-[#6B3FE0] bg-white shadow-md flex items-center justify-center">
              <span className="text-xs font-bold text-[#6B3FE0]">
                Landlord
              </span>
            </div>
          </div>

          {/* Merged Central Seal with Golden Checkmark Ripple */}
          {sigMerged && (
            <div className="relative z-20 flex flex-col items-center animate-in zoom-in-75 duration-300">
              <div className="w-16 h-16 rounded-full bg-[#FFE45C] border-2 border-[#111111] shadow-xl flex items-center justify-center">
                <Check className="w-8 h-8 text-[#111111] stroke-[3]" />
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'feature-capture',
      num: '2.0',
      title: 'Tamper-evident capture',
      desc: 'Photos must be taken inside the app. Timestamp, location and hash are recorded at capture. No old or edited photos, ever.',
      renderScene: () => (
        <div className="relative w-full h-48 bg-neutral-900 rounded-2xl overflow-hidden border border-black/10 flex items-center justify-center p-4 text-white select-none">
          {/* Subtle grid in viewfinder */}
          <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

          {/* Central Live Viewfinder Reticle */}
          <div className="relative flex items-center justify-center pointer-events-none">
            <div
              className={`w-24 h-24 rounded-2xl border-2 transition-all duration-500 flex items-center justify-center ${
                cameraPhase === 'seeking'
                  ? 'border-white/30 scale-110'
                  : cameraPhase === 'locked'
                  ? 'border-emerald-400 scale-95 shadow-[0_0_15px_rgba(52,211,153,0.5)]'
                  : 'border-[#E0218A] scale-100 shadow-[0_0_20px_rgba(224,33,138,0.6)]'
              }`}
            >
              <Camera
                className={`w-6 h-6 transition-colors ${
                  cameraPhase === 'seeking'
                    ? 'text-white/40'
                    : cameraPhase === 'locked'
                    ? 'text-emerald-400'
                    : 'text-[#E0218A]'
                }`}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'feature-itemized',
      num: '3.0',
      title: 'Itemized claims',
      desc: 'Landlords submit deductions line by line with photo evidence. Clean areas release immediately, and humans decide any contested items.',
      renderScene: () => (
        <div
          className="relative w-full h-48 bg-[#F7F7F7] rounded-2xl overflow-hidden border border-black/5 select-none cursor-ew-resize"
          onMouseEnter={() => setIsAutoScanning(false)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = Math.max(10, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100));
            setSliderPos(pct);
          }}
        >
          {/* Left Baseline Side */}
          <div className="absolute inset-0 bg-white flex items-center justify-center p-4">
            <div className="w-full h-full border border-dashed border-black/10 rounded-xl flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-neutral-400">
                Move-in baseline
              </span>
              <span className="text-xs text-emerald-600 font-semibold mt-1">
                Clean wall — Zero scuffs
              </span>
            </div>
          </div>

          {/* Right Move-Out Side with AI Detection Box */}
          <div
            className="absolute inset-0 bg-[#F7F7F7] flex items-center justify-center p-4 overflow-hidden border-l-2 border-[#E0218A]"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="w-[320px] h-full flex flex-col items-center justify-center relative">
              {/* AI Flagged Scuff Box */}
              <div className="w-40 h-20 border-2 border-[#E0218A] bg-[#E0218A]/15 rounded-lg flex flex-col justify-between p-2.5 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="bg-[#E0218A] text-white font-bold px-2 py-0.5 rounded text-xs">
                    Itemized check
                  </span>
                </div>
                <div className="text-xs font-semibold text-[#111111]">
                  Scuff detected (5.2cm)
                </div>
              </div>
            </div>
          </div>

          {/* Slider divider line and drag grip */}
          <div
            className="absolute top-0 bottom-0 w-8 -ml-4 flex items-center justify-center pointer-events-none"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="w-6 h-6 rounded-full bg-[#E0218A] text-white flex items-center justify-center shadow-lg text-xs font-bold">
              ↔
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'feature-auto-return',
      num: '4.0',
      title: 'Auto-return',
      desc: 'A strict 14-day countdown starts at move-out. If the landlord does not file itemized evidence in time, 100% of the deposit returns to the tenant.',
      renderScene: () => (
        <div className="relative w-full h-48 bg-[#F7F7F7] rounded-2xl overflow-hidden border border-black/5 flex items-center justify-center p-4 select-none">
          <svg viewBox="0 0 240 160" fill="none" className="w-full h-full">
            {/* Fulcrum base */}
            <path d="M100 135L120 95L140 135H100Z" stroke="#111111" strokeWidth="2.5" fill="#FFFFFF" />
            <circle cx="120" cy="95" r="5" fill="#E0218A" />

            {/* Dynamic tilting balance beam */}
            <g
              className="transition-transform duration-500 ease-out"
              style={{
                transform: `rotate(${scaleAngle}deg)`,
                transformOrigin: '120px 95px',
              }}
            >
              <line x1="40" y1="95" x2="200" y2="95" stroke="#111111" strokeWidth="3" strokeLinecap="round" />

              {/* Left Plate (Jury Stakes) */}
              <g transform="translate(55, 95)">
                <line x1="0" y1="0" x2="-18" y2="28" stroke="#6B3FE0" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="0" y1="0" x2="18" y2="28" stroke="#6B3FE0" strokeWidth="1.5" strokeDasharray="3 3" />
                <rect x="-26" y="28" width="52" height="9" rx="4.5" fill="#FFE45C" stroke="#111111" strokeWidth="1.5" />
                {/* Dropped Stake Tokens */}
                <circle cx="-12" cy="22" r="5" fill="#6B3FE0" stroke="#111111" strokeWidth="1" />
                <circle cx="0" cy="19" r="5.5" fill="#E0218A" stroke="#111111" strokeWidth="1" />
                <circle cx="12" cy="22" r="5" fill="#FFE45C" stroke="#111111" strokeWidth="1" />
              </g>

              {/* Right Plate (Verdict / Payout) */}
              <g transform="translate(185, 95)">
                <line x1="0" y1="0" x2="-18" y2="28" stroke="#E0218A" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="0" y1="0" x2="18" y2="28" stroke="#E0218A" strokeWidth="1.5" strokeDasharray="3 3" />
                <rect x="-26" y="28" width="52" height="9" rx="4.5" fill="#FFFFFF" stroke="#111111" strokeWidth="1.5" />
                <circle cx="0" cy="20" r="6" fill="#E0218A" stroke="#111111" strokeWidth="1" />
              </g>
            </g>

            {/* Top halo node */}
            <circle cx="120" cy="32" r="11" fill="#FFE45C" stroke="#111111" strokeWidth="1.8" />
            <circle cx="120" cy="32" r="4.5" fill="#E0218A" />
          </svg>
        </div>
      ),
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 px-4 sm:px-6 relative scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-14">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-4 h-0.5 bg-[#E0218A] rounded-full inline-block" />
            <span className="text-[#E0218A] text-xs font-bold">
              Features
            </span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-[#111111] tracking-tight text-balance">
            Evidence at every stage.
          </h2>
        </div>

        {/* 4 Cards with 3D Tilt and Glare Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feat, idx) => (
            <div key={feat.num} id={feat.id} className="scroll-mt-28 w-full flex">
              <TiltCard
                style={{
                  top: `${80 + idx * 12}px`,
                }}
                className="group bg-white rounded-[28px] md:rounded-[32px] p-8 sm:p-10 border border-black/5 hover:border-black/15 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.06)] flex flex-col justify-between overflow-hidden"
              >
                {/* Number and Title */}
                <div className="space-y-2 mb-5">
                  <span className="font-display font-bold text-sm text-[#E0218A] block">
                    {feat.num}
                  </span>
                  <h3 className="font-display font-bold text-2xl sm:text-3xl text-[#111111] tracking-tight group-hover:text-[#E0218A] transition-colors">
                    {feat.title}
                  </h3>
                </div>

                {/* Live Automated Scene */}
                <div className="my-2">{feat.renderScene()}</div>

                {/* Body Copy */}
                <p className="mt-6 text-sm sm:text-base text-[#525252] leading-relaxed max-w-[65ch]">
                  {feat.desc}
                </p>
              </TiltCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
