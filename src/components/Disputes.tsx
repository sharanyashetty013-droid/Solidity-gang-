import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Users, ArrowRight, Check, AlertTriangle } from 'lucide-react';
import { PageShell, FadeIn } from './Dashboard';

/* ---------- SAMPLE DATA (replaced by contract data later) ---------- */
type Status = 'Open' | 'In arbitration' | 'Resolved';
type Response = 'Accepted' | 'Disputed';
type Vote = 'Tenant' | 'Landlord' | 'Pending';

type ClaimItem = { name: string; amount: number };
type Dispute = {
  id: string;
  title: string;
  room: string;
  raised: string;
  status: Status;
  items: ClaimItem[];
  outcome?: string;
};
type Arbitrator = { address: string; stake: string; vote: Vote };

const DEPOSIT_ETH = 1.5;

const disputes: Dispute[] = [
  {
    id: 'D-102',
    title: 'Wall scratch',
    room: 'Living room',
    raised: 'Today',
    status: 'Open',
    items: [{ name: 'Repaint lower-left wall', amount: 0.2 }],
  },
  {
    id: 'D-101',
    title: 'Carpet stain',
    room: 'Bedroom',
    raised: 'Yesterday',
    status: 'In arbitration',
    items: [
      { name: 'Carpet cleaning', amount: 0.1 },
      { name: 'Replacement patch', amount: 0.05 },
    ],
  },
  {
    id: 'D-099',
    title: 'Cleaning fee',
    room: 'Kitchen',
    raised: '12 Aug 2026',
    status: 'Resolved',
    items: [{ name: 'Deep clean', amount: 0.05 }],
    outcome: 'Landlord upheld by 2 of 3 votes. 0.05 ETH goes to the landlord.',
  },
];

const arbitratorsByDispute: Record<string, Arbitrator[]> = {
  'D-101': [
    { address: '0x91c4…2ab7', stake: '0.50 ETH', vote: 'Tenant' },
    { address: '0x5e08…ff31', stake: '0.50 ETH', vote: 'Landlord' },
    { address: '0xa3d7…09c2', stake: '0.50 ETH', vote: 'Pending' },
  ],
  'D-099': [
    { address: '0x91c4…2ab7', stake: '0.50 ETH', vote: 'Landlord' },
    { address: '0x5e08…ff31', stake: '0.50 ETH', vote: 'Landlord' },
    { address: '0xb7a2…1d44', stake: '0.50 ETH', vote: 'Tenant' },
  ],
};

const statusStyle: Record<Status, string> = {
  Open: 'bg-amber-100 text-amber-700',
  'In arbitration': 'bg-[#E0218A]/10 text-[#E0218A]',
  Resolved: 'bg-emerald-100 text-emerald-700',
};

const sumItems = (items: ClaimItem[]) => items.reduce((s, i) => s + i.amount, 0);

/* ---------- PAGE ---------- */
export const DisputesPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(disputes[0].id);
  const [responses, setResponses] = useState<Record<string, Response>>({});

  const selected = disputes.find((d) => d.id === selectedId) ?? disputes[0];
  const arbitrators = arbitratorsByDispute[selected.id] ?? [];
  const totalClaimed = disputes.reduce((s, d) => s + sumItems(d.items), 0);
  const count = (s: Status) => disputes.filter((d) => d.status === s).length;

  return (
    <PageShell role="Tenant">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h1 className="text-3xl font-bold text-[#111111]">Disputes</h1>
        <span className="text-xs text-[#6B6B6B]">Sample data</span>
      </div>

      {/* Summary */}
      <FadeIn>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Open', value: String(count('Open')) },
            { label: 'In arbitration', value: String(count('In arbitration')) },
            { label: 'Resolved', value: String(count('Resolved')) },
            {
              label: 'Claimed so far',
              value: `${totalClaimed.toFixed(2)} / ${DEPOSIT_ETH.toFixed(2)} ETH`,
            },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-medium text-[#6B6B6B]">{s.label}</p>
              <p className="mt-1 text-lg font-bold text-[#111111]">{s.value}</p>
            </div>
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={0.08}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* List */}
          <div className="bg-white rounded-3xl p-4 shadow-sm lg:col-span-2 self-start">
            <h2 className="px-2 pt-1 pb-3 text-lg font-bold text-[#111111]">All disputes</h2>
            <ul className="flex flex-col gap-2">
              {disputes.map((d) => (
                <li key={d.id}>
                  <button
                    onClick={() => setSelectedId(d.id)}
                    className={`w-full text-left rounded-2xl px-4 py-3 border transition-colors ${
                      d.id === selected.id
                        ? 'bg-[#E0218A]/10 border-[#E0218A]/30'
                        : 'border-transparent hover:bg-black/5'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[#111111]">{d.title}</p>
                      <span
                        className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusStyle[d.status]}`}
                      >
                        {d.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[#6B6B6B]">
                      {d.id} · {d.room} · {d.raised}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[#111111]">
                      {sumItems(d.items).toFixed(2)} ETH
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Detail */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#E0218A]">
                    {selected.id}
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-[#111111]">
                    {selected.title} · {selected.room}
                  </h2>
                  <p className="text-xs text-[#6B6B6B]">Raised by landlord · {selected.raised}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle[selected.status]}`}
                >
                  {selected.status}
                </span>
              </div>

              {/* Itemized claim */}
              <ul className="mt-4 divide-y divide-black/5">
                {selected.items.map((item) => (
                  <li key={item.name} className="py-2.5 flex items-center justify-between text-sm">
                    <span className="text-[#111111]">{item.name}</span>
                    <span className="font-semibold text-[#111111]">{item.amount.toFixed(2)} ETH</span>
                  </li>
                ))}
                <li className="py-2.5 flex items-center justify-between text-sm">
                  <span className="font-semibold text-[#6B6B6B]">Total claimed</span>
                  <span className="font-bold text-[#111111]">
                    {sumItems(selected.items).toFixed(2)} ETH
                  </span>
                </li>
              </ul>

              <button
                onClick={() => navigate('/evidence')}
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#E0218A] hover:underline"
              >
                View evidence <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Tenant response (only while the claim is open) */}
              {selected.status === 'Open' && (
                <div className="mt-5 border-t border-black/5 pt-4">
                  <p className="text-sm font-semibold text-[#111111]">Your response</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button
                      onClick={() => setResponses((r) => ({ ...r, [selected.id]: 'Accepted' }))}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#111111] hover:bg-black text-white text-sm font-semibold transition-colors"
                    >
                      <Check className="w-4 h-4" /> Accept claim
                    </button>
                    <button
                      onClick={() => setResponses((r) => ({ ...r, [selected.id]: 'Disputed' }))}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/70 border border-black/10 hover:bg-black/5 text-[#111111] text-sm font-semibold transition-colors"
                    >
                      <AlertTriangle className="w-4 h-4" /> Dispute claim
                    </button>
                  </div>
                  {responses[selected.id] && (
                    <p className="mt-3 text-xs text-[#6B6B6B]">
                      You marked this claim as{' '}
                      <span className="font-semibold text-[#111111]">{responses[selected.id]}</span>.
                      Preview only, nothing is sent on-chain yet.
                    </p>
                  )}
                </div>
              )}

              {selected.outcome && (
                <div className="mt-5 rounded-2xl px-4 py-3 text-sm border bg-emerald-50 border-emerald-200 text-emerald-900">
                  <p className="font-semibold">Outcome</p>
                  <p className="mt-1 text-xs">{selected.outcome}</p>
                </div>
              )}
            </div>

            {/* Arbitrators */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#E0218A]" />
                <h2 className="text-lg font-bold text-[#111111]">Arbitrators</h2>
              </div>

              {arbitrators.length === 0 ? (
                <div className="mt-4 flex flex-col items-center text-center text-[#6B6B6B]">
                  <Scale className="w-8 h-8" />
                  <p className="mt-2 text-sm font-semibold text-[#111111]">Not assigned yet</p>
                  <p className="text-xs">
                    Staked arbitrators are picked if the tenant disputes this claim.
                  </p>
                </div>
              ) : (
                <ul className="mt-4 divide-y divide-black/5">
                  {arbitrators.map((a) => (
                    <li key={a.address} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#111111] font-mono">{a.address}</p>
                        <p className="text-xs text-[#6B6B6B]">Staked {a.stake}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          a.vote === 'Pending'
                            ? 'bg-black/5 text-[#6B6B6B]'
                            : 'bg-[#E0218A]/10 text-[#E0218A]'
                        }`}
                      >
                        {a.vote === 'Pending' ? 'Vote pending' : `Voted: ${a.vote}`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <p className="mt-4 text-[11px] text-[#6B6B6B]">
                AI only flags differences in the photos. Humans, including staked arbitrators, make the
                final decision.
              </p>
            </div>
          </div>
        </div>
      </FadeIn>
    </PageShell>
  );
};
