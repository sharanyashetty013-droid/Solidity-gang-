import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  FileText,
  Camera,
  ClipboardList,
  Scale,
  LogOut,
  ShieldCheck,
  Search,
  Plus,
  Bell,
  AlertTriangle,
  ArrowRight,
  Lock,
  Clock,
  Check,
  ExternalLink,
} from 'lucide-react';

/* ---------- SAMPLE DATA (replaced by real wallet/contract data later) ---------- */
const SEPOLIA_CHAIN_ID = '0xaa36a7';
// SAMPLE: will come from the uploaded agreement later
const agreement = { claimPeriodDays: 14 };
// SAMPLE: set to true to preview how a fresh wallet looks
const PREVIEW_EMPTY = false;
// SAMPLE: set to true to preview the loading skeleton
const PREVIEW_LOADING = false;
const sample = {
  address: '0x12ab…89cd',
  chainId: '0xaa36a7', // change to '0x1' to preview the wrong-network warning
  role: 'Tenant' as 'Tenant' | 'Landlord',
};

const actionNeeded = {
  Tenant: {
    title: 'Sign move-out report',
    detail: 'Your landlord has uploaded the move-out photos. Review and sign to start the claim window.',
    button: 'Review & sign',
  },
  Landlord: {
    title: 'Respond to claim',
    detail: 'The tenant has disputed one item. Add evidence before the window closes.',
    button: 'Respond',
  },
};

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Agreements', icon: FileText },
  { name: 'Evidence', icon: Camera },
  { name: 'Claims', icon: ClipboardList },
  { name: 'Disputes', icon: Scale },
];

/* ---------- SIDEBAR ---------- */
const Sidebar: React.FC = () => {
  const [active, setActive] = useState('Dashboard');

  return (
    <aside className="w-64 shrink-0 bg-white rounded-3xl p-5 flex flex-col justify-between shadow-sm">
      <div>
        <div className="flex items-center gap-2 px-2 mb-8">
         <img src="/logo.jpeg" alt="Walls Don't Lie logo" className="w-10 h-10 rounded-xl object-cover mix-blend-multiply" />
          <span className="text-lg font-bold text-[#1B1340]">Walls Don't Lie</span>
        </div>

        <nav className="flex flex-col gap-2">
          {menuItems.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => setActive(name)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                active === name
                  ? 'bg-[#6C3CF0] text-white shadow-md'
                  : 'text-[#8A86A3] hover:bg-[#F3EFFF]'
              }`}
            >
              <Icon className="w-5 h-5" />
              {name}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-[#F3EFFF] rounded-2xl p-4 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-[#6C3CF0]/15 flex items-center justify-center">
          <ShieldCheck className="w-7 h-7 text-[#6C3CF0]" />
        </div>
        <p className="mt-2 text-sm font-semibold text-[#1B1340]">{sample.address}</p>
        <p className="text-xs text-[#8A86A3]">Role: {sample.role}</p>
        <button className="mt-3 w-full py-2 rounded-xl bg-white text-xs font-semibold text-[#6C3CF0]">
          View profile
        </button>
        <button className="mt-2 flex items-center justify-center gap-2 w-full text-xs text-[#8A86A3]">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  );
};

/* ---------- TOP BAR ---------- */
const TopBar: React.FC = () => {
  const isSepolia = sample.chainId === SEPOLIA_CHAIN_ID;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-[#1B1340]">Dashboard</h1>

        <div className="flex flex-wrap items-center gap-3">
          {/* Network + wallet chip */}
          <div className="flex items-center gap-2 bg-white rounded-full pl-3 pr-4 py-2 shadow-sm text-xs font-semibold text-[#1B1340]">
            <span
              className={`w-2 h-2 rounded-full ${isSepolia ? 'bg-emerald-500' : 'bg-amber-500'}`}
            />
            <span>{isSepolia ? 'Sepolia' : 'Wrong network'}</span>
            <span className="text-[#8A86A3]">|</span>
            <span>{sample.address}</span>
          </div>

          <button className="relative w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
            <Bell className="w-5 h-5 text-[#1B1340]" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#6C3CF0]" />
          </button>

          <button className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#6C3CF0] hover:bg-[#5A2DD8] text-white text-sm font-semibold shadow-md transition-colors">
            <Plus className="w-4 h-4" /> Create agreement
          </button>
        </div>
      </div>

      {/* Wrong network warning */}
      {!isSepolia && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            You're not on Sepolia. Switch networks to use the escrow.
          </span>
          <button className="px-3 py-1.5 rounded-full bg-amber-500 text-white text-xs font-semibold">
            Switch network
          </button>
        </div>
      )}

      {/* Search */}
      <div className="mt-5 flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm">
        <Search className="w-5 h-5 text-[#8A86A3]" />
        <input
          type="text"
          placeholder="Search agreements, claims, evidence..."
          className="flex-1 bg-transparent outline-none text-sm text-[#1B1340] placeholder:text-[#8A86A3]"
        />
      </div>
    </div>
  );
};

/* ---------- ACTION NEEDED CARD ---------- */
const ActionNeededCard: React.FC = () => {
  const action = actionNeeded[sample.role];

  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#6C3CF0] to-[#8C5CFF] text-white p-6 shadow-md flex flex-wrap items-center justify-between gap-4">
      <div className="max-w-xl">
        <p className="text-xs uppercase tracking-wider text-white/70">Action needed</p>
        <h2 className="mt-1 text-xl font-bold">{action.title}</h2>
        <p className="mt-1 text-sm text-white/80">{action.detail}</p>
      </div>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full !bg-white !backdrop-blur-none text-[#6C3CF0] text-sm font-semibold shadow-md hover:scale-105 transition-transform">
        {action.button} <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

/* ---------- STAT CARDS ---------- */
const stats = [
  { label: 'Deposit locked', value: '1.50 ETH', note: 'Held in escrow on Sepolia', icon: Lock },
  { label: 'Claim window', value: `${agreement.claimPeriodDays} days`, note: 'Starts after move-out is signed', icon: Clock },
  { label: 'Open claims', value: '2', note: '1 disputed by tenant', icon: ClipboardList },
];

const StatCards: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    {stats.map(({ label, value, note, icon: Icon }) => (
      <div key={label} className="bg-white rounded-2xl p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#6C3CF0]/20">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-[#8A86A3]">{label}</p>
          <span className="w-9 h-9 rounded-full bg-[#F3EFFF] flex items-center justify-center">
            <Icon className="w-4 h-4 text-[#6C3CF0]" />
          </span>
        </div>
        <p className="mt-3 text-2xl font-bold text-[#1B1340]">{value}</p>
        <p className="mt-1 text-xs text-[#8A86A3]">{note}</p>
      </div>
    ))}
  </div>
);

/* ---------- DEPOSIT TIMELINE ---------- */
const timelineSteps = [
  { label: 'Deposit funded', date: '1 Sep 2026' },
  { label: 'Move-in signed', date: '2 Sep 2026' },
  { label: 'Move-out', date: '9 Oct 2026' },
  { label: 'Claim window', date: `${agreement.claimPeriodDays} days after` },
  { label: 'Deposit released', date: 'Pending' },
];
const currentStep = 2; // index of the step in progress (sample data)

const DepositTimeline: React.FC = () => (
  <div className="bg-white rounded-3xl p-6 shadow-sm">
    <h2 className="text-lg font-bold text-[#1B1340]">Deposit timeline</h2>
    <p className="text-xs text-[#8A86A3] mt-1">Agreement: 2BHK, Indiranagar (sample)</p>

        <div className="mt-3 pt-3 pb-2 px-2 overflow-x-auto">
      <ol className="flex min-w-[560px]">
        {timelineSteps.map((step, i) => {
          const done = i < currentStep;
          const current = i === currentStep;
          return (
            <li key={step.label} className="flex-1 relative flex flex-col items-center text-center">
              {i > 0 && (
                <span
                  className={`absolute top-4 right-1/2 w-full h-0.5 ${
                    i <= currentStep ? 'bg-[#6C3CF0]' : 'bg-[#E4DFF5]'
                  }`}
                />
              )}
              <span
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  done
                    ? 'bg-[#6C3CF0] text-white'
                    : current
                    ? 'bg-white border-2 border-[#6C3CF0] text-[#6C3CF0] ring-4 ring-[#6C3CF0]/25 animate-pulse shadow-[0_0_16px_rgba(108,60,240,0.55)]'
                    : 'bg-[#F3EFFF] text-[#8A86A3]'
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : i + 1}
              </span>
              <p className={`mt-2 text-xs font-semibold ${i <= currentStep ? 'text-[#1B1340]' : 'text-[#8A86A3]'}`}>
                {step.label}
              </p>
              <p className="text-[11px] text-[#8A86A3]">{step.date}</p>
            </li>
          );
        })}
      </ol>
    </div>
  </div>
);

/* ---------- RECENT ACTIVITY ---------- */
const EXPLORER_TX_URL = 'https://sepolia.etherscan.io/tx/';

type Activity = {
  title: string;
  detail: string;
  when: string;
  status: 'Success' | 'Pending';
  tx: string | null; // null = not on-chain yet
};

// Sample data: these hashes are made up, so the links open an
// "unknown transaction" page on Etherscan until real ones are plugged in.
const activity: Activity[] = [
  {
    title: 'Claim raised',
    detail: 'Landlord claimed 1 item: wall scratch',
    when: 'Today',
    status: 'Pending',
    tx: null,
  },
  {
    title: 'Photo hash recorded',
    detail: 'Move-out photos (6) hashed and stored',
    when: 'Yesterday',
    status: 'Success',
    tx: '0x3f9a1c7e5b2d48a60f1e9c3b7a5d2e4f8b6c1a9d7e3f5b2c4a6d8e0f1b3c5a7d',
  },
  {
    title: 'Move-in report signed by both',
    detail: 'Tenant and landlord signed the room condition',
    when: '2 Sep 2026',
    status: 'Success',
    tx: '0xa1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90',
  },
  {
    title: 'Deposit funded',
    detail: '1.50 ETH locked in escrow',
    when: '1 Sep 2026',
    status: 'Success',
    tx: '0x9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b',
  },
];

const shortHash = (h: string) => `${h.slice(0, 10)}…${h.slice(-6)}`;

const RecentActivity: React.FC = () => (
  <div className="bg-white rounded-3xl p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-bold text-[#1B1340]">Recent activity</h2>
      <span className="text-xs font-semibold text-[#6C3CF0]">View all</span>
    </div>

    {PREVIEW_EMPTY && (
      <div className="mt-6 mb-2 flex flex-col items-center text-center text-[#8A86A3]">
        <ClipboardList className="w-8 h-8" />
        <p className="mt-2 text-sm font-semibold text-[#1B1340]">No activity yet</p>
        <p className="text-xs">Create an agreement to get started.</p>
      </div>
    )}
    
        <ul className="mt-4 divide-y divide-[#EFEBFA]">
      {(PREVIEW_EMPTY ? [] : activity).map((item) => (
        
       
      
        <li key={item.title} className="py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#1B1340]">{item.title}</p>
            <p className="text-xs text-[#8A86A3]">{item.detail}</p>
            <p className="text-[11px] text-[#8A86A3] mt-0.5">{item.when}</p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-semibold ${
                item.status === 'Success' ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {item.status}
            </span>

            {item.tx ? (
              <a
                href={EXPLORER_TX_URL + item.tx}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F3EFFF] text-xs font-semibold text-[#6C3CF0] hover:bg-[#E8E0FF] transition-colors"
              >
                {shortHash(item.tx)}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="px-3 py-1.5 rounded-full bg-[#F7F5FF] text-xs text-[#8A86A3]">
                Awaiting tx
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  </div>
);

/* ---------- EVIDENCE (before / after + AI verdict) ---------- */
// SAMPLE: photos, hashes and the AI result will come from IPFS, the contract and the AI service later
const evidencePhotos = [
  { label: 'Move-in', time: '2 Sep 2026, 10:42', hash: '0x7d3a…c91f' },
  { label: 'Move-out', time: '9 Oct 2026, 11:05', hash: '0x2be8…40a6' },
];
const aiVerdict = {
  flagged: true,
  note: 'Possible scratch on the living-room wall, lower left.',
};

const EvidenceCard: React.FC = () => (
  <div className="bg-white rounded-3xl p-6 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-lg font-bold text-[#1B1340]">Evidence: Living room</h2>
      <span className="text-xs text-[#8A86A3]">Sample data</span>
    </div>

    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {evidencePhotos.map((p) => (
        <div key={p.label}>
          <div className="h-44 rounded-2xl bg-gradient-to-br from-[#E6DDFB] to-[#F8D6E6] flex flex-col items-center justify-center text-[#8A86A3]">
            <Camera className="w-8 h-8" />
            <span className="mt-2 text-xs">Photo placeholder</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-[#1B1340]">{p.label}</p>
          <p className="text-xs text-[#8A86A3]">{p.time}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-mono text-[#6C3CF0]">
            <ShieldCheck className="w-3.5 h-3.5" /> {p.hash}
          </p>
        </div>
      ))}
    </div>

    <div
      className={`mt-5 rounded-2xl px-4 py-3 text-sm border ${
        aiVerdict.flagged
          ? 'bg-amber-50 border-amber-200 text-amber-900'
          : 'bg-emerald-50 border-emerald-200 text-emerald-900'
      }`}
    >
      <p className="flex items-center gap-2 font-semibold">
        {aiVerdict.flagged ? <AlertTriangle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
        AI check: {aiVerdict.flagged ? 'Changes flagged' : 'No change detected'}
      </p>
      <p className="mt-1 text-xs">{aiVerdict.note}</p>
      <p className="mt-2 text-[11px] opacity-80">
        AI only flags differences. Humans make the final decision.
      </p>
    </div>
  </div>
);

/* ---------- LOADING SKELETON ---------- */
const StatCardsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
    {[0, 1, 2].map((i) => (
      <div key={i} className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="h-3 w-24 rounded bg-[#E6DDFB]" />
          <div className="w-9 h-9 rounded-full bg-[#E6DDFB]" />
        </div>
        <div className="mt-4 h-7 w-28 rounded bg-[#E6DDFB]" />
        <div className="mt-3 h-3 w-36 rounded bg-[#EFEBFA]" />
      </div>
    ))}
  </div>
);

/* ---------- FADE-IN HELPER ---------- */
const FadeIn: React.FC<{ delay?: number; children: React.ReactNode }> = ({ delay = 0, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    {children}
  </motion.div>
);

/* ---------- PAGE ---------- */
export const Dashboard: React.FC = () => {
  return (
    <div className="relative overflow-hidden min-h-screen bg-gradient-to-br from-[#CFC6F5] via-[#E6DDFB] to-[#F8D6E6] p-4 sm:p-8 flex justify-center">
      {/* Glowing blobs behind the glass */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-[#6C3CF0]/40 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-24 w-[380px] h-[380px] rounded-full bg-[#F0507A]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 w-[400px] h-[400px] rounded-full bg-[#8C5CFF]/35 blur-3xl" />

      {/* Glass frame */}
            <div className="relative z-10 w-full max-w-[1440px] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_40px_rgba(108,60,240,0.18)] rounded-[36px] p-4 sm:p-6 flex gap-6 [&_.bg-white]:bg-white/60 [&_.bg-white]:backdrop-blur-xl [&_.bg-white]:border [&_.bg-white]:border-white/70">
        <Sidebar />
        <main className="flex-1 flex flex-col gap-5 min-w-0">
                    <FadeIn><TopBar /></FadeIn>
          <FadeIn delay={0.08}><ActionNeededCard /></FadeIn>
          <FadeIn delay={0.16}>{PREVIEW_LOADING ? <StatCardsSkeleton /> : <StatCards />}</FadeIn>
          <FadeIn delay={0.24}><DepositTimeline /></FadeIn>
          <FadeIn delay={0.32}><RecentActivity /></FadeIn>
          <FadeIn delay={0.4}><EvidenceCard /></FadeIn>
        </main>
      </div>
    </div>
  );
};