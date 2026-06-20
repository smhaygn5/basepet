"use client";

import { useAccount, useChainId, useReadContracts, useSwitchChain } from "wagmi";
import { base } from "wagmi/chains";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  ACCESSORIES,
  ACCESSORY_SHOP_ADDRESS,
  accessoryShopAbi,
} from "@/lib/contracts";

const ZERO = "0x0000000000000000000000000000000000000000";
const RARITY_COLOR: Record<string, string> = {
  common: "var(--text-secondary)",
  rare: "var(--accent-purple)",
  seasonal: "var(--accent-amber)",
};

export default function InventoryPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const shop = ACCESSORY_SHOP_ADDRESS[chainId];
  const deployed = Boolean(shop && shop !== ZERO);

  const { data } = useReadContracts({
    contracts: ACCESSORIES.map((a) => ({
      address: shop,
      abi: accessoryShopAbi,
      functionName: "balanceOf" as const,
      args: address ? [address, BigInt(a.id)] : undefined,
    })),
    query: { enabled: Boolean(address && deployed) },
  });

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex items-center gap-3">
        <span className="text-3xl">📦</span>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          Envanter
        </h1>
      </div>

      {!isConnected ? (
        <div className="glass-card flex flex-col items-center gap-3 p-8">
          <p className="text-sm text-[var(--text-secondary)]">
            Aksesuarlarını görmek için cüzdanını bağla
          </p>
          <ConnectButton />
        </div>
      ) : !deployed ? (
        <div className="glass-card flex flex-col items-center gap-3 p-8">
          <p className="text-sm text-[var(--accent-amber)]">
            Yanlış ağdasın. Envanterini görmek için cüzdanını <b>Base</b> ağına geçir.
          </p>
          <button
            type="button"
            className="cta-btn"
            onClick={() => switchChain({ chainId: base.id })}
          >
            Base ağına geç
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {ACCESSORIES.map((a, i) => {
            const bal = data?.[i]?.result as bigint | undefined;
            const count = bal ? Number(bal) : 0;
            return (
              <div
                key={a.id}
                className={`glass-card flex flex-col items-center gap-2 p-4 ${
                  count === 0 ? "opacity-50" : ""
                }`}
              >
                <span className="text-4xl">{a.icon}</span>
                <span className="text-sm font-medium">{a.name}</span>
                <span
                  className="text-xs capitalize"
                  style={{ color: RARITY_COLOR[a.rarity] }}
                >
                  {a.rarity}
                </span>
                <span className="text-sm font-bold">×{count}</span>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-[var(--text-muted)]">
        Aksesuarlar streak/seviye ödülü olarak mint edilir (ERC-1155). Mağaza/market Faz5+ ile gelir.
      </p>
    </main>
  );
}
