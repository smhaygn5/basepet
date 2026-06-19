"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PetAnimationState } from "@/types";

/** Geçici animasyonların süreleri (ms) — sonunda idle'a döner. */
const ANIMATION_DURATIONS: Record<PetAnimationState, number> = {
  idle: 0, // kalıcı
  eat: 2000,
  play: 3000,
  sleep: 4000,
  bath: 2500,
  toilet: 2000,
  happy: 1500,
  sad: 2000,
};

/**
 * Kedi animasyon state makinesi.
 * `trigger(state)` geçici bir animasyon başlatır; süresi dolunca idle'a döner.
 * Sözleşme aksiyonları ile UI'daki görsel tepkiyi senkronize etmek için kullanılır.
 */
export function usePetAnimation(initial: PetAnimationState = "idle") {
  const [animation, setAnimation] = useState<PetAnimationState>(initial);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const trigger = useCallback(
    (state: PetAnimationState) => {
      clear();
      setAnimation(state);
      const duration = ANIMATION_DURATIONS[state];
      if (duration > 0) {
        timeoutRef.current = setTimeout(() => {
          setAnimation("idle");
          timeoutRef.current = null;
        }, duration);
      }
    },
    [clear],
  );

  useEffect(() => clear, [clear]);

  return { animation, trigger, setAnimation };
}
