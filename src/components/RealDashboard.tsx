import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { formatEther } from 'ethers';
import { FileText, CheckCircle2, ShieldCheck, Lock, Search, ArrowRight } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { readContract, STATES } from '../lib/contract';

type Tab = 'all' | 'tenant' | 'landlord';

const badgeClass = (state: string) =>
  state === 'Settled'
    ? 'bg-emerald-50 text-emerald-700'
    : state === 'Disputed'
    ? 'bg-red-50 text-red-700'
    : state === 'Created'
    ? 'bg-slate-100 text-slate-700'
    : 'bg-pink-50 text-[#E0218A]';

const Stat = ({ icon, label, value, note }: { icon: ReactNode; label: string; value: string; note: string }) => (
  <div className="bg-white rounded-3xl p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <p className="text-sm text-[#6B6B6B]">{label}</p>
      <span className="w-9 h-9 rounded-full bg-pink-50 text-[#E0218A] flex items-center justify-center">{icon}</span>
    </div>
    <p className="mt-3 text-3xl font-bold text-[#111111]">{value}</p>
    <p className="mt-1 text-xs text-[#6B6B6B]">{note}</p>
  </div>
);

export default function RealDashboard() {
  const { address } = useWallet();
  const [list, setList] = useState<any[]>([]);
  const [msg, setMsg] = useState('Loading from Sepolia...');
  const [tab, setTab] = useState<Tab>('all');
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const c = readContract();
        const next = Number(await c.nextId());
        const out: any[] = [];
        for (let i = next - 1; i >= 1; i--) {
          const a = await c.getAgreement(BigInt(i));
          out.push({ id: i, a });
        }
        setList(out);
        setMsg('');
      } catch (e: any) {
        setMsg('Could not load: ' + (e?.shortMessage || e?.message));
      }
    })();
  }, []);

  const me = (address || '').toLowerCase();
  const roleOf = (x: any) =>
    String(x.a[1]).toLowerCase() === me ? 'tenant' : String(x.a[0]).toLowerCase() === me ? 'landlord' : '';
  const stateOf = (x: any): string => STATES[Number(x.a[6])];
  const short = (s: string) => s.slice(0, 6) + '...' + s.slice(-4);

  const mine = list.filter((x) => roleOf(x) !== '');
  const active = mine.filter((x) => stateOf(x) !== 'Settled');
  const settled = mine.length - active.length;
  const locked = active.reduce((t, x) => t + Number(formatEther(x.a[2])), 0);
  const asTenant = mine.filter((x) => roleOf(x) === 'tenant').length;
  const asLandlord = mine.length - asTenant;
  const latest = mine[0];

  const needle = q.trim().toLowerCase().replace('#', '');
  const shown = mine.filter(
    (x) =>
      (tab === 'all' || roleOf(x) === tab) &&
      (!needle ||
        String(x.id) === needle ||
        stateOf(x).toLowerCase().includes(needle) ||
        String(x.a[0]).toLowerCase().includes(needle) ||
        String(x.a[1]).toLowerCase().includes(needle))
  );

  const hintFor = (x: any) => {
    const s = stateOf(x);
    const r = roleOf(x);
    if (s === 'Settled') return 'Deposit released. Nothing left to do.';
    if (s === 'CheckoutRequested')
      return r === 'landlord'
        ? 'Checkout requested. Submit a claim if there is damage.'
        : 'Checkout requested. Waiting for the landlord, or release the funds.';
    return 'Open it to see the next step.';
  };

  const tabs: { key: Tab; label: string; n: number }[] = [
    { key: 'all', label: 'All', n: mine.length },
    { key: 'tenant', label: 'Tenant', n: asTenant },
    { key: 'landlord', label: 'Landlord', n: asLandlord },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#111111]">Your deposits at a glance</h2>
        <p className="mt-1 text-sm text-[#6B6B6B]">
          {mine.length === 0
            ? 'No agreements for this wallet yet.'
            : 'You are the tenant in ' + asTenant + ' and the landlord in ' + asLandlord + ' of your agreements.'}
        </p>
      </div>
      {msg && <p className="text-sm text-[#6B6B6B]">{msg}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={<FileText className="w-4 h-4" />} label="Your agreements" value={String(mine.length)} note="As tenant or landlord" />
        <Stat icon={<ShieldCheck className="w-4 h-4" />} label="Active" value={String(active.length)} note="Not settled yet" />
        <Stat icon={<CheckCircle2 className="w-4 h-4" />} label="Settled" value={String(settled)} note="Deposit released" />
        <Stat icon={<Lock className="w-4 h-4" />} label="ETH locked" value={locked.toFixed(3)} note="In active agreements" />
      </div>

      {latest && (
        <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-[#E0218A]">LATEST AGREEMENT</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="text-xl font-bold text-[#111111]">Agreement #{latest.id}</p>
              <span className={'px-3 py-1 rounded-full text-xs font-semibold ' + badgeClass(stateOf(latest))}>{stateOf(latest)}</span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/5 text-[#111111]">You are the {roleOf(latest)}</span>
            </div>
            <p className="mt-2 text-sm text-[#6B6B6B]">{formatEther(latest.a[2])} ETH deposit. {hintFor(latest)}</p>
          </div>
          <Link to={'/agreement/' + latest.id} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#111111] text-white text-sm font-semibold">
            Open <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-lg font-bold text-[#111111]">Your agreements</p>
          <div className="flex flex-wrap items-center gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={'px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ' + (tab === t.key ? 'bg-[#111111] text-white' : 'bg-black/5 text-[#111111] hover:bg-black/10')}
              >
                {t.label} ({t.n})
              </button>
            ))}
            <div className="flex items-center gap-2 bg-black/5 rounded-full px-3 py-1.5">
              <Search className="w-4 h-4 text-[#6B6B6B]" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search number or status"
                className="bg-transparent outline-none text-xs w-36"
              />
            </div>
          </div>
        </div>

        <div className="mt-3 divide-y divide-black/5">
          {shown.map((x) => (
            <Link key={x.id} to={'/agreement/' + x.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm hover:opacity-70">
              <span className="flex items-center gap-2">
                <b className="text-[#111111]">Agreement #{x.id}</b>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-black/5 text-[#111111] capitalize">{roleOf(x)}</span>
              </span>
              <span className="text-[#6B6B6B]">
                {formatEther(x.a[2])} ETH · {roleOf(x) === 'tenant' ? 'Landlord ' + short(String(x.a[0])) : 'Tenant ' + short(String(x.a[1]))}
              </span>
              <span className={'px-3 py-1 rounded-full text-xs font-semibold ' + badgeClass(stateOf(x))}>{stateOf(x)}</span>
            </Link>
          ))}
        </div>
        {shown.length === 0 && !msg && (
          <p className="mt-3 text-sm text-[#6B6B6B]">
            Nothing to show here. <Link to="/agreements" className="font-semibold text-[#E0218A]">Create an agreement</Link>
          </p>
        )}
      </div>
    </div>
  );
}
