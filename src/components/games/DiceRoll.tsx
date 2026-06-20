"use client";

import { useEffect, useState } from "react";
import { GameShell } from "./GameShell";

const FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
type Bet = "low" | "high";

/**
 * Zar at — Low (1-3) / High (4-6) tahmin et, PLAY tx, sonra 1-6 zar.
 */
export function DiceRoll({
  onPlayTx,
  busy,
}: {
  onPlayTx: () => Promise<boolean>;
  busy: boolean;
}) {
  const [bet, setBet] = useState<Bet>("high");
  const [value, setValue] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<{ win: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!rolling) return;
    const id = setInterval(() => setValue(1 + Math.floor(Math.random() * 6)), 90);
    return () => clearInterval(id);
  }, [rolling]);

  async function handleRoll() {
    if (busy || rolling) return;
    setResult(null);
    setRolling(true);
    const ok = await onPlayTx();
    if (!ok) {
      setRolling(false);
      return;
    }
    const roll = 1 + Math.floor(Math.random() * 6);
    setValue(roll);
    setRolling(false);
    const win = bet === "low" ? roll <= 3 : roll >= 4;
    setResult({ win, text: win ? `Rolled ${roll} — You won! 🎉` : `Rolled ${roll} — Try again 🐾` });
  }

  return (
    <GameShell actionLabel="Roll (1 tx)" onPlay={handleRoll} busy={busy || rolling} result={result}>
      <div className="flex h-24 w-24 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--glass-border)] bg-[var(--bg-tertiary)] text-6xl">
        {FACES[value - 1]}
      </div>
      <div className="flex gap-2">
        {(["low", "high"] as Bet[]).map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => setBet(b)}
            disabled={busy || rolling}
            className={`rounded-[var(--radius-md)] border px-4 py-2 text-sm transition-colors ${
              bet === b
                ? "border-[var(--accent-blue)] bg-[rgba(59,130,246,0.15)]"
                : "border-[var(--glass-border)] bg-[var(--bg-tertiary)]"
            }`}
          >
            {b === "low" ? "Low (1-3)" : "High (4-6)"}
          </button>
        ))}
      </div>
    </GameShell>
  );
}
