"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SlotMachine } from "./SlotMachine";
import { CoinFlip } from "./CoinFlip";
import { DiceRoll } from "./DiceRoll";
import { LuckyWheel } from "./LuckyWheel";
import { isMuted, setMuted } from "@/lib/sfx";

type GameKey = "slot" | "flip" | "dice" | "wheel";

interface GameDef {
  key: GameKey;
  name: string;
  icon: string;
  desc: string;
}

const GAMES: GameDef[] = [
  { key: "slot", name: "Cat Slot", icon: "🎰", desc: "Match 3 cat symbols" },
  { key: "flip", name: "Coin Flip", icon: "🪙", desc: "Heads or tails" },
  { key: "dice", name: "Dice Roll", icon: "🎲", desc: "Low or high" },
  { key: "wheel", name: "Lucky Wheel", icon: "🎡", desc: "Spin to win" },
];

/**
 * Oyun salonu (arcade) modalı. Play butonu bunu açar; her oyun başlatıldığında
 * PLAY tx (onPlayTx) gönderilir → fun + XP yükselir, sonra oyun çalışır (kozmetik).
 */
export function GameArcade({
  open,
  onClose,
  onPlayTx,
  busy,
  onResult,
}: {
  open: boolean;
  onClose: () => void;
  onPlayTx: () => Promise<boolean>;
  busy: boolean;
  onResult?: (win: boolean) => void;
}) {
  const [selected, setSelected] = useState<GameKey | null>(null);
  const [muted, setMutedState] = useState(() => isMuted());

  function toggleMute() {
    const m = !muted;
    setMutedState(m);
    setMuted(m);
  }

  function close() {
    setSelected(null);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[90vh] w-full max-w-lg flex-col gap-5 overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                {selected ? GAMES.find((g) => g.key === selected)?.name : "🎮 Arcade"}
              </h2>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={muted ? "Unmute" : "Mute"}
                  className="text-base text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  {muted ? "🔇" : "🔊"}
                </button>
                <button
                  type="button"
                  onClick={selected ? () => setSelected(null) : close}
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  {selected ? "← Back" : "✕ Close"}
                </button>
              </div>
            </div>

            {!selected ? (
              <>
                <p className="text-sm text-[var(--text-secondary)]">
                  Pick a game. Each play sends 1 transaction and boosts your pet&apos;s Fun + XP.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {GAMES.map((g) => (
                    <button
                      key={g.key}
                      type="button"
                      onClick={() => setSelected(g.key)}
                      className="action-btn"
                    >
                      <span className="text-3xl">{g.icon}</span>
                      <span className="text-sm font-semibold">{g.name}</span>
                      <span className="text-xs text-[var(--text-secondary)]">{g.desc}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-2">
                {selected === "slot" && <SlotMachine onPlayTx={onPlayTx} busy={busy} onResult={onResult} />}
                {selected === "flip" && <CoinFlip onPlayTx={onPlayTx} busy={busy} onResult={onResult} />}
                {selected === "dice" && <DiceRoll onPlayTx={onPlayTx} busy={busy} onResult={onResult} />}
                {selected === "wheel" && <LuckyWheel onPlayTx={onPlayTx} busy={busy} onResult={onResult} />}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
