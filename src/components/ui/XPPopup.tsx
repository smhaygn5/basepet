"use client";

import { AnimatePresence, motion } from "framer-motion";

/**
 * TX onaylanınca yukarı kayarak fade olan "+XP" popup'ı (plan.md §3.4).
 */
export function XPPopup({ amount }: { amount: number | null }) {
  return (
    <AnimatePresence>
      {amount !== null && (
        <motion.div
          key="xp-popup"
          initial={{ opacity: 0, y: 0, scale: 0.8 }}
          animate={{ opacity: 1, y: -60, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 select-none text-2xl font-bold text-[var(--accent-amber)]"
        >
          +{amount} XP ⭐
        </motion.div>
      )}
    </AnimatePresence>
  );
}
