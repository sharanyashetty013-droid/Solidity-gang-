import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, Camera, Check, FileText } from 'lucide-react';

interface DisputeCase {
  id: string;
  room: string;
  claim: string;
  depositTotal: string;
  landlordAsked: string;
  finalSettlement: string;
  tenantRefund: string;
  deduction: string;
  resolutionTime: string;
  status: 'clean' | 'minor';
  beforeImage: string;
  afterImage: string;
  moveInDate: string;
  moveOutDate: string;
  finding: string;
  contractVerdict: string;
}

const CASES: DisputeCase[] = [
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
    moveInDate: 'Sep 1, 2025 · Hash 0x9a3f',
    moveOutDate: 'Aug 31, 2026 · Hash 0x81b2',
    beforeImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80',
    afterImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80',
    finding: 'Move-in photo baseline confirmed pre-existing microscopic paint fading. Classified as legal normal wear.',
    contractVerdict: '$2,400 deposit returned in full to tenant automatically.'
  },
  {
    id: 'case-2',
    room: 'Hardwood Floor — Hallway',
    claim: 'Landlord demanded entire $2,500 deposit for floor replacement.',
    depositTotal: '$2,500.00',
    landlordAsked: '$2,500.00',
    deduction: '$85.00',
    tenantRefund: '$2,415.00',
    finalSettlement: 'Settled: Single scratch itemized',
    resolutionTime: 'Resolved via photo proof',
    status: 'minor',
    moveInDate: 'Oct 15, 2025 · Hash 0x4f12',
    moveOutDate: 'Oct 14, 2026 · Hash 0x7c90',
    beforeImage: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=700&q=80',
    afterImage: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=700&q=80',
    finding: 'Single 4-inch surface scratch verified against move-in baseline. Independent contractor repair quote fixed at $85.',
    contractVerdict: '$85 paid to landlord for buffing; remaining $2,415 returned to tenant.'
  }
];

export const RealProofInspectionCard: React.FC = () => {
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'move-in' | 'move-out' | 'comparison'>('comparison');
  const activeCase = CASES[selectedCaseIndex];

  return (
    <div className="w-full max-w-[540px] bg-white rounded-3xl border border-black/10 shadow-[0_16px_40px_rgba(0,0,0,0.06)] overflow-hidden text-left flex flex-col font-sans">
      {/* Soft header with pink accent */}
      <div className="bg-[#FAF7F9] px-5 py-4 border-b border-black/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E0218A]" />
          <span className="text-xs font-bold text-[#111111] tracking-wide">
            Verified Inspection Audit
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-black/10 text-[#111111] text-xs font-medium shadow-xs">
          <FileText className="w-3.5 h-3.5 text-[#E0218A]" />
          <span>Case #{activeCase.id.slice(-1)}</span>
        </div>
      </div>

      {/* Case Switcher Tabs */}
      <div className="p-3 bg-[#FDFBFD] border-b border-black/5 flex gap-2">
        {CASES.map((c, i) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedCaseIndex(i)}
            className={`flex-1 py-2 px-3 rounded-2xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedCaseIndex === i
                ? 'bg-white text-[#111111] shadow-sm border border-black/10'
                : 'text-neutral-500 hover:text-neutral-800 hover:bg-black/5'
            }`}
          >
            {c.status === 'clean' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span className="truncate">{c.room.split('—')[0]}</span>
          </button>
        ))}
      </div>

      {/* Main Inspection Viewfinder Body */}
      <div className="p-5 space-y-4">
        {/* Location & Claim Description */}
        <div>
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
            <span className="font-semibold text-neutral-900">
              {activeCase.room}
            </span>
            <span className="text-xs text-neutral-500">Deposit: {activeCase.depositTotal}</span>
          </div>
          <div className="text-xs text-neutral-700 leading-snug bg-[#FFF8FA] border border-[#E0218A]/15 rounded-xl p-2.5">
            <strong className="text-[#111111] font-semibold">Disputed claim: </strong>
            {activeCase.claim}
          </div>
        </div>

        {/* Clean Photo Evidence Box with at most two top buttons */}
        <div className="relative rounded-2xl overflow-hidden border border-black/10 bg-neutral-100 shadow-inner">
          <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-neutral-900">
            <img
              src={activeCase.beforeImage}
              alt={activeCase.room}
              className="w-full h-full object-cover"
            />

            {/* Exactly two top badges/toggles as requested */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'move-in' ? 'move-out' : 'move-in')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  viewMode === 'move-in'
                    ? 'bg-white text-[#111111] shadow-sm'
                    : 'bg-white/80 text-neutral-700 hover:bg-white backdrop-blur-sm'
                }`}
              >
                {viewMode === 'move-in' ? 'Day 1 Move-in' : 'Move-out'}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('comparison')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  viewMode === 'comparison'
                    ? 'bg-[#E0218A] text-white shadow-sm'
                    : 'bg-white/80 text-neutral-700 hover:bg-white backdrop-blur-sm'
                }`}
              >
                AI Diff
              </button>
            </div>
          </div>
        </div>

        {/* Caption and hash MOVED OUT of the image into a clean small row below */}
        <div className="flex items-center justify-between text-xs text-neutral-500 px-1 pt-0.5">
          <div className="flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-[#E0218A]" />
            <span className="font-medium text-neutral-700">
              {viewMode === 'move-in' ? activeCase.moveInDate : activeCase.moveOutDate}
            </span>
          </div>
          <span className="text-neutral-500 font-medium">
            {viewMode === 'comparison' ? '99.4% alignment matched' : 'Verified baseline'}
          </span>
        </div>

        {/* Objective Finding Card */}
        <div className="bg-[#FAF7F9] border border-black/5 rounded-2xl p-3.5 text-xs space-y-1">
          <div className="flex items-center justify-between font-semibold text-neutral-800 text-xs">
            <span className="text-neutral-500">Inspection finding</span>
            <span className="text-[#E0218A] font-semibold text-xs">
              Tamper-evident photos
            </span>
          </div>
          <p className="text-neutral-600 text-xs leading-relaxed">
            {activeCase.finding}
          </p>
        </div>

        {/* Final Result Card - Fully visible and never clipped */}
        <div className="bg-[#F4FAF6] border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold text-emerald-950">
                {activeCase.finalSettlement}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                {activeCase.tenantRefund} returned
              </span>
            </div>
            <p className="text-xs text-emerald-800/90 mt-1 leading-snug">
              {activeCase.contractVerdict}
            </p>
          </div>
        </div>
      </div>

      {/* Footer strip */}
      <div className="px-5 py-3 bg-[#FAF7F9] border-t border-black/5 flex items-center justify-between text-xs text-neutral-500">
        <span className="flex items-center gap-1.5 font-medium">
          <Check className="w-3.5 h-3.5 text-[#E0218A]" /> Evidence-based settlement
        </span>
        <span className="text-neutral-700 font-medium">0 phone calls · 0 court fees</span>
      </div>
    </div>
  );
};

export default RealProofInspectionCard;
