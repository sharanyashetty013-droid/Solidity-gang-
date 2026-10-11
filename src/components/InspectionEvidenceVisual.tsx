import React, { useState } from 'react';
import { Camera, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';

interface InspectionEvidenceVisualProps {
  className?: string;
}

export const InspectionEvidenceVisual: React.FC<InspectionEvidenceVisualProps> = ({
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'movein' | 'diff' | 'moveout'>('diff');

  return (
    <div
      className={`w-full max-w-[460px] bg-white rounded-2xl sm:rounded-3xl border border-black/10 shadow-[0_16px_40px_rgba(0,0,0,0.08)] p-4 sm:p-5 text-[#111111] transition-all duration-300 relative overflow-hidden ${className}`}
    >
      {/* 1. Header with room and total deposit */}
      <div className="flex items-center justify-between text-xs sm:text-[13px] pb-1 border-b border-black/5">
        <div className="flex items-center gap-2 font-medium text-neutral-800">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E0218A] shrink-0" />
          <span>Living Room — East Wall</span>
        </div>
        <div className="text-neutral-500 font-mono text-[11px] sm:text-xs">
          Total Deposit: <span className="font-semibold text-neutral-800">$2,400.00</span>
        </div>
      </div>

      {/* 2. Disputed Claim Alert Box */}
      <div className="mt-3 p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs sm:text-[13px] leading-relaxed text-amber-950">
        <span className="font-bold text-[#B45309]">Disputed Claim: </span>
        <span>Landlord claimed $1,200 for full wall repainting citing scuff marks.</span>
      </div>

      {/* 3. Photo Card with Pill Overlays */}
      <div className="relative mt-3 rounded-2xl overflow-hidden border border-black/10 aspect-[16/10] bg-neutral-100 group">
        <img
          src="/src/assets/images/inspection_living_room_1791564745001.jpg"
          alt="Living Room East Wall move-out inspection snapshot"
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-transform duration-500 ${
            activeTab === 'diff' ? 'contrast-105' : ''
          }`}
        />

        {/* Top Right Pills / Tabs */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <button
            type="button"
            onClick={() => setActiveTab('movein')}
            className={`px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-medium transition-all cursor-pointer backdrop-blur-md ${
              activeTab === 'movein'
                ? 'bg-white text-black font-semibold shadow-md'
                : 'bg-black/60 hover:bg-black/80 text-white/90'
            }`}
          >
            Day 1 Move-In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('diff')}
            className={`px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold transition-all cursor-pointer shadow-sm ${
              activeTab === 'diff'
                ? 'bg-[#E0218A] text-white shadow-[0_2px_12px_rgba(224,33,138,0.5)] ring-2 ring-white/50'
                : 'bg-black/60 hover:bg-black/80 text-white/90 backdrop-blur-md'
            }`}
          >
            AI Diff Verified
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('moveout')}
            className={`px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-medium transition-all cursor-pointer backdrop-blur-md ${
              activeTab === 'moveout'
                ? 'bg-white text-black font-semibold shadow-md'
                : 'bg-black/60 hover:bg-black/80 text-white/90'
            }`}
          >
            Move-Out
          </button>
        </div>

        {/* AI Diff Detection Highlight Overlay (visible when AI Diff Verified is active) */}
        {activeTab === 'diff' && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Wall micro-fading scanned area box */}
            <div className="absolute top-[28%] left-[30%] w-[38%] h-[34%] rounded-lg border-2 border-dashed border-[#E0218A] bg-[#E0218A]/10 backdrop-blur-[0.5px] p-2 flex flex-col justify-between animate-pulse">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold bg-[#E0218A] text-white px-1.5 py-0.5 rounded shadow-sm">
                  Wear Diff: 0.12%
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <div className="text-[9px] font-sans font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                Sunlight paint fade • Pre-existing
              </div>
            </div>
          </div>
        )}

        {/* Bottom Left Hash & Geotag Metadata Badge */}
        <div className="absolute bottom-2.5 left-2.5 z-10 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-medium shadow-md">
            <Camera className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>Aug 31, 2026</span>
            <span className="text-white/40">•</span>
            <span className="font-mono text-emerald-400">Verified Hash 0x81b2</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-white font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] pl-1">
            Move-Out Inspection Snapshot (EXIF Geotagged)
          </div>
        </div>
      </div>

      {/* 4. Automated Finding Card */}
      <div className="mt-3 p-3 sm:p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-neutral-600 uppercase font-mono">
            AUTOMATED FINDING
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold tracking-wide uppercase">
            TAMPER-EVIDENT PROOF CHAIN
          </span>
        </div>
        <p className="text-xs sm:text-[13px] text-neutral-600 leading-relaxed">
          Move-in photographic baseline confirmed pre-existing microscopic paint fading. Computer vision classified variation as legal normal wear.
        </p>
      </div>

      {/* 5. Claim Dismissed Result Banner */}
      <div className="mt-3 p-3 sm:p-3.5 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-xs sm:text-sm text-[#064E3B] leading-tight">
              Claim dismissed: Normal wear &amp; tear
            </div>
            <div className="text-[11px] sm:text-xs text-[#047857] mt-0.5">
              $2,400 deposit returned in full to tenant automatically.
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <span className="px-2.5 py-1 rounded-full bg-emerald-200/80 text-[#065F46] font-mono font-bold text-xs">
            $2,400.00 (100%)
          </span>
        </div>
      </div>

      {/* 6. Footer Settlement Metrics */}
      <div className="mt-3 pt-2.5 flex items-center justify-between text-[11px] sm:text-xs text-neutral-500 border-t border-neutral-100">
        <div className="flex items-center gap-1.5 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>0 phone calls • 0 court fees</span>
        </div>
        <div className="flex items-center gap-1 font-semibold text-[#E0218A]">
          <Sparkles className="w-3 h-3" />
          <span>Evidence-based settlement</span>
        </div>
      </div>
    </div>
  );
};

export default InspectionEvidenceVisual;
