import type { NeedType } from "@/types";
import { ActionType } from "@/lib/contracts";

/** İhtiyaç barı azalma oranları — saat başına % (plan.md §10.4). */
export const DECAY_RATES: Record<NeedType, number> = {
  hunger: 8.33, // 12 saatte sıfır
  fun: 6.25, // 16 saatte sıfır
  sleep: 4.17, // 24 saatte sıfır
  toilet: 10, // 10 saatte sıfır
  clean: 5, // 20 saatte sıfır
};

/** İhtiyaç → onu yenileyen aksiyon. */
export const NEED_TO_ACTION: Record<NeedType, ActionType> = {
  hunger: ActionType.FEED,
  fun: ActionType.PLAY,
  sleep: ActionType.SLEEP,
  toilet: ActionType.TOILET,
  clean: ActionType.BATH,
};

/** UI etiketleri ve ikonları. */
export const NEED_META: Record<NeedType, { label: string; icon: string }> = {
  hunger: { label: "Hunger", icon: "🍖" },
  fun: { label: "Fun", icon: "🎮" },
  sleep: { label: "Sleep", icon: "🌙" },
  toilet: { label: "Toilet", icon: "💧" },
  clean: { label: "Clean", icon: "🚿" },
};

/** Aksiyon başına temel XP (sözleşme varsayılanı ile eşleşir). */
export const BASE_XP_PER_ACTION = 50;

/** level = floor(sqrt(totalXP / 100)) — sözleşmedeki formülle aynı. */
export function calculateLevel(totalXP: number): number {
  return Math.max(1, Math.floor(Math.sqrt(totalXP / 100)));
}

/** Bir sonraki seviye için gereken toplam XP. */
export function xpForLevel(level: number): number {
  return level * level * 100;
}

/**
 * İhtiyaç yüzdesi: son aksiyondan bu yana geçen süre × decay oranı.
 * lastTimestamp 0 ise createdAt baz alınır (yeni pet barları zamanla azalır).
 */
export function calculateNeedPercentage(
  lastTimestamp: number,
  decayRatePerHour: number,
  createdAt: number,
  nowMs: number = Date.now(),
): number {
  const baseline = lastTimestamp > 0 ? lastTimestamp : createdAt;
  if (baseline === 0) return 100;
  const hoursSince = (nowMs / 1000 - baseline) / 3600;
  return Math.max(0, Math.min(100, 100 - hoursSince * decayRatePerHour));
}
