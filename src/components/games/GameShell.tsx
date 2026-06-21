"use client";

import { useEffect, type ReactNode } from "react";
import { playSfx } from "@/lib/sfx";
import { Confetti } from "./Confetti";

export interface GameResult {
  win: boolean;
  text: string;
  /** Her oynayışta değişir → ses/confetti tekrar tetiklenir. */
  id: number;
}

/**
 * Mini oyunlar için ortak kabuk: oyun görseli + "Play (1 tx)" butonu + sonuç + efektler.
 * Sonuç değişince ses çalar, kazanınca confetti gösterir, onResult(win) bildirir.
 */
export function GameShell({
  children,
  actionLabel,
  onPlay,
  busy,
  result,
  onResult,
}: {
  children: ReactNode;
  actionLabel: string;
  onPlay: () => void;
  busy: boolean;
  result?: GameResult | null;
  onResult?: (win: boolean) => void;
}) {
  useEffect(() => {
    if (!result) return;
    playSfx(result.win ? "win" : "lose");
    onResult?.(result.win);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.id]);

  function handlePlay() {
    if (busy) return;
    playSfx("spin");
    onPlay();
  }

  return (
    <div className="relative flex flex-col items-center gap-5">
      {result?.win && <Confetti key={result.id} />}

      {children}

      {result && (
        <p
          className={`text-sm font-semibold ${
            result.win ? "text-[var(--accent-green)]" : "text-[var(--text-secondary)]"
          }`}
        >
          {result.text}
        </p>
      )}

      <button type="button" className="cta-btn min-w-[180px]" onClick={handlePlay} disabled={busy}>
        {busy ? "Processing…" : actionLabel}
      </button>
      <p className="text-xs text-[var(--text-muted)]">
        Each play sends 1 transaction and raises your pet&apos;s Fun + XP.
      </p>
    </div>
  );
}
