"use client";

import { useEffect, useState } from "react";

const KEY = "basepet_referrer";
const ADDR_RE = /^0x[a-fA-F0-9]{40}$/;

/**
 * Referral sistemi (plan §5.4) — off-chain.
 * - URL'deki ?ref=<adres> ilk ziyarette localStorage'a kaydedilir (bir kez).
 * - Bağlı kullanıcı için davet linki üretir.
 * - Bonus XP dağıtımı backend/indexer ile yapılır (canlı; referrer kaydı burada tutulur).
 */
export function useReferral(address?: string) {
  const [referrer, setReferrer] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // İlk ziyarette ?ref yakala (client-only; mount sonrası tek seferlik — kasıtlı)
  useEffect(() => {
    try {
      const existing = localStorage.getItem(KEY);
      if (existing) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setReferrer(existing);
        return;
      }
      const ref = new URLSearchParams(window.location.search).get("ref");
      if (ref && ADDR_RE.test(ref) && ref.toLowerCase() !== address?.toLowerCase()) {
        localStorage.setItem(KEY, ref);
        setReferrer(ref);
      }
    } catch {}
  }, [address]);

  const inviteLink =
    typeof window !== "undefined" && address
      ? `${window.location.origin}/?ref=${address}`
      : "";

  async function copyInvite() {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return { referrer, inviteLink, copyInvite, copied };
}
