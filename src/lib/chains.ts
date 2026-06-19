import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base } from "wagmi/chains";
import { createStorage, http, noopStorage } from "wagmi";

/**
 * wagmi + RainbowKit yapılandırması — YALNIZCA Base Mainnet.
 * (Proje mainnet için; Base Sepolia kullanılmaz. Yerel test anvil/foundry ile.)
 * WalletConnect projectId .env.local'dan okunur; yoksa placeholder kullanılır
 * (build kırılmasın diye). Üretimde NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID set edilmeli.
 */
export const wagmiConfig = getDefaultConfig({
  appName: "BasePet",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "BASEPET_DEV_PLACEHOLDER",
  chains: [base],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC || undefined),
  },
  ssr: true,
  // noopStorage → kalıcı bağlantı yazılmaz (otomatik/sessiz bağlanma olmaz),
  // persist/rehydrate API'si bozulmaz. Her açılış "bağlı değil" başlar.
  storage: createStorage({ storage: noopStorage }),
});
