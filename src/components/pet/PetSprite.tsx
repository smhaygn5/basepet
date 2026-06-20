"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import type { PetAnimationState } from "@/types";

/**
 * Ruh hali → aday dosya adları (uzantısız). Noktalı ad birincil (kullanıcının
 * AutoSprite çıktısı), tireli ad yedek. bath/toilet için ayrı GIF yok → sad.
 */
const NAMES: Record<PetAnimationState, string[]> = {
  idle: ["cat.idle", "cat-idle"],
  eat: ["cat.eat", "cat-eat"],
  play: ["cat.play", "cat-play"],
  sleep: ["cat.sleep", "cat-sleep"],
  bath: ["cat.sad", "cat-sad"], // banyo GIF'i yok → sad
  toilet: ["cat.sad", "cat-sad"], // tuvalet GIF'i yok → sad
  happy: ["cat.happy", "cat-happy"],
  sad: ["cat.sad", "cat-sad"],
};

/** Denenen uzantılar (sırayla). gif/webp animasyonlu; png statik. */
const EXTS = ["gif", "webp", "png"] as const;

/** Her durum için aday src listesi (ad × uzantı). */
function candidates(state: PetAnimationState): string[] {
  return NAMES[state].flatMap((n) => EXTS.map((e) => `/pets/${n}.${e}`));
}

/** Statik PNG'ler için micro-animasyon (gif/webp zaten oynar). */
const MOTION: Record<
  PetAnimationState,
  { y?: number[]; x?: number[]; scale?: number[]; rotate?: number[]; dur: number }
> = {
  idle: { y: [0, -8, 0], dur: 3 },
  eat: { y: [0, 6, 0], dur: 0.6 },
  play: { y: [0, -22, 0], dur: 0.5 },
  sleep: { scale: [1, 1.04, 1], dur: 4 },
  bath: { x: [-6, 6, -6], dur: 0.4 },
  toilet: { y: [0, 5, 0], dur: 1 },
  happy: { y: [0, -26, 0], dur: 0.45 },
  sad: { rotate: [0, -3, 0], dur: 2.5 },
};

/**
 * 2D evcil hayvan gösterimi. Durum → public/pets/cat.<durum>.(gif|webp|png).
 * Aday yollar sırayla denenir; biri 404 olursa sonrakine, hepsi biterse idle'a,
 * idle de yoksa emoji placeholder'a düşer. gif/webp kendi animasyonlu → üstüne
 * Framer Motion bindirilmez; png statik → micro-animasyon uygulanır.
 */
export function PetSprite({ animation = "idle" }: { animation?: PetAnimationState }) {
  // src yolu → başarısız mı (404)
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  const pick = (state: PetAnimationState): string | null =>
    candidates(state).find((src) => !failed[src]) ?? null;

  const reqSrc = pick(animation);
  const idleSrc = pick("idle");

  // İstenen yoksa idle'a düş; idle de yoksa placeholder
  const src = reqSrc ?? idleSrc;
  const display: PetAnimationState = reqSrc ? animation : "idle";

  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="select-none text-center"
        >
          <div className="text-[96px] leading-none">🐱</div>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Add cat images to <code>public/pets/</code>
          </p>
        </motion.div>
      </div>
    );
  }

  const selfAnimated = !src.endsWith(".png"); // gif/webp kendi oynar
  const m = MOTION[display];
  const onError = () => setFailed((f) => ({ ...f, [src]: true }));

  const img = (
    <Image
      src={src}
      alt="BasePet kedisi"
      fill
      unoptimized
      priority
      sizes="(max-width: 768px) 80vw, 400px"
      style={{ objectFit: "contain" }}
      onError={onError}
    />
  );

  // Görsellerin arka planı beyaz (şeffaf değil) → kediyi temiz yuvarlatılmış beyaz
  // "portre kartı" içine al ki beyaz, kaba kare değil kasıtlı çerçeve gibi dursun.
  const STAGE = "relative aspect-square w-[78%] max-w-[340px] overflow-hidden rounded-3xl bg-white shadow-lg";

  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      {selfAnimated ? (
        <motion.div
          key={src}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className={STAGE}
        >
          {img}
        </motion.div>
      ) : (
        <motion.div
          key={src}
          animate={{ y: m.y, x: m.x, scale: m.scale, rotate: m.rotate }}
          transition={{ duration: m.dur, repeat: Infinity, ease: "easeInOut" }}
          className={STAGE}
        >
          {img}
        </motion.div>
      )}
    </div>
  );
}
