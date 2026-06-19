"use client";

import { xpForLevel } from "@/lib/constants";

/**
 * Seviye + XP ilerleme rozeti. Bir sonraki seviyeye kalan XP'yi gösterir.
 */
export function LevelBadge({ level, totalXP }: { level: number; totalXP: number }) {
  const currentLevelXP = xpForLevel(level);
  const nextLevelXP = xpForLevel(level + 1);
  const span = Math.max(1, nextLevelXP - currentLevelXP);
  const progress = Math.min(100, Math.max(0, ((totalXP - currentLevelXP) / span) * 100));

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold">Lv.{level}</span>
        <span className="text-[var(--text-secondary)]">
          {totalXP} / {nextLevelXP} XP
        </span>
      </div>
      <div className="need-bar">
        <div className="need-bar__fill need-bar__fill--sleep" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
