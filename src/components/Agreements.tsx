import { Navigate } from 'react-router-dom';
import { useRole } from '../lib/useRole';
﻿import { useMemo, useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { createAgreementTx } from '../lib/contract';
import { PageShell } from './Dashboard';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from 'motion/react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileCheck2,
  FileText,
  Filter,
  Home,
  IndianRupee,
  KeyRound,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';

type Role = 'Tenant' | 'Landlord';
type AgreementStatus = 'Active' | 'Pending' | 'Completed';

interface Agreement {
  id: number;
  property: string;
  location: string;
  tenant: string;
  landlord: string;
  rent: number;
  deposit: number;
  startDate: string;
  endDate: string;
  status: AgreementStatus;
}

const initialAgreements: Agreement[] = [];

const money = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const statusStyles: Record<AgreementStatus, string> = {
  Active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  Completed: 'bg-slate-100 text-slate-600 ring-slate-200',
};

const statusDot: Record<AgreementStatus, string> = {
  Active: 'bg-emerald-500',
  Pending: 'bg-amber-500',
  Completed: 'bg-slate-400',
};

const inputClass =
  'w-full rounded-xl border border-[#E9E4E8] bg-white px-3.5 py-3 text-sm text-[#262126] outline-none transition focus:border-[#E0218A] focus:ring-2 focus:ring-pink-100';

export function AgreementsInner() {
  const reduceMotion = useReducedMotion();

  const [role, setRole] = useState<Role>('Tenant');
  const [agreements, setAgreements] =
    useState<Agreement[]>(initialAgreements);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState<Agreement | null>(null);
  const [showCreate, setShowCreate] = useState(true);
  const [toast, setToast] = useState('');

  const [form, setForm] = useState({
    property: '',
    location: '',
    tenant: '',
    landlord: '',
    rent: '',
    deposit: '',
    startDate: '',
    endDate: '',
  });

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2800);
  };

  const { address: myAddress, isSepolia } = useWallet();
  const [tenantAddr, setTenantAddr] = useState('');
  const [depositEth, setDepositEth] = useState('0.001');
  const [windowMin, setWindowMin] = useState('10');
  const [sending, setSending] = useState(false);

  const createOnChain = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!myAddress) { alert('Connect MetaMask first.'); return; }
    if (!isSepolia) { alert('Switch MetaMask to Sepolia.'); return; }
    if (!/^0x[a-fA-F0-9]{40}$/.test(tenantAddr.trim())) { alert('Enter a valid tenant wallet address (0x...).'); return; }
    try {
      setSending(true);
      const r = await createAgreementTx(tenantAddr.trim(), depositEth, Number(windowMin) / 1440);
      alert('Agreement #' + (r.id !== null ? r.id.toString() : '?') + ' created.\nhttps://sepolia.etherscan.io/tx/' + r.hash);
      setShowCreate(false);
    } catch (e: any) {
      alert(e?.shortMessage || e?.message || 'Transaction failed');
    } finally {
      setSending(false);
    }
  };

  const visibleAgreements = useMemo(() => {
    const query = search.trim().toLowerCase();

    return agreements.filter((agreement) => {
      const matchesSearch = [
        agreement.property,
        agreement.location,
        agreement.tenant,
        agreement.landlord,
      ].some((value) => value.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === 'All' || agreement.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [agreements, search, statusFilter]);

  const activeCount = agreements.filter(
    (agreement) => agreement.status === 'Active',
  ).length;

  const pendingCount = agreements.filter(
    (agreement) => agreement.status === 'Pending',
  ).length;

  const completedCount = agreements.filter(
    (agreement) => agreement.status === 'Completed',
  ).length;

  const depositTotal = agreements
    .filter((agreement) => agreement.status !== 'Completed')
    .reduce((sum, agreement) => sum + agreement.deposit, 0);

  const stats = [
    {
      label: 'Total agreements',
      value: agreements.length.toString().padStart(2, '0'),
      detail: 'Across your rentals',
      icon: FileText,
      iconStyle: 'bg-pink-100 text-pink-600',
      trend: 'Your rental overview',
    },
    {
      label: 'Active agreements',
      value: activeCount.toString().padStart(2, '0'),
      detail: 'Currently ongoing',
      icon: CheckCircle2,
      iconStyle: 'bg-emerald-50 text-emerald-600',
      trend: 'All systems in place',
    },
    {
      label: 'Pending actions',
      value: pendingCount.toString().padStart(2, '0'),
      detail: 'Awaiting confirmation',
      icon: Clock3,
      iconStyle: 'bg-amber-50 text-amber-600',
      trend: pendingCount ? 'Needs your attention' : 'Nothing pending',
    },
    {
      label: 'Security deposits',
      value: money(depositTotal),
      detail: 'For ongoing agreements',
      icon: ShieldCheck,
      iconStyle: 'bg-violet-50 text-violet-600',
      trend: 'Deposit overview',
    },
  ];

  const resetForm = () => {
    setForm({
      property: '',
      location: '',
      tenant: '',
      landlord: '',
      rent: '',
      deposit: '',
      startDate: '',
      endDate: '',
    });
  };

  const createAgreement = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const rent = Number(form.rent);
    const deposit = Number(form.deposit);

    if (
      !form.property.trim() ||
      !form.location.trim() ||
      !form.tenant.trim() ||
      !form.landlord.trim() ||
      !form.startDate ||
      !form.endDate ||
      rent <= 0 ||
      deposit < 0
    ) {
      notify('Please complete all fields with valid amounts.');
      return;
    }

    if (form.endDate < form.startDate) {
      notify('The end date must be after the start date.');
      return;
    }

    const formatDate = (date: string) =>
      new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

    const newAgreement: Agreement = {
      id: Math.max(0, ...agreements.map((item) => item.id)) + 1,
      property: form.property.trim(),
      location: form.location.trim(),
      tenant: form.tenant.trim(),
      landlord: form.landlord.trim(),
      rent,
      deposit,
      startDate: formatDate(form.startDate),
      endDate: formatDate(form.endDate),
      status: 'Pending',
    };

    setAgreements((current) => [newAgreement, ...current]);
    setShowCreate(false);
    setStatusFilter('All');
    setSearch('');
    resetForm();
    notify('Agreement created successfully!');
  };

  const pageTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.4, ease: 'easeOut' as const };

  return (
    <PageShell role={role}>
      <div className="w-full min-w-0 text-[#242024]">


        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-xs text-[#948994]">
          <span>Workspace</span>
          <span>/</span>
          <span className="font-semibold text-[#4A4049]">Agreements</span>
        </div>

        {/* Page heading */}
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...pageTransition, delay: 0.05 }}
          className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-end"
        >
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white px-3 py-1.5 text-xs font-semibold text-[#C52B80]">
              <Sparkles size={13} />
              New agreement
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {role === 'Tenant' ? 'Create agreement' : 'Property agreements'}
              <span className="text-[#E0218A]">.</span>
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#847985] sm:text-base">
              {role === 'Tenant'
                ? 'Set up a new deposit escrow on Sepolia.'
                : 'Set up a new deposit escrow on Sepolia.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#171417] px-5 text-sm font-semibold text-white transition hover:bg-[#E0218A] focus:outline-none focus:ring-4 focus:ring-pink-100"
          >
            <Plus size={17} />
            Create agreement
          </button>
        </motion.section>

        <div className="rounded-[28px] bg-white p-6 shadow-sm sm:p-8">
          <p className="text-lg font-bold text-[#111111]">New deposit agreement</p>
          <p className="mt-2 text-sm text-[#6B6B6B]">Enter the tenant address, deposit and claim window, then confirm in MetaMask. The connected wallet becomes the landlord. All your agreements are under My agreements.</p>
        </div>

        {/* Footer */}
        <footer className="flex flex-col items-center justify-between gap-3 px-2 py-7 text-xs text-[#978A96] sm:flex-row">
          <p>© 2026 Walls Don't Lie</p>
          <p className="flex items-center gap-2">
            Built for transparent renting
            <span className="text-[#E0218A]">♥</span>
          </p>
        </footer>
      </div>

      {/* Agreement details modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#1E1320]/50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setSelected(null);
              }
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="agreement-details-title"
              initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: reduceMotion ? 0 : 0.22 }}
              className="my-auto w-full max-w-xl overflow-hidden rounded-[26px] bg-white shadow-2xl"
            >
              <div className="relative overflow-hidden bg-[#211720] p-6 text-white sm:p-8">
                <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full border-[28px] border-white/[0.05]" />

                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-pink-300">
                      AGR-{String(selected.id).padStart(4, '0')}
                    </p>
                    <h2
                      id="agreement-details-title"
                      className="mt-2 text-2xl font-bold"
                    >
                      Agreement details
                    </h2>
                    <p className="mt-2 text-sm text-white/60">
                      {selected.property}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    aria-label="Close details"
                    className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
                  >
                    <X size={19} />
                  </button>
                </div>
              </div>

              <div className="space-y-6 p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${statusStyles[selected.status]}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${statusDot[selected.status]}`}
                    />
                    {selected.status}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-[#8C808B]">
                    <CalendarDays size={14} />
                    {selected.startDate} → {selected.endDate}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    {
                      label: 'Monthly rent',
                      value: money(selected.rent),
                      icon: IndianRupee,
                    },
                    {
                      label: 'Security deposit',
                      value: money(selected.deposit),
                      icon: ShieldCheck,
                    },
                    {
                      label: 'Tenant',
                      value: selected.tenant,
                      icon: Users,
                    },
                    {
                      label: 'Landlord',
                      value: selected.landlord,
                      icon: KeyRound,
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-[#F0E8EF] bg-[#FCF9FB] p-4"
                      >
                        <div className="flex items-center gap-2 text-xs text-[#8D808B]">
                          <Icon size={15} className="text-[#D62B83]" />
                          {item.label}
                        </div>
                        <p className="mt-2 break-words text-base font-bold">
                          {item.value}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-2xl bg-[#FDF5FA] p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck
                      size={19}
                      className="mt-0.5 shrink-0 text-[#D62B83]"
                    />
                    <div>
                      <p className="text-sm font-semibold">
                        Agreement overview
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#857885]">
                        This is sample frontend data. Agreement status and
                        deposit information are not connected to a live
                        blockchain or backend.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="min-h-12 w-full rounded-full bg-[#211720] px-4 text-sm font-semibold text-white transition hover:bg-[#E0218A]"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create agreement modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#1E1320]/50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setShowCreate(false);
              }
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-agreement-title"
              initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: reduceMotion ? 0 : 0.22 }}
              className="my-auto w-full max-w-2xl overflow-hidden rounded-[26px] bg-white shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-[#F0E8EF] p-6 sm:p-8">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#D62B83]">
                    New rental
                  </p>
                  <h2
                    id="create-agreement-title"
                    className="mt-2 text-2xl font-bold"
                  >
                    Create agreement
                  </h2>
                  <p className="mt-2 text-sm text-[#8D808B]">
                    Add the rental details to create a real on-chain agreement.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  aria-label="Close form"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F8F1F6] text-[#6D606B] transition hover:bg-pink-100 hover:text-[#D62B83]"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={createOnChain} className="p-6 sm:p-8">
                <div className="grid grid-cols-1 gap-4">
                  <label className="text-xs font-semibold text-[#675A65]">
                    Tenant wallet address
                    <input required className={inputClass + ' mt-2'} placeholder="0x..." value={tenantAddr} onChange={(e) => setTenantAddr(e.target.value)} />
                  </label>
                  <label className="text-xs font-semibold text-[#675A65]">
                    Deposit (ETH)
                    <input required type="number" min="0.0001" step="0.0001" className={inputClass + ' mt-2'} value={depositEth} onChange={(e) => setDepositEth(e.target.value)} />
                  </label>
                  <label className="text-xs font-semibold text-[#675A65]">
                    Claim window (minutes, 1 to 129600)
                    <input required type="number" min="1" max="129600" step="1" className={inputClass + ' mt-2'} value={windowMin} onChange={(e) => setWindowMin(e.target.value)} />
                  </label>
                  <p className="text-xs text-[#8D808B]">The wallet connected in MetaMask becomes the landlord.</p>
                </div>
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button type="button" onClick={() => setShowCreate(false)} className="min-h-12 rounded-full border border-[#E9E0E7] px-5 text-sm font-semibold text-[#6D606B] transition hover:bg-[#FCF7FA]">
                    Cancel
                  </button>
                  <button type="submit" disabled={sending} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#E0218A] px-6 text-sm font-semibold text-white transition hover:bg-[#BD176F] disabled:opacity-60">
                    {sending ? 'Confirm in MetaMask...' : 'Create agreement'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-5 left-1/2 z-[60] flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-3 rounded-full bg-[#211720] px-5 py-3 text-sm font-medium text-white shadow-xl"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
              <Check size={14} />
            </span>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}

const Agreements = () => {
  const { tenantOnly, isArbiter, loading } = useRole();
  if (loading) return null;
  if (tenantOnly || isArbiter) return <Navigate to="/dashboard" replace />;
  return <AgreementsInner />;
};

export default Agreements;
