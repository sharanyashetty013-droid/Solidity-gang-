import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { formatEther, parseEther } from 'ethers';
import { useWallet } from '../hooks/useWallet';
import { readContract, writeContract, STATES } from '../lib/contract';

export default function AgreementView() {
  const { id } = useParams();
  const { address } = useWallet();
  const [a, setA] = useState<any>(null);
  const [arbiter, setArbiter] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [claimName, setClaimName] = useState('');
  const [claimAmt, setClaimAmt] = useState('');
  const [deadline, setDeadline] = useState(0);
  const [file, setFile] = useState<File | null>(null);

  const load = useCallback(async () => {
    try {
      const c = readContract();
      setA(await c.getAgreement(BigInt(id || '0')));
      setArbiter(await c.arbiter());
      setDeadline(Number(await c.claimDeadline(BigInt(id || '0'))));
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

  const submitMoveIn = async () => {
    try {
      if (!file) { setMsg('Pick a photo first'); return; }
      setBusy(true);
      setMsg('Hashing photo...');
      const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
      const hash = '0x' + Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
      setMsg('Confirm in MetaMask...');
      const c = await writeContract();
      const tx = await c.submitEvidence(BigInt(id || '0'), hash, 'local:' + file.name, 0);
      setMsg('Waiting for confirmation...');
      await tx.wait();
      setMsg('Move-in evidence saved. Tx: https://sepolia.etherscan.io/tx/' + tx.hash);
      await load();
    } catch (e: any) {
      setMsg('Failed: ' + (e?.shortMessage || e?.message));
    } finally {
      setBusy(false);
    }
  };

  const doCheckout = async () => {
    try {
      setBusy(true);
      setMsg('Confirm in MetaMask...');
      const c = await writeContract();
      const tx = await c.requestCheckout(BigInt(id || '0'));
      setMsg('Waiting for confirmation...');
      await tx.wait();
      setMsg('Checkout requested. Tx: https://sepolia.etherscan.io/tx/' + tx.hash);
      await load();
    } catch (e: any) {
      setMsg('Failed: ' + (e?.shortMessage || e?.message));
    } finally {
      setBusy(false);
    }
  };

  const doClaim = async () => {
    try {
      if (!claimName || !claimAmt) { setMsg('Enter an item name and amount'); return; }
      setBusy(true);
      setMsg('Confirm in MetaMask...');
      const c = await writeContract();
      const tx = await c.submitClaim(BigInt(id || '0'), [{ name: claimName, amount: parseEther(claimAmt) }]);
      setMsg('Waiting for confirmation...');
      await tx.wait();
      setMsg('Claim submitted. Tx: https://sepolia.etherscan.io/tx/' + tx.hash);
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
          {state === 1 && (role === 'Landlord' || role === 'Tenant') && (
            <div className="mt-6">
              <p className="text-sm text-[#6B6B6B] mb-2">Upload a move-in photo. Its hash goes on-chain and the tenancy becomes Active.</p>
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" />
              <button onClick={submitMoveIn} disabled={busy || !file} className="mt-4 block px-6 py-3 rounded-full bg-[#E0218A] text-white text-sm font-semibold disabled:opacity-60">
                {busy ? 'Working...' : 'Submit move-in evidence'}
              </button>
            </div>
          )}
          {state === 2 && role === 'Tenant' && (
            <div className="mt-6">
              <p className="text-sm text-[#6B6B6B] mb-2">Ready to move out? This starts the landlord's claim window.</p>
              <button onClick={doCheckout} disabled={busy} className="px-6 py-3 rounded-full bg-[#E0218A] text-white text-sm font-semibold disabled:opacity-60">
                {busy ? 'Working...' : 'Request checkout'}
              </button>
            </div>
          )}
          {state === 2 && role !== 'Tenant' && (
            <p className="mt-6 text-sm text-[#6B6B6B]">Tenancy is active. Waiting for the tenant to request checkout.</p>
          )}
          {state === 3 && (
            <p className="mt-6 text-sm text-[#6B6B6B]">Claim window ends at {deadline ? new Date(deadline * 1000).toLocaleTimeString() : '...'}</p>
          )}
          {state === 3 && role === 'Landlord' && (
            <div className="mt-4">
              <input value={claimName} onChange={(e) => setClaimName(e.target.value)} placeholder="Item (e.g. Wall damage)" className="block w-full border border-black/10 rounded-lg px-3 py-2 text-sm" />
              <input value={claimAmt} onChange={(e) => setClaimAmt(e.target.value)} placeholder="Amount in ETH (max deposit)" className="mt-2 block w-full border border-black/10 rounded-lg px-3 py-2 text-sm" />
              <button onClick={doClaim} disabled={busy} className="mt-4 px-6 py-3 rounded-full bg-[#E0218A] text-white text-sm font-semibold disabled:opacity-60">
                {busy ? 'Working...' : 'Submit claim'}
              </button>
            </div>
          )}
          {state === 3 && role !== 'Landlord' && (
            <p className="mt-2 text-sm text-[#6B6B6B]">Checkout requested. Waiting for the landlord to submit a claim.</p>
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
