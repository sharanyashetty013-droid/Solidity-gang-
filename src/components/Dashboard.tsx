import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Home,
} from 'lucide-react';

/*
  Theme (matches the landing page):
  pink  #E0218A  -> small accents only (active tab, timeline, links, dots)
  black #111111  -> buttons and text
  muted #6B6B6B  -> secondary text
  background: off-white with a soft pink gradient, glass (see-through) cards
*/

/* ---------- SAMPLE DATA (replaced by real wallet/contract data later) ---------- */
const SEPOLIA_CHAIN_ID = '0xaa36a7';
// SAMPLE: will come from the uploaded agreement later
const agreement = { claimPeriodDays: 14 };
// SAMPLE: set to true to preview how a fresh wallet looks
const PREVIEW_EMPTY = false;
// SAMPLE: set to true to preview the loading skeleton
const PREVIEW_LOADING = false;

type Role = 'Tenant' | 'Landlord';

const sample = {
  address: '0x12ab…89cd',
  chainId: '0xaa36a7', // change to '0x1' to preview the wrong-network warning
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
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Agreements', path: '/agreements', icon: FileText },
  { name: 'Evidence', path: '/evidence', icon: Camera },
  { name: 'Claims', path: '/claims', icon: ClipboardList },
  { name: 'Disputes', path: '/disputes', icon: Scale },
];

/* ---------- SIDEBAR ---------- */
const Sidebar: React.FC<{ role: Role }> = ({ role }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // exact match, or a sub-page of it (e.g. /evidence/123)
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <aside className="w-64 shrink-0 bg-white rounded-3xl p-5 flex flex-col justify-between shadow-sm">
      <div>
        <div className="flex items-center gap-2 px-2 mb-8">
          <img
            src="/logo.jpeg"
            alt="Walls Don't Lie logo"
            className="w-10 h-10 rounded-xl object-cover mix-blend-multiply"
          />
          <span className="text-lg font-bold text-[#111111]">Walls Don't Lie</span>
        </div>

        <nav className="flex flex-col gap-2">
          {menuItems.map(({ name, path, icon: Icon }) => (
            <button
              key={name}
              onClick={() => navigate(path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                isActive(path)
                  ? 'bg-[#E0218A] text-white shadow-md'
                  : 'text-[#6B6B6B] hover:bg-black/5'
              }`}
            >
              <Icon className="w-5 h-5" />
              {name}
            </button>
          ))}
        </nav>
      </div>

      <div>
        <button
          onClick={() => navigate('/')}
          className="mb-4 w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-[#111111] bg-white/70 border border-white hover:bg-black/5 transition-colors"
        >
          <Home className="w-5 h-5" />
          Back to home
        </button>

        <div className="bg-white/50 border border-white/70 rounded-2xl p-4 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#E0218A]/10 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-[#E0218A]" />
          </div>
          <p className="mt-2 text-sm font-semibold text-[#111111]">{sample.address}</p>
          <p className="text-xs text-[#6B6B6B]">Role: {role}</p>
          <button className="mt-3 w-full py-2 rounded-xl bg-[#111111] hover:bg-black text-xs font-semibold text-white transition-colors">
            View profile
          </button>
          <button className="mt-2 flex items-center justify-center gap-2 w-full text-xs text-[#6B6B6B]">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
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
        <h1 className="text-3xl font-bold text-[#111111]">Dashboard</h1>

        <div className="flex flex-wrap items-center gap-3">
          {/* Network + wallet chip */}
          <div className="flex items-center gap-2 bg-white rounded-full pl-3 pr-4 py-2 shadow-sm text-xs font-semibold text-[#111111]">
            <span
              className={`w-2 h-2 rounded-full ${isSepolia ? 'bg-emerald-500' : 'bg-amber-500'}`}
            />
            <span>{isSepolia ? 'Sepolia' : 'Wrong network'}</span>
            <span className="text-[#6B6B6B]">|</span>
            <span>{sample.address}</span>
          </div>

          <button className="relative w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
            <Bell className="w-5 h-5 text-[#111111]" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#E0218A]" />
          </button>

          <button className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#111111] hover:bg-black text-white text-sm font-semibold shadow-md transition-colors">
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
        <Search className="w-5 h-5 text-[#6B6B6B]" />
        <input
          type="text"
          placeholder="Search agreements, claims, evidence..."
          className="flex-1 bg-transparent outline-none text-sm text-[#111111] placeholder:text-[#6B6B6B]"
        />
      </div>
    </div>
  );
};

/* ---------- ACTION NEEDED CARD ---------- */
const ActionNeededCard: React.FC<{ role: Role }> = ({ role }) => {
  const action = actionNeeded[role];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-start gap-4 max-w-xl">
        <span className="mt-1 w-10 h-10 shrink-0 rounded-full bg-[#E0218A]/10 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-[#E0218A]" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#E0218A]">Action needed</p>
          <h2 className="mt-1 text-xl font-bold text-[#111111]">{action.title}</h2>
          <p className="mt-1 text-sm text-[#6B6B6B]">{action.detail}</p>
        </div>
      </div>
      <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#111111] hover:bg-black text-white text-sm font-semibold shadow-md hover:scale-105 transition-all">
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
      <div
        key={label}
        className="bg-white rounded-2xl p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#E0218A]/15"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-[#6B6B6B]">{label}</p>
          <span className="w-9 h-9 rounded-full bg-[#E0218A]/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-[#E0218A]" />
          </span>
        </div>
        <p className="mt-3 text-2xl font-bold text-[#111111]">{value}</p>
        <p className="mt-1 text-xs text-[#6B6B6B]">{note}</p>
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
    <h2 className="text-lg font-bold text-[#111111]">Deposit timeline</h2>
    <p className="text-xs text-[#6B6B6B] mt-1">Agreement: 2BHK, Indiranagar (sample)</p>

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
                    i <= currentStep ? 'bg-[#E0218A]' : 'bg-black/10'
                  }`}
                />
              )}
              <span
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  done
                    ? 'bg-[#E0218A] text-white'
                    : current
                    ? '!bg-white !backdrop-blur-none border-2 border-[#E0218A] text-[#E0218A] ring-4 ring-[#E0218A]/20 shadow-[0_0_16px_rgba(224,33,138,0.45)]'
                    : 'bg-black/5 text-[#6B6B6B]'
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : i + 1}
              </span>
              <p className={`mt-2 text-xs font-semibold ${i <= currentStep ? 'text-[#111111]' : 'text-[#6B6B6B]'}`}>
                {step.label}
              </p>
              <p className="text-[11px] text-[#6B6B6B]">{step.date}</p>
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
      <h2 className="text-lg font-bold text-[#111111]">Recent activity</h2>
      <span className="text-xs font-semibold text-[#E0218A]">View all</span>
    </div>

    {PREVIEW_EMPTY && (
      <div className="mt-6 mb-2 flex flex-col items-center text-center text-[#6B6B6B]">
        <ClipboardList className="w-8 h-8" />
        <p className="mt-2 text-sm font-semibold text-[#111111]">No activity yet</p>
        <p className="text-xs">Create an agreement to get started.</p>
      </div>
    )}

    <ul className="mt-4 divide-y divide-black/5">
      {(PREVIEW_EMPTY ? [] : activity).map((item) => (
        <li key={item.title} className="py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#111111]">{item.title}</p>
            <p className="text-xs text-[#6B6B6B]">{item.detail}</p>
            <p className="text-[11px] text-[#6B6B6B] mt-0.5">{item.when}</p>
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
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#E0218A]/10 text-xs font-semibold text-[#E0218A] hover:bg-[#E0218A]/20 transition-colors"
              >
                {shortHash(item.tx)}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="px-3 py-1.5 rounded-full bg-black/5 text-xs text-[#6B6B6B]">
                Awaiting tx
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  </div>
);

/* ---------- EVIDENCE DATA (before / after + AI verdict) ---------- */
// SAMPLE: photos, hashes and the AI result will come from IPFS, the contract and the AI service later
const evidencePhotos = [
  { label: 'Move-in', time: '2 Sep 2026, 10:42', hash: '0x7d3a…c91f' },
  { label: 'Move-out', time: '9 Oct 2026, 11:05', hash: '0x2be8…40a6' },
];
const aiVerdict = {
  flagged: true,
  count: 1,
  note: 'Possible scratch on the living-room wall, lower left.',
};

/* Small strip shown on the dashboard; the full card lives on the Evidence page */
const EvidenceStrip: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl px-5 py-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span
          className={`w-9 h-9 rounded-full flex items-center justify-center ${
            aiVerdict.flagged ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          {aiVerdict.flagged ? <AlertTriangle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
        </span>
        <div>
          <p className="text-sm font-semibold text-[#111111]">
            {aiVerdict.flagged
              ? `${aiVerdict.count} change flagged by AI`
              : 'No changes flagged by AI'}
          </p>
          <p className="text-xs text-[#6B6B6B]">Living room · sample data</p>
        </div>
      </div>
      <button
        onClick={() => navigate('/evidence')}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#111111] hover:bg-black text-white text-xs font-semibold transition-colors"
      >
        View evidence <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

/* Full evidence card (Evidence page) */
const EvidenceCard: React.FC = () => (
  <div className="bg-white rounded-3xl p-6 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-lg font-bold text-[#111111]">Living room</h2>
      <span className="text-xs text-[#6B6B6B]">Sample data</span>
    </div>

    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {evidencePhotos.map((p) => (
        <div key={p.label}>
          <div className="h-44 rounded-2xl bg-gradient-to-br from-[#FAD0EA]/60 to-white/40 border border-white/70 flex flex-col items-center justify-center text-[#6B6B6B]">
            <Camera className="w-8 h-8" />
            <span className="mt-2 text-xs">Photo placeholder</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-[#111111]">{p.label}</p>
          <p className="text-xs text-[#6B6B6B]">{p.time}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-mono text-[#E0218A]">
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
          <div className="h-3 w-24 rounded bg-black/10" />
          <div className="w-9 h-9 rounded-full bg-black/10" />
        </div>
        <div className="mt-4 h-7 w-28 rounded bg-black/10" />
        <div className="mt-3 h-3 w-36 rounded bg-black/5" />
      </div>
    ))}
  </div>
);

/* ---------- FADE-IN HELPER ---------- */
export const FadeIn: React.FC<{ delay?: number; children: React.ReactNode }> = ({ delay = 0, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    {children}
  </motion.div>
);

/* ---------- SHARED PAGE SHELL (background + glass frame + sidebar) ---------- */
export const PageShell: React.FC<{ role: Role; children: React.ReactNode }> = ({ role, children }) => (
  <div className="relative overflow-hidden min-h-screen bg-gradient-to-br from-[#F7F7F7] via-[#FBEAF3] to-[#FAD0EA] p-4 sm:p-8 flex justify-center">
    {/* Soft pink glow behind the glass */}
    <div className="pointer-events-none absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-[#E0218A]/20 blur-3xl" />
    <div className="pointer-events-none absolute top-1/3 -right-24 w-[380px] h-[380px] rounded-full bg-[#FAD0EA] blur-3xl" />
    <div className="pointer-events-none absolute -bottom-24 left-1/3 w-[400px] h-[400px] rounded-full bg-[#E0218A]/15 blur-3xl" />

    {/* Glass frame: every .bg-white card inside becomes see-through glass */}
    <div className="relative z-10 w-full max-w-[1440px] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_40px_rgba(224,33,138,0.12)] rounded-[36px] p-4 sm:p-6 flex gap-6 [&_.bg-white]:bg-white/60 [&_.bg-white]:backdrop-blur-xl [&_.bg-white]:border [&_.bg-white]:border-white/70">
      <Sidebar role={role} />
      <main className="flex-1 flex flex-col gap-5 min-w-0">{children}</main>
    </div>
  </div>
);

/* ---------- PAGES ---------- */
export const Dashboard: React.FC = () => {
  const [role, setRole] = useState<Role>('Tenant');

  return (
    <PageShell role={role}>
      {/* Preview toggle (demo only) */}
      <div className="self-start flex items-center gap-1 bg-white rounded-full p-1 shadow-sm text-xs font-semibold">
        <span className="px-3 text-[#6B6B6B]">Preview as</span>
        {(['Tenant', 'Landlord'] as Role[]).map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={`px-4 py-1.5 rounded-full transition-colors ${
              role === r ? 'bg-[#111111] text-white shadow-md' : 'text-[#111111] hover:bg-black/5'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <FadeIn><TopBar /></FadeIn>
      <FadeIn delay={0.08}><ActionNeededCard role={role} /></FadeIn>
      <FadeIn delay={0.16}>{PREVIEW_LOADING ? <StatCardsSkeleton /> : <StatCards />}</FadeIn>
      <FadeIn delay={0.24}><DepositTimeline /></FadeIn>
      <FadeIn delay={0.32}><EvidenceStrip /></FadeIn>
      <FadeIn delay={0.4}><RecentActivity /></FadeIn>
    </PageShell>
  );
};

export const EvidencePage: React.FC = () => (
  <PageShell role="Tenant">
    <h1 className="text-3xl font-bold text-[#111111]">Evidence</h1>
    <FadeIn><EvidenceCard /></FadeIn>
  </PageShell>
);

/* Placeholder for sections that are not built yet */
export const ComingSoon: React.FC<{ title: string }> = ({ title }) => (
  <PageShell role="Tenant">
    <h1 className="text-3xl font-bold text-[#111111]">{title}</h1>
    <div className="bg-white rounded-3xl p-10 shadow-sm text-center">
      <p className="text-lg font-bold text-[#111111]">Coming soon</p>
      <p className="mt-1 text-sm text-[#6B6B6B]">This section will be built next.</p>
    </div>
  </PageShell>
);

export const DashboardPageLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <PageShell role="Tenant">
    {children}
  </PageShell>
);

