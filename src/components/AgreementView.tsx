import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { formatEther } from 'ethers';
import { useWallet } from '../hooks/useWallet';
import { readContract, writeContract, STATES } from '../lib/contract';

export default function AgreementView() {
  const { id } = useParams();
  const { address } = useWallet();
  const [a, setA] = useState<any>(null);
  const [arbiter, setArbiter] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const c = readContract();
      setA(await c.getAgreement(BigInt(id || '0')));
      setArbiter(await c.arbiter());
      setMsg('');
    } catch (e: any) {
      setMsg('Could not load agreement: ' + (e?.shortMessage || e?.message));
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const me = (address || '').toLowerCase();
  let role = 'Viewer';
  if (a) {
    if (String(a[0]).toLowerCase() === me) role = 'Landlord';
    else if (String(a[1]).toLowerCase() === me) role = 'Tenant';
    else if (arbiter.toLowerCase() === me) role = 'Arbiter';
  }
  const state = a ? Number(a[6]) : -1;

  const fund = async () => {
    try {
      setBusy(true);
      setMsg('Confirm in MetaMask...');
      const c = await writeContract();
      const tx = await c.fundDeposit(BigInt(id || '0'), { value: a[2] });
      setMsg('Waiting for confirmation...');
      await tx.wait();
      setMsg('Deposit funded. Tx: https://sepolia.etherscan.io/tx/' + tx.hash);
      await load();
    } catch (e: any) {
      setMsg('Failed: ' + (e?.shortMessage || e?.message));
    } finally {
      setBusy(false);
    }
  };

  const row = 'flex justify-between gap-4 py-3 border-b border-black/5 text-sm';

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-[#111111]">Agreement #{id}</h1>
      {!a && <p className="mt-4 text-sm text-[#6B6B6B]">{msg || 'Loading from Sepolia...'}</p>}
      {a && (
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
          <div className={row}><span>Status</span><b>{STATES[state] ?? state}</b></div>
          <div className={row}><span>Your role</span><b>{role}</b></div>
          <div className={row}><span>Deposit</span><b>{formatEther(a[2])} ETH</b></div>
          <div className={row}><span>Claim window</span><b>{Number(a[3]) / 60} minutes</b></div>
          <div className={row}><span>Landlord</span><b className="break-all">{String(a[0])}</b></div>
          <div className={row}><span>Tenant</span><b className="break-all">{String(a[1])}</b></div>

          {state === 0 && role === 'Tenant' && (
            <button onClick={fund} disabled={busy} className="mt-6 px-6 py-3 rounded-full bg-[#E0218A] text-white text-sm font-semibold disabled:opacity-60">
              {busy ? 'Working...' : 'Fund deposit (' + formatEther(a[2]) + ' ETH)'}
            </button>
          )}
          {state === 0 && role !== 'Tenant' && (
            <p className="mt-6 text-sm text-[#6B6B6B]">Waiting for the tenant to fund the deposit. Switch MetaMask to the Tenant account.</p>
          )}
        </div>
      )}
      {a && msg && <p className="mt-4 text-sm break-all">{msg}</p>}
    </div>
  );
}
