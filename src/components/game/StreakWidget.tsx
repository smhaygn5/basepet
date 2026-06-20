"use client";

/**
 * Streak (günlük seri) widget'ı — 7/30 gün ödül eşiklerini gösterir (plan §3.2).
 */
export function StreakWidget({ current, longest }: { current: number; longest: number }) {
  const nextReward = current < 7 ? 7 : current < 30 ? 30 : null;
  return (
    <div className="glass-card flex items-center justify-between gap-3 p-3 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-xl">🔥</span>
        <div>
          <p className="font-semibold">{current} Day Streak</p>
          <p className="text-xs text-[var(--text-secondary)]">Longest: {longest} days</p>
        </div>
      </div>
      {nextReward && (
        <span className="rounded-full bg-[rgba(245,158,11,0.15)] px-2 py-1 text-xs text-[var(--accent-amber)]">
          Reward on day {nextReward} 🎁
        </span>
      )}
    </div>
  );
}
