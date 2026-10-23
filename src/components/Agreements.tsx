import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Plus, Sparkles, X } from 'lucide-react';
import { useRole } from '../lib/useRole';
import { useWallet } from '../hooks/useWallet';
import { createAgreementTx } from '../lib/contract';
import { PageShell } from './Dashboard';

const inputClass =
  'w-full rounded-xl border border-[#E9E4E8] bg-white px-3.5 py-3 text-sm text-[#262126] outline-none transition focus:border-[#E0218A] focus:ring-2 focus:ring-pink-100';

export function AgreementsInner() {
  const reduceMotion = useReducedMotion();
  const role = 'Tenant' as const; // same default as before (PageShell prop)

  const [showCreate, setShowCreate] = useState(false); // was true: modal covered the page on load
  const { address: myAddress, isSepolia } = useWallet();
  const [tenantAddr, setTenantAddr] = useState('');
  const [depositEth, setDepositEth] = useState('0.001');
  const [windowMin, setWindowMin] = useState('10');
  const [sending, setSending] = useState(false);

  const createOnChain = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!myAddress) { alert('Connect MetaMask first.'); return; }
    if (!isSepolia) { alert('Switch MetaMask to Sepolia.'); return; }
    if (!/^0x[a-fA-F0-9]{40}$/.test(tenantAddr.trim())) {
      alert('Enter a valid tenant wallet address (0x...).');
      return;
    }
    try {
      setSending(true);
      const r = await createAgreementTx(tenantAddr.trim(), depositEth, Number(windowMin) / 1440);
      alert(
        'Agreement #' + (r.id !== null ? r.id.toString() : '?') +
        ' created.\nhttps://sepolia.etherscan.io/tx/' + r.hash,
      );
      setShowCreate(false);
    } catch (e: any) {
      alert(e?.shortMessage || e?.message || 'Transaction failed');
    } finally {
      setSending(false);
    }
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
              Create agreement<span className="text-[#E0218A]">.</span>
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#847985] sm:text-base">
              Set up a new deposit escrow on Sepolia.
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
          <p className="mt-2 text-sm text-[#6B6B6B]">
            Enter the tenant address, deposit and claim window, then confirm in MetaMask. The
            connected wallet becomes the landlord. All your agreements are under My agreements.
          </p>
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

      {/* Create agreement modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#1E1320]/50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setShowCreate(false);
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
                  <h2 id="create-agreement-title" className="mt-2 text-2xl font-bold">
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
                    <input
                      required
                      className={inputClass + ' mt-2'}
                      placeholder="0x..."
                      value={tenantAddr}
                      onChange={(e) => setTenantAddr(e.target.value)}
                    />
                  </label>
                  <label className="text-xs font-semibold text-[#675A65]">
                    Deposit (ETH)
                    <input
                      required
                      type="number"
                      min="0.0001"
                      step="0.0001"
                      className={inputClass + ' mt-2'}
                      value={depositEth}
                      onChange={(e) => setDepositEth(e.target.value)}
                    />
                  </label>
                  <label className="text-xs font-semibold text-[#675A65]">
                    Claim window (minutes, 1 to 129600)
                    <input
                      required
                      type="number"
                      min="1"
                      max="129600"
                      step="1"
                      className={inputClass + ' mt-2'}
                      value={windowMin}
                      onChange={(e) => setWindowMin(e.target.value)}
                    />
                  </label>
                  <p className="text-xs text-[#8D808B]">
                    The wallet connected in MetaMask becomes the landlord.
                  </p>
                </div>
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="min-h-12 rounded-full border border-[#E9E0E7] px-5 text-sm font-semibold text-[#6D606B] transition hover:bg-[#FCF7FA]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#E0218A] px-6 text-sm font-semibold text-white transition hover:bg-[#BD176F] disabled:opacity-60"
                  >
                    {sending ? 'Confirm in MetaMask...' : 'Create agreement'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}

const Agreements = () => {
  const { address } = useWallet();
  const { tenantOnly, isArbiter, loading } = useRole();

  if (loading) return null;

  // Gate: not connected -> connect prompt only (no redirect loop on refresh)
  if (!address) {
    return (
      <PageShell role="Tenant">
        <div className="rounded-[28px] bg-white p-6 shadow-sm sm:p-8">
          <p className="text-lg font-bold text-[#111111]">Connect your wallet</p>
          <p className="mt-2 text-sm text-[#6B6B6B]">
            Connect MetaMask to create or view agreements.
          </p>
        </div>
      </PageShell>
    );
  }

  if (tenantOnly || isArbiter) return <Navigate to="/dashboard" replace />;
  return <AgreementsInner />;
};

export default Agreements;
