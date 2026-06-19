"use client";

import { AnimatePresence, motion } from "framer-motion";

export type TxStatus = "idle" | "pending" | "confirmed" | "error";

/**
 * TX durum overlay'i — pending spinner + "İşleniyor…", hata mesajı (plan.md §3.4).
 */
export function TxStatusOverlay({
  status,
  message,
}: {
  status: TxStatus;
  message?: string;
}) {
  const visible = status === "pending" || status === "error";
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
        >
          <div className="glass-card flex items-center gap-3 px-5 py-3 text-sm">
            {status === "pending" ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent-blue)] border-t-transparent" />
                <span>İşleniyor…</span>
              </>
            ) : (
              <span className="text-[var(--accent-red)]">
                ⚠ {message ?? "İşlem başarısız"}
              </span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
