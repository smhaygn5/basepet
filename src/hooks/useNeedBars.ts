"use client";

import { useEffect, useMemo, useState } from "react";
import type { NeedType, PetData } from "@/types";
import { DECAY_RATES, calculateNeedPercentage } from "@/lib/constants";

/** İhtiyaç → ilgili on-chain timestamp alanı. */
const NEED_TIMESTAMP_FIELD: Record<NeedType, keyof PetData> = {
  hunger: "lastFedTimestamp",
  fun: "lastPlayedTimestamp",
  sleep: "lastSleptTimestamp",
  toilet: "lastToiletTimestamp",
  clean: "lastBathedTimestamp",
};

const NEEDS: NeedType[] = ["hunger", "fun", "sleep", "toilet", "clean"];

/**
 * On-chain timestamp'lardan ihtiyaç barı yüzdelerini hesaplar.
 * `now` her 30 sn'de bir güncellenir → barlar canlı azalır.
 * Hesaplama render'da useMemo ile saf şekilde yapılır (now + pet girdileriyle).
 */
export function useNeedBars(pet?: PetData): Record<NeedType, number> {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  return useMemo(() => {
    const result = {} as Record<NeedType, number>;
    const createdAt = pet ? Number(pet.createdAt) : 0;
    for (const need of NEEDS) {
      const last = pet ? Number(pet[NEED_TIMESTAMP_FIELD[need]]) : 0;
      result[need] = pet
        ? calculateNeedPercentage(last, DECAY_RATES[need], createdAt, now)
        : 100;
    }
    return result;
  }, [pet, now]);
}
