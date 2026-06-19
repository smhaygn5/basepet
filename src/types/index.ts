/** Kedi animasyon durumları (kod tabanlı state makinesi). */
export type PetAnimationState =
  | "idle"
  | "eat"
  | "play"
  | "sleep"
  | "bath"
  | "toilet"
  | "happy"
  | "sad";

/** İhtiyaç barı türleri. */
export type NeedType = "hunger" | "fun" | "sleep" | "toilet" | "clean";

/** Frontend'te kullanılan pet özeti (on-chain getPet çıktısından türetilir). */
export interface PetData {
  name: string;
  totalXP: bigint;
  level: bigint;
  createdAt: bigint;
  lastFedTimestamp: bigint;
  lastPlayedTimestamp: bigint;
  lastSleptTimestamp: bigint;
  lastBathedTimestamp: bigint;
  lastToiletTimestamp: bigint;
}
