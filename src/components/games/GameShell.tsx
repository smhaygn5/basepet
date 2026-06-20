"use client";

import type { ReactNode } from "react";

/**
 * Mini oyunlar için ortak kabuk: oyun görseli + "Play (1 tx)" butonu + sonuç satırı.
 * Her oyun başlatma butonu PLAY tx'i tetikler (fun + XP); tx onaylanınca oyun çalışır.
 */
export function GameShell({
  children,
  actionLabel,
  onPlay,
  busy,
  result,
}: {
  children: ReactNode;
  actionLabel: string;
  onPlay: () => void;
  busy: boolean;
  result?: { win: boolean; text: string } | null;
}) {
  return (
    <div className="flex flex-col items-center gap-5">
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

      <button type="button" className="cta-btn min-w-[180px]" onClick={onPlay} disabled={busy}>
        {busy ? "Processing…" : actionLabel}
      </button>
      <p className="text-xs text-[var(--text-muted)]">
        Each play sends 1 transaction and raises your pet&apos;s Fun + XP.
      </p>
    </div>
  );
}
