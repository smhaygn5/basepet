"use client";

import { useCallback, useEffect, useState } from "react";
import { ActionType } from "@/lib/contracts";

export interface Quest {
  key: string;
  label: string;
  target: number;
  progress: number;
  completed: boolean;
}

interface QuestState {
  day: string;
  quests: Quest[];
  /** Bugün kullanılan farklı aksiyon türleri (variety quest için). */
  usedActions: number[];
}

const KEY = "basepet_quests";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function freshQuests(): Quest[] {
  return [
    { key: "feed_twice", label: "Feed your cat twice", target: 2, progress: 0, completed: false },
    { key: "bath_toilet", label: "1 bath + 1 toilet", target: 2, progress: 0, completed: false },
    { key: "variety", label: "Use 3 different actions", target: 3, progress: 0, completed: false },
  ];
}

function load(): QuestState {
  const empty: QuestState = { day: todayStr(), quests: freshQuests(), usedActions: [] };
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as QuestState;
      if (parsed.day === todayStr()) return parsed;
    }
  } catch {}
  return empty;
}

/**
 * Günlük görev takibi — localStorage, tarih bazlı sıfırlanır (plan §3.2).
 * Her başarılı aksiyon `recordAction(actionType)` ile ilerletir.
 */
export function useDailyQuests() {
  const [state, setState] = useState<QuestState>({ day: todayStr(), quests: freshQuests(), usedActions: [] });

  // localStorage yalnızca client'ta okunur (SSR hydration uyumsuzluğunu önlemek
  // için mount sonrası tek seferlik yükleme — kasıtlı).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(load());
  }, []);

  const recordAction = useCallback((action: ActionType) => {
    setState((prev) => {
      const base = prev.day === todayStr() ? prev : { day: todayStr(), quests: freshQuests(), usedActions: [] };
      const usedActions = base.usedActions.includes(action)
        ? base.usedActions
        : [...base.usedActions, action];

      const quests = base.quests.map((q) => {
        let progress = q.progress;
        if (q.key === "feed_twice" && action === ActionType.FEED) progress += 1;
        if (q.key === "bath_toilet" && (action === ActionType.BATH || action === ActionType.TOILET))
          progress += 1;
        if (q.key === "variety") progress = usedActions.length;
        progress = Math.min(progress, q.target);
        return { ...q, progress, completed: progress >= q.target };
      });

      const next: QuestState = { day: base.day, quests, usedActions };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  return { quests: state.quests, recordAction };
}
