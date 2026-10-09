import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Camera, CheckCircle2, AlertTriangle, ShieldCheck, FileCheck, ArrowRight, X } from 'lucide-react';

interface CaseStudy {
  id: string;
  room: string;
  claim: string;
  depositTotal: string;
  landlordAsked: string;
  deduction: string;
  tenantRefund: string;
  finalSettlement: string;
  resolutionTime: string;
  status: 'clean' | 'minor';
  moveInDate: string;
  moveOutDate: string;
  beforeImage: string;
  afterImage: string;
  finding: string;
  contractVerdict: string;
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'case-1',
    room: 'Living Room — East Wall',
    claim: 'Landlord claimed $1,200 for full wall repainting citing scuff marks.',
    depositTotal: '$2,400.00',
    landlordAsked: '$1,200.00',
    deduction: '$0.00',
    tenantRefund: '$2,400.00',
    finalSettlement: 'Claim dismissed: Normal wear & tear',
    resolutionTime: 'Instant on-chain',
    status: 'clean',
    moveInDate: 'Aug 31, 2026 · Verified Hash 0x81b2',
    moveOutDate: 'Aug 31, 2026 · Verified Hash 0x81b2',
    beforeImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80',
    afterImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80',
    finding: 'Move-in photographic baseline confirmed pre-existing microscopic paint fading. Computer vision classified variation as legal normal wear.',
    contractVerdict: '$2,400 deposit returned in full to tenant automatically.',
  },
  {
    id: 'case-2',
    room: 'Hardwood Floor — Hallway',
    claim: 'Landlord demanded entire $2,500 deposit for full floor replacement.',
    depositTotal: '$2,500.00',
    landlordAsked: '$2,500.00',
    deduction: '$85.00',
    tenantRefund: '$2,415.00',
    finalSettlement: 'Settled: Single scratch itemized',
    resolutionTime: 'Resolved via photo proof',
    status: 'minor',
    moveInDate: 'Oct 14, 2026 · Verified Hash 0x7c90',
    moveOutDate: 'Oct 14, 2026 · Verified Hash 0x7c90',
    beforeImage: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=900&q=80',
    afterImage: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=900&q=80',
    finding: 'Single 4-inch surface scratch verified against move-in baseline. Independent contractor repair quote fixed at $85.',
    contractVerdict: '$85 paid to landlord for buffing; remaining $2,415 returned to tenant.',
  },
];

export const InspectionAuditCard: React.FC = () => {
  const [activeCaseIdx, setActiveCaseIdx] = useState(0);
  const [viewMode, setViewMode] = useState<'move-in' | 'diff' | 'move-out'>('diff');

  const currentCase = CASE_STUDIES[activeCaseIdx];

  return (
    <div className="w-full max-w-[580px] bg-white rounded-2xl border border-neutral-200/90 shadow-[0_12px_32px_rgba(0,0,0,0.06)] overflow-hidden text-left flex flex-col font-sans">
      {/* Top Header Bar */}
      <div className="bg-[#18181B] px-5 sm:px-6 py-4 flex items-center justify-between border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs sm:text-sm font-semibold tracking-wide text-neutral-100 uppercase">
            Proof Inspection Audit
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-neutral-800/80 border border-neutral-700/80 text-neutral-200 text-xs font-mono font-medium">
          <FileCheck className="w-3.5 h-3.5 text-neutral-300" />
          <span>Case #{activeCaseIdx + 1}</span>
        </div>
      </div>

      {/* Room Tabs */}
      <div className="p-2 sm:p-2.5 bg-neutral-100 border-b border-neutral-200 flex gap-2">
        {CASE_STUDIES.map((c, idx) => {
          const isActive = activeCaseIdx === idx;
          const isLivingRoom = c.room.toLowerCase().includes('living');
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCaseIdx(idx)}
              className={`flex-1 py-2 sm:py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200/80'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
              }`}
            >
              {isLivingRoom ? (
                <CheckCircle2 className={`w-4 h-4 ${isActive ? 'text-neutral-900' : 'text-neutral-400'}`} />
              ) : (
                <AlertTriangle className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-neutral-400'}`} />
              )}
              <span className="truncate">{c.room.split('—')[0].trim()}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="p-5 sm:p-6 space-y-4 sm:space-y-5">
        {/* Disputed Claim Bar */}
        <div>
          <div className="flex items-center justify-between text-xs sm:text-sm text-neutral-500 mb-2">
            <span className="font-semibold text-neutral-900">
              {currentCase.room}
            </span>
            <span className="font-mono text-neutral-600 font-medium">
              Security Deposit: {currentCase.depositTotal}
            </span>
          </div>

          <div className="bg-neutral-50 border border-neutral-200/90 rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm text-neutral-700 leading-relaxed">
            <div className="font-bold text-neutral-900 mb-1">
              Disputed Claim:
            </div>
            <div>{currentCase.claim}</div>
          </div>
        </div>

        {/* Inspection Photo Viewer */}
        <div className="relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-900 shadow-sm">
          <div className="relative h-52 sm:h-60 w-full overflow-hidden">
            <img
              src={currentCase.beforeImage}
              alt={currentCase.room}
              className="w-full h-full object-cover"
            />
            {/* View Mode Selector */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
              <button
                type="button"
                onClick={() => setViewMode('move-in')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  viewMode === 'move-in'
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'bg-black/60 text-white/90 hover:bg-black/80 backdrop-blur-sm'
                }`}
              >
                Day 1 Move-In
              </button>
              <button
                type="button"
                onClick={() => setViewMode('diff')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  viewMode === 'diff'
                    ? 'bg-neutral-900 text-white shadow-sm font-bold border border-white/20'
                    : 'bg-black/60 text-white/90 hover:bg-black/80 backdrop-blur-sm'
                }`}
              >
                AI Diff Analysis
              </button>
              <button
                type="button"
                onClick={() => setViewMode('move-out')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  viewMode === 'move-out'
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'bg-black/60 text-white/90 hover:bg-black/80 backdrop-blur-sm'
                }`}
              >
                Move-Out
              </button>
            </div>

            {/* Geotag & Hash Badge Overlay */}
            <div className="absolute bottom-3 left-3 z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-black/80 backdrop-blur-md text-white text-xs font-mono border border-white/10 shadow-sm">
                <Camera className="w-3.5 h-3.5 text-neutral-300" />
                <span>{currentCase.moveOutDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Automated Inspection Finding */}
        <div className="bg-neutral-50 border border-neutral-200/90 rounded-xl p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-neutral-600 uppercase tracking-wider">
              Inspection Finding
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-neutral-200 text-neutral-800 font-medium text-xs">
              Cryptographic Baseline Verified
            </span>
          </div>
          <p className="text-neutral-800 text-xs sm:text-sm leading-relaxed">
            {currentCase.finding}
          </p>
        </div>

        {/* Verified Resolution Box */}
        <div className="bg-neutral-900 text-white rounded-xl p-4 sm:p-5 flex items-start gap-4 shadow-sm border border-neutral-800">
          <div className="w-10 h-10 rounded-lg bg-neutral-800 text-white flex items-center justify-center shrink-0 mt-0.5 border border-neutral-700">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
              <span className="text-sm sm:text-base font-bold text-white">
                {currentCase.finalSettlement}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-0.5 rounded-md font-mono">
                {currentCase.tenantRefund} refunded
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              {currentCase.contractVerdict}
            </p>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="pt-1 flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-100">
          <span className="font-medium text-neutral-600">
            Automated escrow release
          </span>
          <span className="font-medium text-neutral-600">
            Zero arbitration delays
          </span>
        </div>
      </div>
    </div>
  );
};
