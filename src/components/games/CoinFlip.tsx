"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GameShell } from "./GameShell";

type Side = "heads" | "tails";

/**
 * Yazı-tura — kafa (🐱) / kuyruk (🐾) seç, PLAY tx, sonra rastgele sonuç.
 */
export function CoinFlip({
  onPlayTx,
  busy,
}: {
  onPlayTx: () => Promise<boolean>;
  busy: boolean;
}) {
  const [choice, setChoice] = useState<Side>("heads");
  const [face, setFace] = useState<Side>("heads");
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState<{ win: boolean; text: string } | null>(null);

  async function handleFlip() {
    if (busy || flipping) return;
    setResult(null);
    setFlipping(true);
    const ok = await onPlayTx();
    if (!ok) {
      setFlipping(false);
      return;
    }
    const outcome: Side = Math.random() < 0.5 ? "heads" : "tails";
    setFace(outcome);
    setFlipping(false);
    const win = outcome === choice;
    setResult({ win, text: win ? "You won! 🎉" : "You lost 🐾 Try again!" });
  }

  return (
    <GameShell actionLabel="Flip (1 tx)" onPlay={handleFlip} busy={busy || flipping} result={result}>
      <motion.div
        key={face + (flipping ? "f" : "")}
        animate={flipping ? { rotateY: [0, 360, 720] } : { rotateY: 0 }}
        transition={{ duration: 0.6, repeat: flipping ? Infinity : 0, ease: "linear" }}
        className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-[var(--accent-amber)] bg-[var(--bg-tertiary)] text-5xl"
      >
        {face === "heads" ? "🐱" : "🐾"}
      </motion.div>

      <div className="flex gap-2">
        {(["heads", "tails"] as Side[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setChoice(s)}
            disabled={busy || flipping}
            className={`rounded-[var(--radius-md)] border px-4 py-2 text-sm capitalize transition-colors ${
              choice === s
                ? "border-[var(--accent-blue)] bg-[rgba(59,130,246,0.15)]"
                : "border-[var(--glass-border)] bg-[var(--bg-tertiary)]"
            }`}
          >
            {s === "heads" ? "Heads 🐱" : "Tails 🐾"}
          </button>
        ))}
      </div>
    </GameShell>
  );
}
