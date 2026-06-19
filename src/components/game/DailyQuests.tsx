"use client";

import type { Quest } from "@/hooks/useDailyQuests";

/**
 * Günlük görevler widget'ı — dinamik (useDailyQuests'ten gelen quest'ler).
 */
export function DailyQuests({ quests }: { quests: Quest[] }) {
  const completed = quests.filter((q) => q.completed).length;
  return (
    <div className="glass-card flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Daily Quests</span>
        <span className="text-xs text-[var(--text-secondary)]">
          {completed}/{quests.length}
        </span>
      </div>
      <div className="need-bar">
        <div
          className="need-bar__fill need-bar__fill--fun"
          style={{ width: `${quests.length ? (completed / quests.length) * 100 : 0}%` }}
        />
      </div>
      <ul className="mt-1 flex flex-col gap-1 text-xs text-[var(--text-secondary)]">
        {quests.map((q) => (
          <li key={q.key} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <span>{q.completed ? "✅" : "⬜"}</span>
              <span>{q.label}</span>
            </span>
            <span>
              {q.progress}/{q.target}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
