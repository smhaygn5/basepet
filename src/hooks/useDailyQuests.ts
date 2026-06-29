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

/**
 * Görev kuralı — ilerlemenin nasıl arttığını tanımlar:
 * - action:    belirtilen aksiyon(lar) yapıldıkça +1
 * - variety:   bugün kullanılan FARKLI aksiyon sayısı
 * - anyAction: herhangi bir bakım aksiyonu yapıldıkça +1
 * - win:       bir mini-oyun kazanıldıkça +1
 */
type QuestRule =
  | { kind: "action"; actions: ActionType[] }
  | { kind: "variety" }
  | { kind: "anyAction" }
  | { kind: "win" };

interface QuestDef {
  key: string;
  label: string;
  target: number;
  rule: QuestRule;
}

/**
 * Tüm olası günlük görevler. Her gün buradan 4'lük bir dilim seçilir (DAILY_COUNT).
 * Sıra, her günlük dilimde tür çeşitliliği olacak şekilde dengelenmiştir
 * (besleme + oyun/kazanım + temizlik + variety).
 */
const QUEST_POOL: QuestDef[] = [
  // Dilim A
  { key: "feed_twice", label: "Feed your cat twice", target: 2, rule: { kind: "action", actions: [ActionType.FEED] } },
  { key: "play_twice", label: "Play 2 mini-games", target: 2, rule: { kind: "action", actions: [ActionType.PLAY] } },
  { key: "bath_toilet", label: "1 bath + 1 toilet", target: 2, rule: { kind: "action", actions: [ActionType.BATH, ActionType.TOILET] } },
  { key: "win_game", label: "Win a mini-game", target: 1, rule: { kind: "win" } },
  // Dilim B
  { key: "feed_thrice", label: "Feed your cat 3 times", target: 3, rule: { kind: "action", actions: [ActionType.FEED] } },
  { key: "sleep_twice", label: "Put your cat to sleep twice", target: 2, rule: { kind: "action", actions: [ActionType.SLEEP] } },
  { key: "toilet_twice", label: "Clean the litter twice", target: 2, rule: { kind: "action", actions: [ActionType.TOILET] } },
  { key: "variety3", label: "Use 3 different actions", target: 3, rule: { kind: "variety" } },
  // Dilim C
  { key: "bath_twice", label: "Bathe your cat twice", target: 2, rule: { kind: "action", actions: [ActionType.BATH] } },
  { key: "busy_day", label: "Perform 5 care actions", target: 5, rule: { kind: "anyAction" } },
  { key: "variety_all", label: "Use all 5 care actions", target: 5, rule: { kind: "variety" } },
  { key: "win_two", label: "Win 2 mini-games", target: 2, rule: { kind: "win" } },
];

const DAILY_COUNT = 4;
const KEY = "basepet_quests";
const DEF_BY_KEY = new Map(QUEST_POOL.map((d) => [d.key, d]));

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/** Gün sayısı (UTC) — günlük görev seçimini deterministik döndürmek için tohum. */
function epochDay() {
  return Math.floor(Date.parse(todayStr()) / 86_400_000);
}

/** Bugünün görev tanımları — tarihe göre havuzdan dönerek seçilir (RNG yok). */
function todayDefs(): QuestDef[] {
  const len = QUEST_POOL.length;
  const start = (((epochDay() % len) + len) % len) * DAILY_COUNT;
  const out: QuestDef[] = [];
  for (let i = 0; i < DAILY_COUNT; i++) out.push(QUEST_POOL[(start + i) % len]);
  return out;
}

function freshQuests(): Quest[] {
  return todayDefs().map((d) => ({
    key: d.key,
    label: d.label,
    target: d.target,
    progress: 0,
    completed: false,
  }));
}

function load(): QuestState {
  const fresh = freshQuests();
  const empty: QuestState = { day: todayStr(), quests: fresh, usedActions: [] };
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<QuestState>;
      if (parsed.day === todayStr() && Array.isArray(parsed.quests)) {
        // Etiketler/hedefler HER ZAMAN koddan gelir; localStorage'dan yalnızca
        // ilerleme key ile eşlenir (o gün için seçilen görevlere göre).
        const savedByKey = new Map(parsed.quests.map((q) => [q.key, q]));
        const quests = fresh.map((q) => {
          const progress = Math.min(savedByKey.get(q.key)?.progress ?? 0, q.target);
          return { ...q, progress, completed: progress >= q.target };
        });
        return { day: todayStr(), quests, usedActions: parsed.usedActions ?? [] };
      }
    }
  } catch {}
  return empty;
}

/**
 * Günlük görev takibi — localStorage, tarih bazlı sıfırlanır. Görevler her gün
 * havuzdan deterministik olarak DEĞİŞİR (aynı gün herkeste/aynı, günler arası farklı).
 */
export function useDailyQuests() {
  const [state, setState] = useState<QuestState>({
    day: todayStr(),
    quests: freshQuests(),
    usedActions: [],
  });

  // localStorage yalnızca client'ta okunur (SSR hydration uyumsuzluğunu önlemek
  // için mount sonrası tek seferlik yükleme — kasıtlı).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(load());
  }, []);

  const recordAction = useCallback((action: ActionType) => {
    setState((prev) => {
      const base =
        prev.day === todayStr()
          ? prev
          : { day: todayStr(), quests: freshQuests(), usedActions: [] };
      const usedActions = base.usedActions.includes(action)
        ? base.usedActions
        : [...base.usedActions, action];

      const quests = base.quests.map((q) => {
        const rule = DEF_BY_KEY.get(q.key)?.rule;
        let progress = q.progress;
        if (rule) {
          if (rule.kind === "action" && rule.actions.includes(action)) progress += 1;
          else if (rule.kind === "variety") progress = usedActions.length;
          else if (rule.kind === "anyAction") progress += 1;
        }
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

  const recordWin = useCallback(() => {
    setState((prev) => {
      const base =
        prev.day === todayStr()
          ? prev
          : { day: todayStr(), quests: freshQuests(), usedActions: [] };
      const quests = base.quests.map((q) => {
        if (DEF_BY_KEY.get(q.key)?.rule.kind !== "win") return q;
        const progress = Math.min(q.progress + 1, q.target);
        return { ...q, progress, completed: progress >= q.target };
      });
      const next: QuestState = { ...base, quests };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  return { quests: state.quests, recordAction, recordWin };
}
