"use client";

import type { NeedType } from "@/types";
import { NEED_META } from "@/lib/constants";

/**
 * İhtiyaç barı — globals.css'teki `.need-bar` / `.need-bar__fill--*` sınıflarını kullanır.
 */
export function NeedBar({ need, value }: { need: NeedType; value: number }) {
  const pct = Math.round(value);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
        <span>
          {NEED_META[need].icon} {NEED_META[need].label}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="need-bar">
        <div
          className={`need-bar__fill need-bar__fill--${need}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
