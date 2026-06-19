"use client";

import { useCallback, useEffect, useState } from "react";

interface StreakState {
  current: number;
  longest: number;
  lastDay: string | null;
}

const KEY = "basepet_streak";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function isYesterday(prev: string, today: string) {
  const d = new Date(today);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10) === prev;
}

function load(): StreakState {
  if (typeof window === "undefined") return { current: 0, longest: 0, lastDay: null };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as StreakState;
  } catch {}
  return { current: 0, longest: 0, lastDay: null };
}

/**
 * Günlük giriş/aksiyon serisi (streak) — localStorage tabanlı (plan §3.2).
 * Supabase env varsa streak Edge Function'a da yazar (graceful, no-op değilse).
 * 7/30 gün ödülleri UI'da rozet olarak gösterilir.
 */
export function useStreak(walletAddress?: string) {
  const [state, setState] = useState<StreakState>({ current: 0, longest: 0, lastDay: null });

  // localStorage yalnızca client'ta okunur (SSR hydration uyumsuzluğunu önlemek
  // için mount sonrası tek seferlik yükleme — kasıtlı).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(load());
  }, []);

  const recordAction = useCallback(() => {
    setState((prev) => {
      const today = todayStr();
      if (prev.lastDay === today) return prev; // aynı gün, değişme
      let current = 1;
      if (prev.lastDay && isYesterday(prev.lastDay, today)) current = prev.current + 1;
      const next: StreakState = {
        current,
        longest: Math.max(prev.longest, current),
        lastDay: today,
      };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}

      // Supabase Edge Function (varsa) — fire-and-forget
      if (walletAddress && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/streak`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet_address: walletAddress }),
        }).catch(() => {});
      }
      return next;
    });
  }, [walletAddress]);

  return { ...state, recordAction };
}
