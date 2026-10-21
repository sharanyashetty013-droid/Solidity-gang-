import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrowserProvider, formatEther } from 'ethers';
import { LogOut, X } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { readContract, STATES } from '../lib/contract';
import RoleLabel from '../lib/RoleLabel';
import ProfileAvatar from './ProfileAvatar';
import { useProfile, saveProfile } from '../lib/profileStore';

const resize = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const S = 160;
      const c = document.createElement('canvas');
      c.width = S;
      c.height = S;
      const ctx = c.getContext('2d');
      if (!ctx) { reject(new Error('no canvas')); return; }
      const m = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, S, S);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('bad image')); };
    img.src = url;
  });

export default function ProfileButtons() {
  const { isSepolia } = useWallet();
  const { address, profile } = useProfile();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [bal, setBal] = useState('...');
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState('');
  const [stats, setStats] = useState({ active: 0, settled: 0, locked: 0 });

  useEffect(() => {
    if (open) { setName(profile.name); setSaved(false); setErr(''); }
  }, [open]);

  useEffect(() => {
    if (!open || !address) return;
    let live = true;
    setBal('...');
    (async () => {
      try {
        const p = new BrowserProvider((window as any).ethereum);
        const b = await p.getBalance(address);
        if (live) setBal(Number(formatEther(b)).toFixed(4) + ' ETH');
      } catch {
        if (live) setBal('Unavailable');
      }
      try {
        const c = readContract();
        const me = address.toLowerCase();
        const next = Number(await c.nextId());
        let active = 0, settled = 0, locked = 0;
        for (let i = 1; i < next; i++) {
          const a = await c.getAgreement(BigInt(i));
          const mine = String(a[0]).toLowerCase() === me || String(a[1]).toLowerCase() === me;
          if (!mine) continue;
          if (STATES[Number(a[6])] === 'Settled') settled++;
          else { active++; locked += Number(formatEther(a[2])); }
        }
        if (live) setStats({ active, settled, locked });
      } catch {}
    })();
    return () => { live = false; };
  }, [open, address]);

  const pickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !address) return;
    try {
      setErr('');
      const photo = await resize(file);
      saveProfile(address, { name: profile.name, photo });
    } catch {
      setErr('Could not read that image. Try a JPG or PNG.');
    }
    e.target.value = '';
  };

  const saveName = () => {
    if (!address) return;
    saveProfile(address, { name: name.trim(), photo: profile.photo });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const logout = async () => {
    try {
      await (window as any).ethereum.request({
        method: 'wallet_revokePermissions',
        params: [{ eth_accounts: {} }],
      });
    } catch {}
    navigate('/');
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="mt-3 w-full py-2 rounded-xl bg-[#111111] hover:bg-black text-xs font-semibold text-white transition-colors">
        View profile
      </button>
      <button onClick={logout} className="mt-2 flex items-center justify-center gap-2 w-full text-xs text-[#6B6B6B] hover:text-[#111111]">
        <LogOut className="w-4 h-4" /> Logout
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl text-left" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-[#111111]">Your profile</p>
              <button onClick={() => setOpen(false)} aria-label="Close" className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <ProfileAvatar size={72} />
              <div className="flex flex-col gap-2">
                <label className="px-3 py-1.5 rounded-full bg-black/5 text-xs font-semibold text-[#111111] cursor-pointer text-center">
                  Upload photo
                  <input type="file" accept="image/*" onChange={pickPhoto} className="hidden" />
                </label>
                {profile.photo && address && (
                  <button onClick={() => saveProfile(address, { name: profile.name, photo: '' })} className="text-xs text-[#6B6B6B] hover:text-[#111111]">
                    Remove photo
                  </button>
                )}
              </div>
            </div>
            {err && <p className="mt-2 text-xs text-red-600">{err}</p>}

            <div className="mt-4">
              <p className="text-xs text-[#6B6B6B]">Display name</p>
              <div className="mt-1 flex gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={30}
                  placeholder="For example: Sharanya (Tenant)"
                  className="flex-1 rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#E0218A]"
                />
                <button onClick={saveName} className="px-4 py-2 rounded-xl bg-[#111111] text-white text-xs font-semibold">
                  {saved ? 'Saved' : 'Save'}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-[#6B6B6B]">Saved in this browser for this wallet only.</p>
            </div>

            <div className="mt-5 space-y-3 text-sm border-t border-black/5 pt-4">
              <div>
                <p className="text-xs text-[#6B6B6B]">Wallet address</p>
                <p className="mt-1 break-all font-semibold text-[#111111]">{address || 'Not connected'}</p>
                <div className="mt-2 flex gap-2">
                  <button onClick={copy} className="px-3 py-1.5 rounded-full bg-black/5 text-xs font-semibold text-[#111111]">
                    {copied ? 'Copied' : 'Copy address'}
                  </button>
                  {address && (
                    <a href={'https://sepolia.etherscan.io/address/' + address} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-full bg-black/5 text-xs font-semibold text-[#111111]">
                      View on Etherscan
                    </a>
                  )}
                </div>
              </div>
              <div className="flex justify-between"><span className="text-[#6B6B6B]">Role</span><b className="text-[#111111]"><RoleLabel /></b></div>
              <div className="flex justify-between"><span className="text-[#6B6B6B]">Network</span><b className="text-[#111111]">{isSepolia ? 'Sepolia' : 'Wrong network'}</b></div>
              <div className="flex justify-between"><span className="text-[#6B6B6B]">Balance</span><b className="text-[#111111]">{bal}</b></div>
              <div className="flex justify-between"><span className="text-[#6B6B6B]">Active agreements</span><b className="text-[#111111]">{stats.active}</b></div>
              <div className="flex justify-between"><span className="text-[#6B6B6B]">Settled agreements</span><b className="text-[#111111]">{stats.settled}</b></div>
              <div className="flex justify-between"><span className="text-[#6B6B6B]">ETH locked</span><b className="text-[#111111]">{stats.locked.toFixed(3)}</b></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
