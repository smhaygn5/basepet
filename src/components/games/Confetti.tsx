"use client";

import { motion } from "framer-motion";

const PIECES = ["🎉", "⭐", "🐾", "✨", "🎊", "🐟", "🧶", "💫"];
// Deterministik dağılım (render'da Math.random YOK)
const SPREAD = [-140, -100, -60, -25, 25, 60, 100, 140];

/**
 * Kazanınca kısa emoji parçacık patlaması. `key` ile her seferinde yeniden tetiklenir.
 */
export function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-hidden">
      {PIECES.map((p, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 1, x: 0, y: 0, scale: 0.6 }}
          animate={{ opacity: 0, x: SPREAD[i], y: -120 - (i % 3) * 40, scale: 1.2, rotate: i * 45 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute text-2xl"
        >
          {p}
        </motion.span>
      ))}
    </div>
  );
}
