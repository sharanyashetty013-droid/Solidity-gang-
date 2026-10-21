import { API_BASE } from '../lib/config';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { formatEther, parseEther, BrowserProvider } from 'ethers';
import { useWallet } from '../hooks/useWallet';
import { readContract, writeContract, STATES } from '../lib/contract';

export default function AgreementView() {
  const { id } = useParams();
  const { address } = useWallet();
  const [a, setA] = useState<any>(null);
  const [arbiter, setArbiter] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [resAmt, setResAmt] = useState('');
  const [items, setItems] = useState<any[]>([]);
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
      try { setItems([...(await c.getItems(BigInt(id || '0')))]); } catch { setItems([]); }
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

  const BACKEND = API_BASE;

  const submitEvidenceFlow = async (type: 'move-in' | 'move-out') => {
    try {
      if (!file) { setMsg('Pick a JPEG photo first'); return; }
      setBusy(true);
      setMsg('Getting your location...');
      const pos: GeolocationPosition = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 15000 }));
      const lat = pos.coords.latitude.toFixed(6);
      const lng = pos.coords.longitude.toFixed(6);
      setMsg('Sign the upload request in MetaMask...');
      const signer = await new BrowserProvider((window as any).ethereum).getSigner();
      const signedAt = String(Math.floor(Date.now() / 1000));
      const signature = await signer.signMessage('WallsDontLie capture\nagreement:' + id + '\ntype:' + type + '\nsignedAt:' + signedAt);
      const fd = new FormData();
      fd.append('photo', file);
      fd.append('agreementId', String(id));
      fd.append('type', type);
      fd.append('lat', lat);
      fd.append('lng', lng);
      fd.append('signedAt', signedAt);
      fd.append('signature', signature);
      setMsg('Uploading to backend...');
      const res = await fetch(BACKEND + '/capture', { method: 'POST', body: fd });
      const out = await res.json();
      if (!res.ok) throw new Error(out?.error?.message || 'Upload failed');
      setMsg('Confirm the transaction in MetaMask...');
      const c = await writeContract();
      const tx = await c.submitEvidence(BigInt(id || '0'), out.hash, out.cid, type === 'move-in' ? 0 : 1);
      setMsg('Waiting for confirmation...');
      await tx.wait();
      const geo = out.geoOk === null ? 'location not checked' : out.geoOk ? 'location OK' : 'location mismatch';
      setMsg(type + ' evidence saved (' + geo + '). Tx: https://sepolia.etherscan.io/tx/' + tx.hash);
      await load();
    } catch (e: any) {
      setMsg('Failed: ' + (e?.shortMessage || e?.message));
    } finally {
      setBusy(false);
    }
  };

  const submitMoveIn = () => submitEvidenceFlow('move-in');

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

  const doRespond = async (i: number, accept: boolean) => {
    try {
      setBusy(true);
      setMsg('Confirm in MetaMask...');
      const c = await writeContract();
      const tx = await c.respondToClaim(BigInt(id || '0'), BigInt(i), accept);
      setMsg('Waiting for confirmation...');
      await tx.wait();
      setMsg((accept ? 'Accepted' : 'Disputed') + ' item ' + i + '. Tx: https://sepolia.etherscan.io/tx/' + tx.hash);
      await load();
    } catch (e: any) {
      setMsg('Failed: ' + (e?.shortMessage || e?.message));
    } finally {
      setBusy(false);
    }
  };

  const doResolve = async (i: number) => {
    try {
      if (resAmt === '') { setMsg('Enter an award amount (0 to the claimed amount)'); return; }
      setBusy(true);
      setMsg('Confirm in MetaMask...');
      const c = await writeContract();
      const tx = await c.resolveDispute(BigInt(id || '0'), BigInt(i), parseEther(resAmt));
      setMsg('Waiting for confirmation...');
      await tx.wait();
      setMsg('Resolved item ' + i + '. Tx: https://sepolia.etherscan.io/tx/' + tx.hash);
      await load();
    } catch (e: any) {
      setMsg('Failed: ' + (e?.shortMessage || e?.message));
    } finally {
      setBusy(false);
    }
  };

  const doRelease = async () => {
    try {
      setBusy(true);
      setMsg('Confirm in MetaMask...');
      const c = await writeContract();
      const tx = await c.release(BigInt(id || '0'));
      setMsg('Waiting for confirmation...');
      await tx.wait();
      setMsg('Released. Tx: https://sepolia.etherscan.io/tx/' + tx.hash);
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
          <div className={row}><span>Arbiter</span><b className="break-all">{arbiter}</b></div>

          {state === 0 && role === 'Tenant' && (
            <button onClick={fund} disabled={busy} className="mt-6 px-6 py-3 rounded-full bg-[#E0218A] text-white text-sm font-semibold disabled:opacity-60">
              {busy ? 'Working...' : 'Fund deposit (' + formatEther(a[2]) + ' ETH)'}
            </button>
          )}
          {state === 1 && (role === 'Landlord' || role === 'Tenant') && (
            <div className="mt-6">
              <p className="text-sm text-[#6B6B6B] mb-2">Upload a move-in photo. Its hash goes on-chain and the tenancy becomes Active.</p>
              <input type="file" accept="image/jpeg" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" />
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
          {state >= 4 && items.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold mb-2">Claim items</p>
              {items.map((it: any, i: number) => (
                <div key={i} className="py-3 border-b border-black/5 text-sm">
                  <div className="flex justify-between gap-4">
                    <span>{String(it[0])} - {formatEther(it[1])} ETH</span>
                    <b>{['Pending', 'Accepted', 'Disputed', 'Resolved'][Number(it[3])]}{Number(it[3]) === 3 ? ' (awarded ' + formatEther(it[2]) + ' ETH)' : ''}</b>
                  </div>
                  {state === 4 && role === 'Tenant' && Number(it[3]) === 0 && (
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => doRespond(i, true)} disabled={busy} className="px-4 py-2 rounded-full bg-[#E0218A] text-white text-xs font-semibold disabled:opacity-60">Accept</button>
                      <button onClick={() => doRespond(i, false)} disabled={busy} className="px-4 py-2 rounded-full border border-[#E0218A] text-[#E0218A] text-xs font-semibold disabled:opacity-60">Dispute</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {state === 5 && role === 'Arbiter' && items.map((it: any, i: number) => Number(it[3]) === 2 && (
            <div key={'r' + i} className="mt-4">
              <p className="text-sm mb-2">Resolve "{String(it[0])}" (claimed {formatEther(it[1])} ETH)</p>
              <input value={resAmt} onChange={(e) => setResAmt(e.target.value)} placeholder="ETH awarded to landlord" className="block w-full border border-black/10 rounded-lg px-3 py-2 text-sm" />
              <button onClick={() => doResolve(i)} disabled={busy} className="mt-3 px-6 py-3 rounded-full bg-[#E0218A] text-white text-sm font-semibold disabled:opacity-60">
                {busy ? 'Working...' : 'Resolve dispute'}
              </button>
            </div>
          ))}
          {state === 5 && role !== 'Arbiter' && (
            <p className="mt-4 text-sm text-[#6B6B6B]">Waiting for the arbiter. Switch MetaMask to the Arbiter account (address is in the Arbiter row).</p>
          )}
          {(state === 4 || state === 5 || (state === 3 && deadline > 0 && Date.now() / 1000 > deadline)) && (
            <button onClick={doRelease} disabled={busy} className="mt-6 block px-6 py-3 rounded-full border border-[#E0218A] text-[#E0218A] text-sm font-semibold disabled:opacity-60">
              Release funds
            </button>
          )}
          {(state === 2 || state === 3) && (role === 'Landlord' || role === 'Tenant') && (
            <div className="mt-6">
              <p className="text-sm text-[#6B6B6B] mb-2">Optional: upload a move-out photo (JPEG).</p>
              <input type="file" accept="image/jpeg" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" />
              <button onClick={() => submitEvidenceFlow('move-out')} disabled={busy || !file} className="mt-4 block px-6 py-3 rounded-full border border-[#E0218A] text-[#E0218A] text-sm font-semibold disabled:opacity-60">
                {busy ? 'Working...' : 'Submit move-out evidence'}
              </button>
            </div>
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
