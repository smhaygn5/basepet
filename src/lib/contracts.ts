import { base, foundry } from "wagmi/chains";
import { Attribution } from "ox/erc8021";
import { petCoreAbi } from "./petCoreAbi";
import { accessoryShopAbi } from "./accessoryShopAbi";

export { petCoreAbi, accessoryShopAbi };

/**
 * Base Builder Code (ERC-8021) attribution suffix.
 * base.dev'den alınan builder code'dan üretilir; işlemlerin calldata'sına
 * `dataSuffix` olarak eklenince zincirdeki tx'ler bu uygulamaya atfedilir
 * (analytics + weekly leaderboard + builder rewards). Kozmetik/güvenli — yalnızca
 * calldata sonuna eklenen herkese açık bir etikettir.
 */
export const BUILDER_DATA_SUFFIX = Attribution.toDataSuffix({
  codes: ["bc_5gd85lfu"],
});

/**
 * PetCore (UUPS proxy) sözleşme adresleri (zincir bazlı).
 * - foundry (31337): anvil'de ERC1967 proxy adresi (yerel test, Deploy.s.sol)
 * - base (8453): Base Mainnet'e DeployProduction ile deploy sonrası doldurulacak
 */
export const PET_CORE_ADDRESS: Record<number, `0x${string}`> = {
  [foundry.id]: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  [base.id]: "0x1bD23335C1DC6B5072954E56608e563cFC018673",
};

/** AccessoryShop (ERC-1155 UUPS proxy) adresleri. */
export const ACCESSORY_SHOP_ADDRESS: Record<number, `0x${string}`> = {
  [foundry.id]: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  [base.id]: "0x48c3D11787de88990215d6FCf5A0baB9B265E463",
};

/** Sözleşmedeki ActionType enum'u ile birebir eşleşir. */
export enum ActionType {
  FEED = 0,
  PLAY = 1,
  SLEEP = 2,
  BATH = 3,
  TOILET = 4,
}

/** AccessoryShop token ID'leri (sözleşme sabitleriyle eşleşir). */
export const ACCESSORY_IDS = {
  CAT_FOOD: 1,
  COLLAR: 2,
  PARTY_HAT: 3,
  PREMIUM_FOOD: 4,
  WALLPAPER: 5,
  // Sezonluk koleksiyon (100+ aralığı) — plan §5.5
  SEASON_WINTER_HAT: 101,
  SEASON_SPRING_FLOWER: 102,
} as const;

export interface AccessoryMeta {
  id: number;
  name: string;
  icon: string;
  rarity: "common" | "rare" | "seasonal";
}

export const ACCESSORIES: AccessoryMeta[] = [
  { id: ACCESSORY_IDS.CAT_FOOD, name: "Cat Food", icon: "🍖", rarity: "common" },
  { id: ACCESSORY_IDS.COLLAR, name: "Special Collar", icon: "🎀", rarity: "rare" },
  { id: ACCESSORY_IDS.PARTY_HAT, name: "Party Hat", icon: "🎉", rarity: "rare" },
  { id: ACCESSORY_IDS.PREMIUM_FOOD, name: "Premium Food", icon: "⭐", rarity: "common" },
  { id: ACCESSORY_IDS.WALLPAPER, name: "Wallpaper", icon: "🖼️", rarity: "common" },
  { id: ACCESSORY_IDS.SEASON_WINTER_HAT, name: "Winter Hat", icon: "🧢", rarity: "seasonal" },
  { id: ACCESSORY_IDS.SEASON_SPRING_FLOWER, name: "Spring Flower", icon: "🌸", rarity: "seasonal" },
];
