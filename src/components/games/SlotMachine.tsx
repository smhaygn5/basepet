"use client";

import { useEffect, useState } from "react";
import { GameShell } from "./GameShell";

const SYMBOLS = ["🐟", "🧶", "🐾", "🎾", "🐭", "🥛"];
const pick = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

/**
 * Kedi temalı 3 makaralı slot. Spin → PLAY tx → onaylanınca makaralar döner.
 * 3 eşleşme = kozmetik "Jackpot". Bahis yok.
 */
export function SlotMachine({
  onPlayTx,
  busy,
}: {
  onPlayTx: () => Promise<boolean>;
  busy: boolean;
}) {
  const [reels, setReels] = useState<string[]>(["🐾", "🐾", "🐾"]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ win: boolean; text: string } | null>(null);

  // Dönerken makaraları hızlıca değiştir
  useEffect(() => {
    if (!spinning) return;
    const id = setInterval(() => setReels([pick(), pick(), pick()]), 90);
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
    const final = [pick(), pick(), pick()];
    setReels(final);
    setSpinning(false);
    const win = final[0] === final[1] && final[1] === final[2];
    const twoMatch = final[0] === final[1] || final[1] === final[2] || final[0] === final[2];
    setResult({
      win,
      text: win ? "JACKPOT! 🎉 All three matched!" : twoMatch ? "So close! 🐾" : "Try again 🐾",
    });
  }

  return (
    <GameShell actionLabel="Spin (1 tx)" onPlay={handleSpin} busy={busy || spinning} result={result}>
      <div className="flex gap-3">
        {reels.map((s, i) => (
          <div
            key={i}
            className="flex h-20 w-20 items-center justify-center rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-[var(--bg-tertiary)] text-4xl"
          >
            {s}
          </div>
        ))}
      </div>
    </GameShell>
  );
}
