import { useMemo, useState } from 'react';
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

const initialAgreements: Agreement[] = [
  {
    id: 1,
    property: 'Sunrise Residences',
    location: 'Nitte, Karnataka',
    tenant: 'Aarav Sharma',
    landlord: 'Priya Nair',
    rent: 18000,
    deposit: 54000,
    startDate: '01 Oct 2026',
    endDate: '30 Sep 2027',
    status: 'Active',
  },
  {
    id: 2,
    property: 'The Palm House',
    location: 'Mangalore, Karnataka',
    tenant: 'Ananya Rao',
    landlord: 'Rahul Menon',
    rent: 22000,
    deposit: 66000,
    startDate: '15 Oct 2026',
    endDate: '14 Oct 2027',
    status: 'Pending',
  },
  {
    id: 3,
    property: 'Lakeview Apartments',
    location: 'Udupi, Karnataka',
    tenant: 'Ishaan Kapoor',
    landlord: 'Meera Shah',
    rent: 15000,
    deposit: 45000,
    startDate: '01 Jan 2026',
    endDate: '31 Dec 2026',
    status: 'Active',
  },
  {
    id: 4,
    property: 'Maple Garden Villa',
    location: 'Manipal, Karnataka',
    tenant: 'Diya Shetty',
    landlord: 'Karan Patel',
    rent: 30000,
    deposit: 90000,
    startDate: '01 Sep 2025',
    endDate: '31 Aug 2026',
    status: 'Completed',
  },
  {
    id: 5,
    property: 'Urban Nest Studio',
    location: 'Mangalore, Karnataka',
    tenant: 'Rohan Das',
    landlord: 'Priya Nair',
    rent: 12000,
    deposit: 36000,
    startDate: '01 Nov 2026',
    endDate: '31 Oct 2027',
    status: 'Pending',
  },
];

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

export function Agreements() {
  const reduceMotion = useReducedMotion();

  const [role, setRole] = useState<Role>('Tenant');
  const [agreements, setAgreements] =
    useState<Agreement[]>(initialAgreements);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState<Agreement | null>(null);
  const [showCreate, setShowCreate] = useState(false);
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
              Your rental workspace
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {role === 'Tenant' ? 'My agreements' : 'Property agreements'}
              <span className="text-[#E0218A]">.</span>
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#847985] sm:text-base">
              {role === 'Tenant'
                ? 'Keep track of your rental contracts, security deposits, and important dates.'
                : 'Manage your tenants, rental contracts, and security deposits from one place.'}
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

        {/* Welcome / role panel */}
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...pageTransition, delay: 0.1 }}
          className="relative mb-7 overflow-hidden rounded-[28px] bg-[#211720] p-6 text-white sm:p-8"
        >
          <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border-[42px] border-white/[0.04]" />
          <div className="pointer-events-none absolute -bottom-24 right-28 h-52 w-52 rounded-full bg-[#E0218A]/20 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-pink-300">
                <ShieldCheck size={15} />
                Agreements overview
              </div>

              <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
                {role === 'Tenant'
                  ? 'Your home. Your peace of mind.'
                  : 'Your properties. One clear view.'}
              </h2>

              <p className="mt-3 max-w-lg text-sm leading-6 text-white/65">
                {role === 'Tenant'
                  ? 'Keep every rental detail organised, from the agreement start date to your deposit.'
                  : 'Stay on top of rental commitments, agreement statuses, and the deposits associated with your properties.'}
              </p>

              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById('agreement-list')
                    ?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' })
                }
                className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full bg-white px-4 text-xs font-bold text-[#241A22] transition hover:bg-pink-100"
              >
                Explore agreements
                <ArrowUpRight size={15} />
              </button>
            </div>

            <div className="flex min-w-[175px] items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E0218A]">
                {role === 'Tenant' ? (
                  <Home size={23} />
                ) : (
                  <Building2 size={23} />
                )}
              </div>
              <div>
                <p className="text-xs text-white/55">Viewing as</p>
                <p className="mt-1 text-base font-bold">{role}</p>
                <p className="mt-1 text-[11px] text-pink-300">
                  Demo workspace
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Stats */}
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...pageTransition, delay: 0.14 }}
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.article
                key={stat.label}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  ...pageTransition,
                  delay: reduceMotion ? 0 : 0.18 + index * 0.06,
                }}
                whileHover={reduceMotion ? undefined : { y: -4 }}
                className="rounded-[22px] border border-[#EFE7ED] bg-white p-5 shadow-[0_5px_22px_rgba(50,20,40,0.025)] transition-shadow hover:shadow-[0_12px_30px_rgba(80,30,65,0.07)] sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#827784]">
                      {stat.label}
                    </p>
                    <p className="mt-3 break-words text-2xl font-extrabold tracking-tight sm:text-3xl">
                      {stat.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${stat.iconStyle}`}
                  >
                    <Icon size={21} />
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2 border-t border-[#F2EDF1] pt-4">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-50 text-[#D62B83]">
                    <ArrowUpRight size={12} />
                  </span>
                  <span className="text-[11px] font-medium text-[#8A7F89]">
                    {stat.trend}
                  </span>
                </div>
              </motion.article>
            );
          })}
        </motion.section>

        {/* Featured agreement */}
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...pageTransition, delay: 0.2 }}
          className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_0.85fr]"
        >
          <div className="relative overflow-hidden rounded-[26px] border border-[#F0E4EC] bg-white p-6 sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#D62B83]">
                  Featured property
                </p>
                <h2 className="mt-2 text-xl font-bold">
                  {role === 'Tenant'
                    ? 'Your current rental'
                    : 'Your rental portfolio'}
                </h2>
              </div>
              <span className="rounded-full bg-pink-50 px-3 py-1.5 text-[11px] font-semibold text-[#C72B7E]">
                {activeCount} active
              </span>
            </div>

            <div className="mt-5 flex flex-col gap-5 sm:flex-row">
              <div className="relative flex min-h-44 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#F8D7EA] via-[#F0DDF1] to-[#DCCFF0] sm:w-44">
                <div className="absolute left-5 top-5 h-20 w-20 rounded-full bg-white/40 blur-2xl" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/60 bg-white/50 text-[#B92B79] shadow-lg shadow-pink-200/40">
                  <Building2 size={43} strokeWidth={1.4} />
                </div>
                <span className="absolute bottom-3 left-3 rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold text-[#81556E] backdrop-blur">
                  RENTAL PROPERTY
                </span>
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <h3 className="text-lg font-bold">
                  {role === 'Tenant'
                    ? 'Sunrise Residences'
                    : 'Rental portfolio'}
                </h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-[#8B7F89]">
                  <Building2 size={14} />
                  {role === 'Tenant'
                    ? 'Nitte, Karnataka'
                    : 'Multiple properties'}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#8B7F89]">
                      {role === 'Tenant' ? 'Monthly rent' : 'Monthly rent total'}
                    </p>
                    <p className="mt-1 text-lg font-bold">
                      {money(
                        role === 'Tenant'
                          ? 18000
                          : agreements.reduce(
                              (sum, item) => sum + item.rent,
                              0,
                            ),
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8B7F89]">
                      {role === 'Tenant' ? 'Security deposit' : 'Deposits'}
                    </p>
                    <p className="mt-1 text-lg font-bold">
                      {money(
                        role === 'Tenant' ? 54000 : depositTotal,
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[26px] border border-[#F0E4EC] bg-white p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#D62B83]">
                  Agreement health
                </p>
                <h2 className="mt-2 text-xl font-bold">Status breakdown</h2>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-[#D62B83]">
                <FileCheck2 size={20} />
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {[
                {
                  label: 'Active',
                  value: activeCount,
                  color: 'bg-emerald-400',
                },
                {
                  label: 'Pending',
                  value: pendingCount,
                  color: 'bg-amber-400',
                },
                {
                  label: 'Completed',
                  value: completedCount,
                  color: 'bg-slate-400',
                },
              ].map((item) => {
                const percentage = agreements.length
                  ? (item.value / agreements.length) * 100
                  : 0;

                return (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-[#635862]">
                        {item.label}
                      </span>
                      <span className="font-bold">{item.value}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#F3EDF2]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{
                          duration: reduceMotion ? 0 : 0.7,
                          ease: 'easeOut',
                        }}
                        className={`h-full rounded-full ${item.color}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-xl bg-[#FBF5F9] p-3.5">
              <Sparkles
                size={17}
                className="mt-0.5 shrink-0 text-[#D62B83]"
              />
              <p className="text-xs leading-5 text-[#7F707D]">
                {pendingCount
                  ? `${pendingCount} agreement${pendingCount === 1 ? '' : 's'} currently await${pendingCount === 1 ? 's' : ''} action. Review the list below to stay up to date.`
                  : 'Everything is up to date. There are no pending agreements.'}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Agreements table */}
        <motion.section
          id="agreement-list"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...pageTransition, delay: 0.24 }}
          className="overflow-hidden rounded-[26px] border border-[#EFE5ED] bg-white shadow-[0_5px_22px_rgba(50,20,40,0.025)]"
        >
          <div className="flex flex-col gap-4 border-b border-[#F0E9EF] p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold">All agreements</h2>
              <p className="mt-1 text-sm text-[#8A7F89]">
                {role === 'Tenant'
                  ? 'Review your rental contracts and important details.'
                  : 'Keep track of your tenants and rental contracts.'}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="flex min-h-11 items-center gap-2 rounded-xl border border-[#EAE2E9] bg-white px-3.5 focus-within:border-[#E0218A] focus-within:ring-2 focus-within:ring-pink-100">
                <Search size={17} className="shrink-0 text-[#9A8C98]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search agreements..."
                  className="w-full min-w-0 bg-transparent text-sm outline-none sm:w-44"
                  aria-label="Search agreements"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                    className="text-[#9A8C98] hover:text-[#E0218A]"
                  >
                    <X size={15} />
                  </button>
                )}
              </label>

              <label className="flex min-h-11 items-center gap-2 rounded-xl border border-[#EAE2E9] bg-white px-3.5">
                <Filter size={15} className="text-[#9A8C98]" />
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="min-w-0 bg-transparent text-sm outline-none"
                  aria-label="Filter by agreement status"
                >
                  <option value="All">All statuses</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
                <ChevronDown size={14} className="text-[#9A8C98]" />
              </label>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead className="bg-[#FCF9FB]">
                <tr className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#968996]">
                  <th className="px-6 py-4">Property</th>
                  <th className="px-6 py-4">
                    {role === 'Tenant' ? 'Landlord' : 'Tenant'}
                  </th>
                  <th className="px-6 py-4">Monthly rent</th>
                  <th className="px-6 py-4">Deposit</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#F2EDF1]">
                <AnimatePresence mode="popLayout">
                  {visibleAgreements.map((agreement) => {
                    const person =
                      role === 'Tenant'
                        ? agreement.landlord
                        : agreement.tenant;

                    const initials = person
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <motion.tr
                        layout
                        key={agreement.id}
                        initial={
                          reduceMotion
                            ? false
                            : { opacity: 0, y: 8 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        exit={
                          reduceMotion
                            ? undefined
                            : { opacity: 0, y: -5 }
                        }
                        transition={{
                          duration: reduceMotion ? 0 : 0.2,
                        }}
                        className="group transition-colors hover:bg-[#FFF9FC]"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FBE3F0] to-[#F0E8F8] text-[#B72A78] transition group-hover:scale-105">
                              <Building2 size={19} />
                            </div>
                            <div>
                              <p className="text-sm font-bold">
                                {agreement.property}
                              </p>
                              <p className="mt-1 text-xs text-[#968996]">
                                {agreement.location}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5E1EE] text-[10px] font-bold text-[#A32C70]">
                              {initials}
                            </div>
                            <span className="text-sm font-medium">
                              {person}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-sm font-semibold">
                          {money(agreement.rent)}
                          <p className="mt-1 text-[10px] font-normal text-[#9A8E99]">
                            per month
                          </p>
                        </td>

                        <td className="px-6 py-5 text-sm font-semibold">
                          {money(agreement.deposit)}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold ring-1 ring-inset ${statusStyles[agreement.status]}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${statusDot[agreement.status]}`}
                            />
                            {agreement.status}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-right">
                          <button
                            type="button"
                            onClick={() => setSelected(agreement)}
                            className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[#EDE3EA] px-3.5 text-xs font-semibold transition hover:border-pink-200 hover:bg-pink-50 hover:text-[#D62B83]"
                          >
                            View
                            <ArrowUpRight size={14} />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>

                {visibleAgreements.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-50 text-[#D62B83]">
                        <Search size={22} />
                      </div>
                      <p className="mt-4 font-semibold">
                        No agreements found
                      </p>
                      <p className="mt-1 text-sm text-[#948994]">
                        Try another search term or change the status filter.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearch('');
                          setStatusFilter('All');
                        }}
                        className="mt-4 text-sm font-semibold text-[#D62B83] hover:underline"
                      >
                        Clear filters
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F0E9EF] px-5 py-4 sm:px-6">
            <p className="text-xs text-[#8C808B]">
              Showing{' '}
              <span className="font-semibold text-[#514650]">
                {visibleAgreements.length}
              </span>{' '}
              of {agreements.length} agreements
            </p>
            <div className="flex items-center gap-2 text-xs text-[#8C808B]">
              <ShieldCheck size={15} className="text-[#D62B83]" />
              Sample data · Frontend demo
            </div>
          </footer>
        </motion.section>

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
                    Add the rental details to create a sample agreement.
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

              <form onSubmit={createAgreement} className="p-6 sm:p-8">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="text-xs font-semibold text-[#675A65] sm:col-span-2">
                    Property name
                    <input
                      required
                      className={`${inputClass} mt-2`}
                      placeholder="e.g. Sunrise Residences"
                      value={form.property}
                      onChange={(event) =>
                        setForm({ ...form, property: event.target.value })
                      }
                    />
                  </label>

                  <label className="text-xs font-semibold text-[#675A65] sm:col-span-2">
                    Property location
                    <input
                      required
                      className={`${inputClass} mt-2`}
                      placeholder="City, state"
                      value={form.location}
                      onChange={(event) =>
                        setForm({ ...form, location: event.target.value })
                      }
                    />
                  </label>

                  <label className="text-xs font-semibold text-[#675A65]">
                    Tenant name
                    <input
                      required
                      className={`${inputClass} mt-2`}
                      placeholder="Full name"
                      value={form.tenant}
                      onChange={(event) =>
                        setForm({ ...form, tenant: event.target.value })
                      }
                    />
                  </label>

                  <label className="text-xs font-semibold text-[#675A65]">
                    Landlord name
                    <input
                      required
                      className={`${inputClass} mt-2`}
                      placeholder="Full name"
                      value={form.landlord}
                      onChange={(event) =>
                        setForm({ ...form, landlord: event.target.value })
                      }
                    />
                  </label>

                  <label className="text-xs font-semibold text-[#675A65]">
                    Monthly rent (G∩┐╜)
                    <input
                      required
                      type="number"
                      min="1"
                      step="1"
                      className={`${inputClass} mt-2`}
                      placeholder="18000"
                      value={form.rent}
                      onChange={(event) =>
                        setForm({ ...form, rent: event.target.value })
                      }
                    />
                  </label>

                  <label className="text-xs font-semibold text-[#675A65]">
                    Security deposit (G∩┐╜)
                    <input
                      required
                      type="number"
                      min="0"
                      step="1"
                      className={`${inputClass} mt-2`}
                      placeholder="54000"
                      value={form.deposit}
                      onChange={(event) =>
                        setForm({ ...form, deposit: event.target.value })
                      }
                    />
                  </label>

                  <label className="text-xs font-semibold text-[#675A65]">
                    Start date
                    <input
                      required
                      type="date"
                      className={`${inputClass} mt-2`}
                      value={form.startDate}
                      onChange={(event) =>
                        setForm({ ...form, startDate: event.target.value })
                      }
                    />
                  </label>

                  <label className="text-xs font-semibold text-[#675A65]">
                    End date
                    <input
                      required
                      type="date"
                      className={`${inputClass} mt-2`}
                      value={form.endDate}
                      onChange={(event) =>
                        setForm({ ...form, endDate: event.target.value })
                      }
                    />
                  </label>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreate(false);
                      resetForm();
                    }}
                    className="min-h-12 rounded-full border border-[#E9E0E7] px-5 text-sm font-semibold text-[#6D606B] transition hover:bg-[#FCF7FA]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#E0218A] px-6 text-sm font-semibold text-white transition hover:bg-[#BD176F]"
                  >
                    <Check size={17} />
                    Create agreement
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

export default Agreements;
