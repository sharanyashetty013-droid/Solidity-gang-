import React, { useState } from 'react';
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
} from 'lucide-react';

/* ---------- SAMPLE DATA (replaced by real wallet/contract data later) ---------- */
const SEPOLIA_CHAIN_ID = '0xaa36a7';
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
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6C3CF0] to-[#F0507A]" />
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
      <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#6C3CF0] text-sm font-semibold">
        {action.button} <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

/* ---------- PAGE ---------- */
export const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#DDD8EE] p-4 sm:p-8 flex justify-center">
      <div className="w-full max-w-[1440px] bg-[#F7F5FF] rounded-[36px] p-4 sm:p-6 flex gap-6">
        <Sidebar />
        <main className="flex-1 flex flex-col gap-5 min-w-0">
          <TopBar />
          <ActionNeededCard />
          {/* Next: stat cards, deposit timeline, activity, evidence */}
        </main>
      </div>
    </div>
  );
};