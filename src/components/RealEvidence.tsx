import { API_BASE } from '../lib/config';
import { useState } from 'react';
import { BrowserProvider } from 'ethers';

const BACKEND = API_BASE;

type Ev = {
  hash: string; cid: string; type: string; timestamp: number;
  submitter: string; txHash: string; geoOk: boolean | null;
  url?: string; err?: string;
};

const RealEvidence: React.FC = () => {
  const [id, setId] = useState('5');
  const [state, setState] = useState('');
  const [items, setItems] = useState<Ev[]>([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [ai, setAi] = useState<any>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiErr, setAiErr] = useState('');

  const loadList = async () => {
    try {
      setBusy(true);
      setMsg('Loading evidence...');
      const res = await fetch(BACKEND + '/evidence/' + id);
      const out = await res.json();
      if (!res.ok) throw new Error(out?.error?.message || 'Load failed');
      setState(out.state);
      setItems(out.evidence || []);
      setMsg(out.evidence.length ? '' : 'No evidence on this agreement yet.');
    } catch (e: any) {
      setMsg('Failed: ' + (e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  const loadPhotos = async () => {
    try {
      setBusy(true);
      setMsg('Sign in MetaMask to view the photos (one signature per photo)...');
      const signer = await new BrowserProvider((window as any).ethereum).getSigner();
      const next: Ev[] = [];
      for (const it of items) {
        try {
          const expires = String(Math.floor(Date.now() / 1000) + 600);
          const sig = await signer.signMessage(
            'WallsDontLie view\nagreement:' + id + '\ncid:' + it.cid + '\nexpires:' + expires
          );
          const r = await fetch(BACKEND + '/evidence/' + id + '/photo?cid=' + it.cid, {
            headers: { 'X-Signature': sig, 'X-Expires': expires },
          });
          if (!r.ok) {
            const o = await r.json().catch(() => null);
            throw new Error(o?.error?.message || 'Photo failed');
          }
          const blob = await r.blob();
          next.push({ ...it, url: URL.createObjectURL(blob), err: undefined });
        } catch (e: any) {
          next.push({ ...it, err: e?.shortMessage || e?.message || 'Photo failed' });
        }
      }
      setItems(next);
      setMsg('');
    } catch (e: any) {
      setMsg('Failed: ' + (e?.shortMessage || e?.message));
    } finally {
      setBusy(false);
    }
  };

  const runAi = async () => {
    try {
      setAiBusy(true);
      setAiErr('');
      setAi(null);
      const signer = await new BrowserProvider((window as any).ethereum).getSigner();
      const expires = String(Math.floor(Date.now() / 1000) + 600);
      const sig = await signer.signMessage(
        'WallsDontLie view\nagreement:' + id + '\ncid:ai-compare\nexpires:' + expires
      );
      const r = await fetch(BACKEND + '/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Signature': sig, 'X-Expires': expires },
        body: JSON.stringify({ agreementId: id }),
      });
      const o = await r.json().catch(() => null);
      if (!r.ok) throw new Error(o?.error?.message || 'AI check failed');
      setAi(o.result);
    } catch (e: any) {
      setAiErr(e?.shortMessage || e?.message || 'AI check failed');
    } finally {
      setAiBusy(false);
    }
  };

  const geoText = (g: boolean | null) =>
    g === null ? 'location not checked' : g ? 'location OK' : 'location mismatch';

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[#111111]">On-chain evidence</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#6B6B6B]">Agreement #</span>
          <input value={id} onChange={(e) => setId(e.target.value)} className="w-16 border rounded-lg px-2 py-1 text-sm" />
          <button onClick={loadList} disabled={busy} className="px-4 py-2 rounded-full bg-[#111111] text-white text-xs font-semibold disabled:opacity-60">
            Load
          </button>
        </div>
      </div>

      {state && <p className="mt-2 text-xs text-[#6B6B6B]">Status: {state}</p>}
      {msg && <p className="mt-3 text-sm text-[#6B6B6B]">{msg}</p>}

      {items.length > 0 && (
        <>
          {!items.some((i) => i.url) && (
            <button onClick={loadPhotos} disabled={busy} className="mt-4 px-5 py-2 rounded-full border border-[#E0218A] text-[#E0218A] text-sm font-semibold disabled:opacity-60">
              {busy ? 'Working...' : 'Show photos (sign in MetaMask)'}
            </button>
          )}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((p) => (
              <div key={p.cid + p.timestamp}>
                <div className="h-56 rounded-2xl bg-[#FAD0EA]/30 border border-white/70 flex items-center justify-center overflow-hidden text-xs text-[#6B6B6B]">
                  {p.url ? (
                    <img src={p.url} alt={p.type} className="w-full h-full object-cover" />
                  ) : (
                    <span>{p.err ? 'Cannot show: ' + p.err : 'Photo hidden until you sign'}</span>
                  )}
                </div>
                <p className="mt-2 text-sm font-semibold text-[#111111] capitalize">{p.type}</p>
                <p className="text-xs text-[#6B6B6B]">
                  {new Date(p.timestamp * 1000).toLocaleString()} · {geoText(p.geoOk)}
                </p>
                <p className="mt-1 text-[11px] font-mono text-[#E0218A] break-all">{p.hash}</p>
                <a className="text-[11px] text-[#E0218A] underline" href={'https://sepolia.etherscan.io/tx/' + p.txHash} target="_blank" rel="noreferrer">
                  View transaction
                </a>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-5 rounded-2xl px-4 py-3 text-sm border bg-gray-50 border-gray-200 text-gray-700">
        <p className="font-semibold">AI check</p>
        <button onClick={runAi} disabled={aiBusy || items.length < 2} className="mt-2 px-4 py-2 rounded-full bg-[#E0218A] text-white text-xs font-semibold disabled:opacity-60">
          {aiBusy ? 'Checking (up to 30s)...' : 'Run AI check'}
        </button>
        {items.length < 2 && <p className="mt-2 text-xs">Click Load first. You need a move-in and a move-out photo.</p>}
        {aiErr && <p className="mt-2 text-xs text-red-600">{aiErr}</p>}
        {ai && (
          <div className="mt-3">
            <p className="text-sm">{ai.summary}</p>
            {ai.sameRoom === false && <p className="mt-1 text-xs text-red-600">Warning: these photos may show different rooms.</p>}
            <ul className="mt-2 space-y-1">
              {(ai.differences || []).map((d: any, i: number) => (
                <li key={i} className="text-xs"><span className="font-semibold">{d.area}</span> ({d.severity}): {d.description}</li>
              ))}
            </ul>
            {(ai.differences || []).length === 0 && <p className="mt-1 text-xs">No differences found.</p>}
          </div>
        )}
        <p className="mt-1 text-[11px] opacity-80">AI only flags differences. Humans make the final decision.</p>
      </div>
    </div>
  );
};

export default RealEvidence;
