import { useState } from 'react';
import {
  Search,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
} from 'lucide-react';

type ClaimStatus = 'Open' | 'Under Review' | 'Resolved';

interface Claim {
  id: string;
  property: string;
  type: string;
  description: string;
  amount: number;
  status: ClaimStatus;
  date: string;
}

const sampleClaims: Claim[] = [
  {
    id: 'CLM-001',
    property: 'Apartment 204',
    type: 'Property Damage',
    description: 'Damage reported to the kitchen countertop.',
    amount: 12000,
    status: 'Under Review',
    date: '12 Oct 2026',
  },
  {
    id: 'CLM-002',
    property: 'Sunrise Villa',
    type: 'Security Deposit',
    description: 'Request to recover the pending security deposit.',
    amount: 25000,
    status: 'Open',
    date: '10 Oct 2026',
  },
  {
    id: 'CLM-003',
    property: 'Green Heights',
    type: 'Maintenance',
    description: 'Claim for an unresolved plumbing issue.',
    amount: 5000,
    status: 'Resolved',
    date: '08 Oct 2026',
  },
];

const statusStyles: Record<ClaimStatus, string> = {
  Open: 'bg-amber-50 text-amber-700 border-amber-200',
  'Under Review': 'bg-blue-50 text-blue-700 border-blue-200',
  Resolved: 'bg-green-50 text-green-700 border-green-200',
};

export default function Claims() {
  const [claims] = useState<Claim[]>(sampleClaims);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

  const filteredClaims = claims.filter((claim) => {
    const matchesSearch =
      claim.id.toLowerCase().includes(search.toLowerCase()) ||
      claim.property.toLowerCase().includes(search.toLowerCase()) ||
      claim.type.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === 'All' || claim.status === filter;

    return matchesSearch && matchesFilter;
  });

  const totalAmount = claims.reduce((total, claim) => total + claim.amount, 0);
  const openCount = claims.filter((claim) => claim.status === 'Open').length;
  const reviewCount = claims.filter(
    (claim) => claim.status === 'Under Review'
  ).length;
  const resolvedCount = claims.filter(
    (claim) => claim.status === 'Resolved'
  ).length;

  const stats = [
    {
      label: 'Total Claims',
      value: claims.length,
      icon: FileText,
      color: 'bg-pink-50 text-pink-600',
    },
    {
      label: 'Open Claims',
      value: openCount,
      icon: AlertCircle,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Under Review',
      value: reviewCount,
      icon: Clock,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Resolved',
      value: resolvedCount,
      icon: CheckCircle2,
      color: 'bg-green-50 text-green-600',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page heading */}
      <div>
        <p className="text-sm font-medium text-[#E0218A]">
          RENTAL MANAGEMENT
        </p>
        <h1 className="mt-1 text-3xl font-bold text-[#111111]">
          Claims
        </h1>
        <p className="mt-2 text-sm text-[#6B6B6B]">
          Track, review, and manage rental-related claims in one place.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#6B6B6B]">
                  {stat.label}
                </p>
                <div className={`rounded-xl p-2.5 ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>

              <p className="mt-4 text-3xl font-bold text-[#111111]">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Claims list */}
      <div className="rounded-3xl border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur-xl sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-xl font-bold text-[#111111]">
              All Claims
            </h2>
            <p className="mt-1 text-sm text-[#6B6B6B]">
              Review claim details and check their current status.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search claims..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white/80 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#E0218A] sm:w-56"
              />
            </div>

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-xl border border-gray-200 bg-white/80 px-3 py-2.5 text-sm outline-none focus:border-[#E0218A]"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Under Review">Under Review</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {filteredClaims.length > 0 ? (
            filteredClaims.map((claim) => (
              <div
                key={claim.id}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-100 bg-white/60 p-4 transition hover:border-pink-200 sm:flex-row sm:items-center"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-pink-50 p-3 text-[#E0218A]">
                    <FileText size={22} />
                  </div>

                  <div>
                    <h3 className="font-bold text-[#111111]">
                      {claim.property}
                    </h3>
                    <p className="mt-1 text-sm text-[#6B6B6B]">
                      {claim.type} · {claim.id}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Filed on {claim.date}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                  <div className="sm:text-right">
                    <p className="text-xs text-[#6B6B6B]">
                      Claim Amount
                    </p>
                    <p className="mt-1 font-bold text-[#111111]">
                      ₹{claim.amount.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${statusStyles[claim.status]}`}
                  >
                    {claim.status}
                  </span>

                  <button
                    type="button"
                    onClick={() => setSelectedClaim(claim)}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-[#111111] transition hover:border-[#E0218A] hover:text-[#E0218A]"
                  >
                    <Eye size={16} />
                    View
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center">
              <FileText className="mx-auto text-gray-400" size={32} />
              <p className="mt-3 font-semibold text-[#111111]">
                No claims found
              </p>
              <p className="mt-1 text-sm text-[#6B6B6B]">
                Try changing your search or status filter.
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 border-t border-gray-100 pt-4">
          <p className="text-sm text-[#6B6B6B]">
            Total claim amount:{' '}
            <span className="font-bold text-[#111111]">
              ₹{totalAmount.toLocaleString('en-IN')}
            </span>
          </p>
        </div>
      </div>

      {/* Claim details modal */}
      {selectedClaim && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setSelectedClaim(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="claim-modal-title"
            className="w-full max-w-lg rounded-3xl border border-white/60 bg-white p-6 shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#E0218A]">
                  {selectedClaim.id}
                </p>
                <h2
                  id="claim-modal-title"
                  className="mt-1 text-2xl font-bold text-[#111111]"
                >
                  Claim Details
                </h2>
              </div>

              <button
                type="button"
                aria-label="Close claim details"
                onClick={() => setSelectedClaim(null)}
                className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 hover:text-black"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm text-[#6B6B6B]">Property</p>
                <p className="mt-1 font-semibold text-[#111111]">
                  {selectedClaim.property}
                </p>
              </div>

              <div>
                <p className="text-sm text-[#6B6B6B]">Claim Type</p>
                <p className="mt-1 font-semibold text-[#111111]">
                  {selectedClaim.type}
                </p>
              </div>

              <div>
                <p className="text-sm text-[#6B6B6B]">Description</p>
                <p className="mt-1 text-sm leading-6 text-[#333333]">
                  {selectedClaim.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs text-[#6B6B6B]">Claim Amount</p>
                  <p className="mt-2 font-bold text-[#111111]">
                    ₹{selectedClaim.amount.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs text-[#6B6B6B]">Status</p>
                  <span
                    className={`mt-2 inline-block rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[selectedClaim.status]}`}
                  >
                    {selectedClaim.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-[#6B6B6B]">Filed On</p>
                <p className="mt-1 font-semibold text-[#111111]">
                  {selectedClaim.date}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedClaim(null)}
              className="mt-7 w-full rounded-xl bg-[#E0218A] px-4 py-3 font-semibold text-white transition hover:bg-[#C91A78]"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}