"use client";

import { useEffect, useState } from "react";
import { GameShell, type GameResult } from "./GameShell";

const SEGMENTS = [
  { e: "🐟", t: "Tasty Fish" },
  { e: "🧶", t: "Yarn Ball" },
  { e: "🐾", t: "Lucky Paw" },
  { e: "🎾", t: "Toy Time" },
  { e: "💤", t: "Cozy Catnap" },
  { e: "⭐", t: "Bonus Vibes" },
];

/**
 * Şans çarkı — Spin → PLAY tx → kedi temalı bir dilimde durur (kozmetik ödül).
 */
export function LuckyWheel({
  onPlayTx,
  busy,
  onResult,
}: {
  onPlayTx: () => Promise<boolean>;
  busy: boolean;
  onResult?: (win: boolean) => void;
}) {
  const [active, setActive] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);

  useEffect(() => {
    if (!spinning) return;
    const id = setInterval(() => setActive((a) => (a + 1) % SEGMENTS.length), 110);
    return () => clearInterval(id);
  }, [spinning]);

  async function handleSpin() {
    if (busy || spinning) return;
    setResult(null);
    setSpinning(true);
    const ok = await onPlayTx();
    if (!ok) {
      setSpinning(false);
      return;
    }
    const idx = Math.floor(Math.random() * SEGMENTS.length);
    setActive(idx);
    setSpinning(false);
    const seg = SEGMENTS[idx];
    setResult({
      win: seg.e === "⭐",
      text: seg.e === "⭐" ? `${seg.e} ${seg.t}! Lucky you! 🎉` : `${seg.e} ${seg.t}!`,
      id: Date.now(),
    });
  }

  return (
    <GameShell
      actionLabel="Spin (1 tx)"
      onPlay={handleSpin}
      busy={busy || spinning}
      result={result}
      onResult={onResult}
    >
      <div className="grid grid-cols-3 gap-2">
        {SEGMENTS.map((s, i) => (
          <div
            key={s.t}
            className={`flex h-16 w-20 flex-col items-center justify-center rounded-[var(--radius-md)] border text-center transition-colors ${
              i === active
                ? "border-[var(--accent-amber)] bg-[rgba(245,158,11,0.18)]"
                : "border-[var(--glass-border)] bg-[var(--bg-tertiary)]"
            }`}
          >
            <span className="text-2xl">{s.e}</span>
            <span className="text-[10px] text-[var(--text-secondary)]">{s.t}</span>
          </div>
        ))}
      </div>
    </GameShell>
  );
}
