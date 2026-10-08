import { useState, useCallback, useEffect } from "react";
import { BrowserProvider } from "ethers";

const SEPOLIA_CHAIN_ID = "0xaa36a7"; // Sepolia testnet (11155111)

const getEthereum = () => (window as any).ethereum;

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const isSepolia = chainId === SEPOLIA_CHAIN_ID;

  const connect = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum) {
      setError("MetaMask not found. Please install it from metamask.io.");
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const provider = new BrowserProvider(ethereum);
      const accounts: string[] = await provider.send("eth_requestAccounts", []);
      setAddress(accounts[0] ?? null);

      try {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
      } catch {
        setError("Please switch MetaMask to the Sepolia network.");
      }
      setChainId(await ethereum.request({ method: "eth_chainId" }));
    } catch (e: any) {
      setError(
        e?.code === 4001
          ? "Connection request was rejected."
          : e?.message ?? "Failed to connect wallet."
      );
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Clears the app's state (MetaMask itself stays logged in)
  const disconnect = useCallback(() => {
    setAddress(null);
    setError(null);
  }, []);

  useEffect(() => {
    const ethereum = getEthereum();
    if (!ethereum) return;

    // Restore an already-approved connection on page load
    ethereum.request({ method: "eth_accounts" }).then((accounts: string[]) => {
      if (accounts.length > 0) setAddress(accounts[0]);
    });
    ethereum.request({ method: "eth_chainId" }).then(setChainId);

    const onAccounts = (accounts: string[]) => setAddress(accounts[0] ?? null);
    const onChain = (id: string) => setChainId(id);
    ethereum.on("accountsChanged", onAccounts);
    ethereum.on("chainChanged", onChain);
    return () => {
      ethereum.removeListener("accountsChanged", onAccounts);
      ethereum.removeListener("chainChanged", onChain);
    };
  }, []);

  return { address, chainId, isSepolia, error, isConnecting, connect, disconnect };
}