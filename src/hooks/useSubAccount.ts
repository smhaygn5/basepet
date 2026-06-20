"use client";

import { useCallback, useState } from "react";

/**
 * Sub-Accounts / Spend Permissions iskeleti (plan §5.2) — DENEYSEL / ERTELENDİ.
 *
 * Hedef UX: kullanıcı oturum başında "günlük max N bakım işlemi" yetkisi verir;
 * sonrasında butonlar popup'sız (sub-account ile arka planda imzalı) çalışır.
 *
 * Bu yalnızca **Coinbase Smart Wallet** ile mümkündür (wallet_addSubAccount /
 * Spend Permissions, ERC-7715). Tam entegrasyon + test canlı Coinbase Smart
 * Wallet ortamı gerektirir; burada arayüz iskeleti ve graceful fallback var.
 *
 * Canlı entegrasyon için:
 *  - Coinbase Smart Wallet bağlayıcısı (OnchainKit/wagmi) ile çalış
 *  - `wallet_addSubAccount` ile sub-account oluştur
 *  - Spend Permission talep et (limit + süre)
 *  - performAction'ı sub-account üzerinden gönder (popup yok)
 */
export function useSubAccount() {
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // dailyLimit: canlı entegrasyonda spend permission limiti olarak kullanılacak.
  const requestPermission = useCallback(async (dailyLimit = 10) => {
    setError(null);
    void dailyLimit;
    const eth = (
      window as unknown as {
        ethereum?: { request?: (a: { method: string; params?: unknown[] }) => Promise<unknown> };
      }
    ).ethereum;
    if (!eth?.request) {
      setError("No compatible wallet");
      return false;
    }
    try {
      // TODO (canlı): Coinbase Smart Wallet sub-account + spend permission akışı.
      // Şimdilik desteklenmiyor → kullanıcı normal imza akışını kullanır.
      setError("Sub-Accounts are enabled in production (Coinbase Smart Wallet)");
      return false;
    } catch {
      setError("Authorization failed");
      return false;
    }
  }, []);

  return { enabled, error, requestPermission, setEnabled };
}
