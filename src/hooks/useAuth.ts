"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";

/**
 * SIWE oturum akışı: nonce al → mesaj imzala → backend doğrula.
 * Smart wallet imzaları viem/siwe tarafından otomatik yönetilir.
 */
export function useAuth() {
  const { address, chainId, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [authedAddress, setAuthedAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mevcut oturumu kontrol et
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setAuthedAddress(d.siwe ? d.address : null))
      .catch(() => {});
  }, []);

  const signIn = useCallback(async () => {
    if (!address || !chainId) return;
    setLoading(true);
    setError(null);
    try {
      const nonce = await fetch("/api/auth/nonce").then((r) => r.text());
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "BasePet'e giriş yap.",
        uri: window.location.origin,
        version: "1",
        chainId,
        nonce,
      }).prepareMessage();

      const signature = await signMessageAsync({ message });
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, signature }),
      });
      if (!res.ok) throw new Error("Doğrulama başarısız");
      const data = await res.json();
      setAuthedAddress(data.address);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Giriş başarısız");
    } finally {
      setLoading(false);
    }
  }, [address, chainId, signMessageAsync]);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/me", { method: "DELETE" });
    setAuthedAddress(null);
  }, []);

  return {
    isConnected,
    address,
    authedAddress,
    isAuthenticated: Boolean(authedAddress),
    loading,
    error,
    signIn,
    signOut,
  };
}
